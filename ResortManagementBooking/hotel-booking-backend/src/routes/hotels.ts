import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import User from "../models/user";
import { BookingType, HotelSearchResponse } from "../../../shared/types";
import { param, body, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    // Show all resorts that are not explicitly rejected (isApproved !== false)
    // New resorts default to isApproved: true, so they appear immediately
    query.isApproved = { $ne: false };

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { nightRate: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { nightRate: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    // Use lean() for faster query - only fetch needed fields
    const hotel = await Hotel.findById(hotelId).select('nightRate name').lean();
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }

    const totalCost = numberOfNights > 0 ? hotel.nightRate * numberOfNights : hotel.nightRate;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "usd",
      metadata: {
        hotelId,
        userId: req.userId,
      },
    });

    if (!paymentIntent.client_secret) {
      return res.status(500).json({ message: "Error creating payment intent" });
    }

    const response = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };

    res.send(response);
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;
      const userId = req.userId;
      
      console.log("Booking request received:", req.body);
      console.log("User ID:", userId);
      console.log("Hotel ID:", hotelId);
      
      // Validate required fields
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        adultCount, 
        childCount, 
        checkIn, 
        checkOut, 
        checkInTime, 
        checkOutTime,
        totalCost,
        basePrice,
        selectedRooms,
        selectedCottages,
        selectedAmenities,
        paymentMethod,
        specialRequests
      } = req.body;
      
      // Verify hotel exists
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      // Create the booking
      const booking = new Booking({
        userId,
        hotelId,
        firstName,
        lastName,
        email,
        phone: phone || "",
        adultCount: adultCount || 1,
        childCount: childCount || 0,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        checkInTime: checkInTime || "12:00",
        checkOutTime: checkOutTime || "11:00",
        totalCost: totalCost || basePrice || 0,
        basePrice: basePrice || totalCost || 0,
        selectedRooms: selectedRooms || [],
        selectedCottages: selectedCottages || [],
        selectedAmenities: selectedAmenities || [],
        paymentMethod: paymentMethod || "card",
        specialRequests: specialRequests || "",
        status: "pending",
        paymentStatus: "pending"
      });
      
      await booking.save();
      
      // Update hotel booking count
      await Hotel.findByIdAndUpdate(hotelId, {
        $inc: { totalBookings: 1 }
      });
      
      // Update user booking count
      await User.findByIdAndUpdate(userId, {
        $inc: { totalBookings: 1 }
      });
      
      console.log("Booking created successfully:", booking._id);
      
      res.status(201).json({
        message: "Booking created successfully",
        bookingId: booking._id,
        booking
      });
    } catch (error) {
      console.error("Booking error:", error);
      res.status(500).json({ 
        message: "Booking failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  // If no destination is provided, don't add destination filter
  // This will return all approved resorts
  if (queryParams.destination && queryParams.destination.trim() !== "") {
    const destination = queryParams.destination.trim();

    constructedQuery.$or = [
      { name: { $regex: destination, $options: "i" } },
      { city: { $regex: destination, $options: "i" } },
      { country: { $regex: destination, $options: "i" } },
      { type: { $regex: destination, $options: "i" } },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.nightRate = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export default router;
