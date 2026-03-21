import express, { Request, Response } from "express";
import Booking from "../models/booking";
import Hotel from "../models/hotel";
import User from "../models/user";
import verifyToken from "../middleware/auth";
import { body, param, validationResult } from "express-validator";

const router = express.Router();

// Get all bookings (admin only)
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("hotelId", "name city country");

    res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// Get bookings by hotel ID (for hotel owners)
router.get(
  "/hotel/:hotelId",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { hotelId } = req.params;

      // Verify the hotel belongs to the authenticated user
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      if (hotel.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await Booking.find({ hotelId })
        .sort({ createdAt: -1 })
        .populate("userId", "firstName lastName email");

      res.status(200).json(bookings);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to fetch hotel bookings" });
    }
  }
);

// Get booking by ID
router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      "hotelId",
      "name city country imageUrls"
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch booking" });
  }
});

// Update booking status
router.patch(
  "/:id/status",
  verifyToken,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled", "completed", "refunded"])
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || "Validation error" });
    }

    try {
      const { status, cancellationReason } = req.body;

      const updateData: any = { status };
      if (status === "cancelled" && cancellationReason) {
        updateData.cancellationReason = cancellationReason;
      }
      if (status === "refunded") {
        updateData.refundAmount = req.body.refundAmount || 0;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update booking" });
    }
  }
);

// Update payment status
router.patch(
  "/:id/payment",
  verifyToken,
  [
    body("paymentStatus")
      .isIn(["pending", "paid", "failed", "refunded"])
      .withMessage("Invalid payment status"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || "Validation error" });
    }

    try {
      const { paymentStatus, paymentMethod } = req.body;

      const updateData: any = { paymentStatus };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.status(200).json(booking);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to update payment status" });
    }
  }
);

// Delete booking (admin only)
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update hotel analytics
    await Hotel.findByIdAndUpdate(booking.hotelId, {
      $inc: {
        totalBookings: -1,
        totalRevenue: -(booking.totalCost || 0),
      },
    });

    // Update user analytics
    await User.findByIdAndUpdate(booking.userId, {
      $inc: {
        totalBookings: -1,
        totalSpent: -(booking.totalCost || 0),
      },
    });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to delete booking" });
  }
});

