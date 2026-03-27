import mongoose from "mongoose";

// Local types file to replace shared directory dependency

export enum UserRole {
  Admin = "Admin",
  User = "User",
  Owner = "Owner",
  SuperAdmin = "SuperAdmin",
}

export interface UserDocument extends mongoose.Document {
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
  accountVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  birthdate?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

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
  lastUpdated: number;
  starRating: number;
  dayRate?: number;
  nightRate?: number;
  hasDayRate?: boolean;
  hasNightRate?: boolean;
  rooms?: any[];
  cottages?: any[];
  packages?: any[];
  policies?: any[];
  gcashNumber?: string;
  downPaymentPercentage?: number;
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
