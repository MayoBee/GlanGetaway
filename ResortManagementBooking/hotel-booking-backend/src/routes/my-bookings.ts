import express, { Request, Response } from "express";
import mongoose from "mongoose";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import Booking from "../models/booking";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // First, get all bookings for this user
    const bookings = await Booking.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
    
    if (!bookings || bookings.length === 0) {
      return res.status(200).json([]);
    }
    
    // Group bookings by hotelId
    const hotelBookingsMap = new Map();
    
    for (const booking of bookings) {
      const hotelId = booking.hotelId?.toString();
      if (!hotelId) continue;
      
      if (!hotelBookingsMap.has(hotelId)) {
        // Fetch hotel info
        const hotel = await Hotel.findById(hotelId).lean();
        if (hotel) {
          hotelBookingsMap.set(hotelId, {
            ...hotel,
            bookings: []
          });
        }
      }
      
      const hotelData = hotelBookingsMap.get(hotelId);
      if (hotelData) {
        hotelData.bookings.push(booking);
      }
    }
    
    // Convert map to array
    const results = Array.from(hotelBookingsMap.values());
    
    res.status(200).send(results);
  } catch (error) {
    console.log("Error fetching bookings:", error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
