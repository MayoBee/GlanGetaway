// Frontend types file - shared types for frontend

export interface HotelType {
  _id?: string;
  userId: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  imageUrls: string[];
  lastUpdated: number | Date;
  createdAt?: Date;
  starRating: number;
  averageRating?: number;
  dayRate?: number;
  nightRate?: number;
  hasDayRate?: boolean;
  hasNightRate?: boolean;
  rooms?: any[];
  cottages?: any[];
  packages?: any[];
  policies?: any;
  gcashNumber?: string;
  downPaymentPercentage?: number;
  isApproved?: boolean;
  approvedBy?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  location?: any;
  contact?: any;
}

export interface BookingType {
  _id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  adultCount: number;
  childCount: number;
  checkIn: Date;
  checkOut: Date;
  totalCost: number;
  hotelId: string;
  paymentIntentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  gcashPayment?: {
    referenceNumber: string;
    amount: number;
    paymentTime: Date;
    screenshotFile?: string;
  };
  isPwdBooking?: boolean;
  isSeniorCitizenBooking?: boolean;
  discountInfo?: {
    type: "pwd" | "senior_citizen" | null;
    percentage: number;
    amount: number;
  };
  phone?: string;
  specialRequests?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface HotelSearchResponse {
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  data: HotelType[];
}

export interface HotelWithBookingsType extends HotelType {
  bookings: BookingType[];
}

export interface ReviewType {
  _id?: string;
  userId: string;
  hotelId: string;
  text: string;
  rating: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StripePaymentInfo {
  paymentIntentId: string;
  clientSecret: string;
  totalCost: number;
}

export interface GCashPaymentInfo {
  referenceNumber: string;
  amount: number;
  paymentTime: Date;
  screenshotFile?: string;
}

export enum UserRole {
  Admin = "admin",
  User = "user", 
  Owner = "owner",
  SuperAdmin = "superadmin",
  ResortOwner = "resort_owner",
}

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  image?: string;
  role: UserRole;
  isActive: boolean;
  isPWD?: boolean;
  pwdId?: string;
  pwdIdVerified?: boolean;
  pwdVerifiedBy?: string;
  pwdVerifiedAt?: Date;
  accountVerified?: boolean;
  accountVerifiedBy?: string;
  accountVerifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  birthdate?: Date;
  phone?: string;
  staffProfile?: {
    department?: string;
    employeeId?: string;
    shiftSchedule?: any;
    hourlyRate?: number;
    isActive?: boolean;
  };
  permissions?: any;
}

export interface HotelFormData {
  _id?: string;
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  adultCount: number;
  childCount: number;
  facilities: string[];
  imageUrls: string[];
  starRating: number;
  dayRate?: number;
  nightRate?: number;
  hasDayRate?: boolean;
  hasNightRate?: boolean;
  rooms?: any[];
  cottages?: any[];
  packages?: any[];
  policies?: any;
  gcashNumber?: string;
  downPaymentPercentage?: number;
  location?: any;
  contact?: any;
}

export interface BookingFormData {
  paymentIntentId: string;
  phone: string;
  specialRequests: string;
  isPwdBooking: boolean;
  isSeniorCitizenBooking: boolean;
  discountInfo: { type: "pwd" | "senior_citizen" | null; percentage: number; amount: number; } | undefined;
  totalCost: number;
  // ... other fields
}