// Verify booking by resort owner
router.patch(
  "/:id/verify-by-owner",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { verified, verificationNote } = req.body;
      
      // Find the booking
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get the hotel to check ownership
      const hotel = await Hotel.findById(booking.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      // Check if the user is the resort owner
      if (hotel.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied. Only the resort owner can verify bookings." });
      }
      
      // Update the booking verification status
      booking.verifiedByOwner = verified;
      booking.ownerVerificationNote = verificationNote || (verified ? "Verified by resort owner" : "Verification rejected");
      booking.ownerVerifiedAt = verified ? new Date() : undefined;
      
      await booking.save();
      
      res.status(200).json({
        message: verified ? "Booking verified successfully" : "Booking verification rejected",
        booking
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to verify booking" });
    }
  }
);

// User edit booking - Reschedule booking (change dates)
router.patch(
  "/:id/reschedule",
  verifyToken,
  [
    body("checkIn").isISO8601().toDate().withMessage("Valid check-in date is required"),
    body("checkOut").isISO8601().toDate().withMessage("Valid check-out date is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || "Validation error" });
    }

    try {
      const { id } = req.params;
      const { checkIn, checkOut, reason } = req.body;
      
      // Find the booking
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if the user owns this booking
      if (booking.userId.toString() !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if booking can be rescheduled (not cancelled or completed)
      if (booking.status === "cancelled" || booking.status === "completed") {
        return res.status(400).json({ message: "Cannot reschedule a cancelled or completed booking" });
      }
      
      // Check if within 8-hour change window
      if (!booking.canModify || (booking.changeWindowDeadline && new Date() > booking.changeWindowDeadline)) {
        return res.status(400).json({ 
          message: "Cannot modify booking after 8-hour window. The change window has expired.",
          changeWindowDeadline: booking.changeWindowDeadline,
          currentTime: new Date()
        });
      }
      
      // Store old dates for history
      const oldCheckIn = booking.checkIn;
      const oldCheckOut = booking.checkOut;
      
      // Update the booking with new dates
      booking.checkIn = new Date(checkIn);
      booking.checkOut = new Date(checkOut);
      booking.rescheduleHistory = booking.rescheduleHistory || [];
      booking.rescheduleHistory.push({
        oldCheckIn,
        oldCheckOut,
        newCheckIn: new Date(checkIn),
        newCheckOut: new Date(checkOut),
        reason: reason || "User requested reschedule",
        requestedAt: new Date(),
        status: "approved" // Auto-approved for now
      });
      
      await booking.save();
      
      res.status(200).json({
        message: "Booking rescheduled successfully",
        booking
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to reschedule booking" });
    }
  }
);

// User add rooms/amenities to existing booking
router.patch(
  "/:id/add-items",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { selectedRooms, selectedCottages, selectedAmenities, additionalAmount } = req.body;
      
      // Find the booking
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if the user owns this booking
      if (booking.userId.toString() !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if booking can be modified (not cancelled or completed)
      if (booking.status === "cancelled" || booking.status === "completed") {
        return res.status(400).json({ message: "Cannot modify a cancelled or completed booking" });
      }
      
      // Check if within 8-hour change window
      if (!booking.canModify || (booking.changeWindowDeadline && new Date() > booking.changeWindowDeadline)) {
        return res.status(400).json({ 
          message: "Cannot modify booking after 8-hour window. The change window has expired.",
          changeWindowDeadline: booking.changeWindowDeadline,
          currentTime: new Date()
        });
      }
      
      // Add new rooms if provided
      if (selectedRooms && selectedRooms.length > 0) {
        booking.selectedRooms = [
          ...(booking.selectedRooms || []),
          ...selectedRooms
        ];
      }
      
      // Add new cottages if provided
      if (selectedCottages && selectedCottages.length > 0) {
        booking.selectedCottages = [
          ...(booking.selectedCottages || []),
          ...selectedCottages
        ];
      }
      
      // Add new amenities if provided
      if (selectedAmenities && selectedAmenities.length > 0) {
        booking.selectedAmenities = [
          ...(booking.selectedAmenities || []),
          ...selectedAmenities
        ];
      }
      
      // Update total cost
      if (additionalAmount) {
        booking.totalCost = (booking.totalCost || 0) + additionalAmount;
      }
      
      // Add modification history
      booking.modificationHistory = booking.modificationHistory || [];
      booking.modificationHistory.push({
        type: "add_items",
        addedRooms: selectedRooms?.length || 0,
        addedCottages: selectedCottages?.length || 0,
        addedAmenities: selectedAmenities?.length || 0,
        additionalAmount: additionalAmount || 0,
        modifiedAt: new Date()
      });
      
      await booking.save();
      
      res.status(200).json({
        message: "Items added to booking successfully",
        booking
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to add items to booking" });
    }
  }
);

// User remove items from booking
router.patch(
  "/:id/remove-items",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { removeRoomIds, removeCottageIds, removeAmenityIds, refundAmount } = req.body;
      
      // Find the booking
      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if the user owns this booking
      if (booking.userId.toString() !== req.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if booking can be modified (not cancelled or completed)
      if (booking.status === "cancelled" || booking.status === "completed") {
        return res.status(400).json({ message: "Cannot modify a cancelled or completed booking" });
      }
      
      // Check if within 8-hour change window
      if (!booking.canModify || (booking.changeWindowDeadline && new Date() > booking.changeWindowDeadline)) {
        return res.status(400).json({ 
          message: "Cannot modify booking after 8-hour window. The change window has expired.",
          changeWindowDeadline: booking.changeWindowDeadline,
          currentTime: new Date()
        });
      }
      
      // Remove rooms
      if (removeRoomIds && removeRoomIds.length > 0 && booking.selectedRooms) {
        booking.selectedRooms = booking.selectedRooms.filter(
          (room) => !removeRoomIds.includes(room.id)
        );
      }
      
      // Remove cottages
      if (removeCottageIds && removeCottageIds.length > 0 && booking.selectedCottages) {
        booking.selectedCottages = booking.selectedCottages.filter(
          (cottage) => !removeCottageIds.includes(cottage.id)
        );
      }
      
      // Remove amenities
      if (removeAmenityIds && removeAmenityIds.length > 0 && booking.selectedAmenities) {
        booking.selectedAmenities = booking.selectedAmenities.filter(
          (amenity) => !removeAmenityIds.includes(amenity.id)
        );
      }
      
      // Update total cost
      if (refundAmount) {
        booking.totalCost = Math.max(0, (booking.totalCost || 0) - refundAmount);
      }
      
      // Add modification history
      booking.modificationHistory = booking.modificationHistory || [];
      booking.modificationHistory.push({
        type: "remove_items",
        removedRooms: removeRoomIds?.length || 0,
        removedCottages: removeCottageIds?.length || 0,
        removedAmenities: removeAmenityIds?.length || 0,
        refundAmount: refundAmount || 0,
        modifiedAt: new Date()
      });
      
      await booking.save();
      
      res.status(200).json({
        message: "Items removed from booking successfully",
        booking
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Unable to remove items from booking" });
    }
  }
);

export default router;
