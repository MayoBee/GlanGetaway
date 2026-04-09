export type HotelType = {
  _id: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string[];
  facilities: string[];
  dayRate: number;
  nightRate: number;
  hasDayRate: boolean;
  hasNightRate: boolean;
  dayRateCheckInTime: string;
  dayRateCheckOutTime: string;
  nightRateCheckInTime: string;
  nightRateCheckOutTime: string;
  starRating: number;
  imageUrls: string[];
  lastUpdated: Date;
  // New fields for better hotel management and analytics
  location?: {
    latitude: number;
    longitude: number;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };
  contact?: {
    phone: string;
    email: string;
    website: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  policies?: {
    checkInTime: string;
    checkOutTime: string;
    dayCheckInTime: string;
    dayCheckOutTime: string;
    nightCheckInTime: string;
    nightCheckOutTime: string;
    cancellationPolicy?: string;
    petPolicy?: string;
    smokingPolicy?: string;
    resortPolicies?: Array<{
      id: string;
      title: string;
      description: string;
      isConfirmed?: boolean;
    }>;
  };
  amenities?: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
    isConfirmed?: boolean;
  }>;
  rooms?: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    minOccupancy: number;
    maxOccupancy: number;
    description?: string;
    amenities?: string[];
    isConfirmed?: boolean;
  }>;
  cottages?: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    dayRate: number;
    nightRate: number;
    hasDayRate: boolean;
    hasNightRate: boolean;
    minOccupancy: number;
    maxOccupancy: number;
    description?: string;
    amenities?: string[];
    isConfirmed?: boolean;
  }>;
  totalBookings?: number;
  totalRevenue?: number;
  averageRating?: number;
  reviewCount?: number;
  occupancyRate?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  // Discount system fields
  discounts?: {
    seniorCitizenEnabled: boolean;
    seniorCitizenPercentage: number;
    pwdEnabled: boolean;
    pwdPercentage: number;
    customDiscounts?: Array<{
      id: string;
      name: string;
      percentage: number;
      promoCode: string;
      isEnabled: boolean;
      maxUses?: number;
      validUntil?: string;
    }>;
  };
  // Package offers
  packages?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    includedCottages: string[];
    includedRooms: string[];
    includedAmenities: string[];
    includedAdultEntranceFee: boolean;
    includedChildEntranceFee: boolean;
    isConfirmed?: boolean;
  }>;
  // Approval system fields
  isApproved?: boolean;
  status?: string; // New field for status
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  // Entrance fee fields
  adultEntranceFee?: {
    dayRate: number;
    nightRate: number;
    pricingModel: "per_head" | "per_group";
    groupQuantity?: number; // Only required if pricingModel is "per_group"
  };
  childEntranceFee?: Array<{
    id: string;
    minAge: number;
    maxAge: number;
    dayRate: number;
    nightRate: number;
    pricingModel: "per_head" | "per_group";
    groupQuantity?: number;
    isConfirmed?: boolean;
  }>;
  downPaymentPercentage?: number;
  gcashNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
};