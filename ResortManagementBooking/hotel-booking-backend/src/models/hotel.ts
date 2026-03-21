import mongoose from "mongoose";
import { HotelType } from "../../../shared/types";

const hotelSchema = new mongoose.Schema<HotelType>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    description: { type: String, required: true },
    type: [{ type: String, required: true }],
    adultCount: { type: Number, required: true },
    childCount: { type: Number, required: true },
    facilities: [{ type: String, required: true }],
    dayRate: { type: Number, required: true },
    nightRate: { type: Number, required: true },
    hasDayRate: { type: Boolean, default: true },
    hasNightRate: { type: Boolean, default: true },
    starRating: { type: Number, required: true, min: 1, max: 5 },
    imageUrls: [{ type: String, required: true }],
    lastUpdated: { type: Date, required: true },
    // Remove embedded bookings - we'll use separate collection
    // bookings: [bookingSchema],

    // New fields for better hotel management and analytics
    location: {
      latitude: Number,
      longitude: Number,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    contact: {
      phone: String,
      email: String,
      website: String,
      facebook: String,
      instagram: String,
      tiktok: String,
    },
    policies: {
      checkInTime: String,
      checkOutTime: String,
      dayCheckInTime: String,
      dayCheckOutTime: String,
      nightCheckInTime: String,
      nightCheckOutTime: String,
      cancellationPolicy: String,
      petPolicy: String,
      smokingPolicy: String,
    },
    amenities: [
      {
        id: String,
        name: String,
        price: Number,
        description: String,
      },
    ],
    rooms: [
      {
        id: String,
        name: String,
        type: String,
        pricePerNight: Number,
        minOccupancy: Number,
        maxOccupancy: Number,
        description: String,
        amenities: [String],
      },
    ],
    cottages: [
      {
        id: String,
        name: String,
        type: String,
        pricePerNight: Number,
        dayRate: Number,
        nightRate: Number,
        hasDayRate: Boolean,
        hasNightRate: Boolean,
        minOccupancy: Number,
        maxOccupancy: Number,
        description: String,
        amenities: [String],
      },
    ],
    packages: [
      {
        id: String,
        name: String,
        description: String,
        price: Number,
        includedCottages: [String],
        includedRooms: [String],
        includedAmenities: [String],
      },
    ],
    // Analytics and performance fields
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // Discount system fields
    discounts: {
      seniorCitizenEnabled: { type: Boolean, default: true },
      seniorCitizenPercentage: { type: Number, default: 20 },
      pwdEnabled: { type: Boolean, default: true },
      pwdPercentage: { type: Number, default: 20 },
      customDiscounts: [
        {
          id: String,
          name: String,
          percentage: Number,
          promoCode: String,
          isEnabled: { type: Boolean, default: true },
          maxUses: Number,
          validUntil: Date,
        },
      ],
    },
    // Approval system fields
    isApproved: { type: Boolean, default: true },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    // Entrance fee fields
    adultEntranceFee: {
      dayRate: { type: Number, default: 0 },
      nightRate: { type: Number, default: 0 },
      pricingModel: { type: String, enum: ["per_head", "per_group"], default: "per_head" },
      groupQuantity: { type: Number, default: 1 },
    },
    childEntranceFee: [
      {
        id: { type: String, required: true },
        minAge: { type: Number, required: true },
        maxAge: { type: Number, required: true },
        dayRate: { type: Number, required: true },
        nightRate: { type: Number, required: true },
        pricingModel: { type: String, enum: ["per_head", "per_group"], default: "per_head" },
        groupQuantity: { type: Number, default: 1 },
      },
    ],
    // Audit fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add compound indexes for better query performance
hotelSchema.index({ city: 1, starRating: 1 });
hotelSchema.index({ dayRate: 1, nightRate: 1, starRating: 1 });
hotelSchema.index({ userId: 1, createdAt: -1 });

const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);
export default Hotel;
