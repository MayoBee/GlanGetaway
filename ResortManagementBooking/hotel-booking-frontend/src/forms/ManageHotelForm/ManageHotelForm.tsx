import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import FreshRoomsSection from "./FreshRoomsSection";
import FreshCottagesSection from "./FreshCottagesSection";
import FreshPackagesSection from "./FreshPackagesSection";
import AmenitiesSection from "./AmenitiesSection";
import GuestsSection from "./GuestsSection";
import PoliciesSection from "./PoliciesSection";
import ImagesSection from "./ImagesSection";
import ContactSection from "./ContactSection";
import { HotelType } from "../../../../shared/types";
import { useEffect } from "react";

export type HotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string[];
  dayRate: number;
  nightRate: number;
  hasDayRate: boolean;
  hasNightRate: boolean;
  dayRateCheckInTime: string;
  dayRateCheckOutTime: string;
  nightRateCheckInTime: string;
  nightRateCheckOutTime: string;
  hasNightRateTimeRestrictions: boolean;
  starRating: number;
  facilities: string[];
  imageFiles?: FileList;
  imageUrls: string[];
  amenities?: Array<{
    id: string;
    name: string;
    price: number;
    units: number;
    description?: string;
    imageUrl?: string;
    isConfirmed?: boolean;
  }>;
  rooms?: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    minOccupancy: number;
    maxOccupancy: number;
    units: number;
    description?: string;
    amenities?: string[];
    imageUrl?: string;
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
    units: number;
    description?: string;
    amenities?: string[];
    imageUrl?: string;
    isConfirmed?: boolean;
  }>;
  // New fields
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
    resortPolicies?: Array<{
      id: string;
      title: string;
      description: string;
      isConfirmed?: boolean;
    }>;
  };
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
  isFeatured: boolean;
  discounts?: {
    seniorCitizenEnabled: boolean;
    seniorCitizenPercentage: number;
    pwdEnabled: boolean;
    pwdPercentage: number;
  };
  // Entrance fee fields
  adultEntranceFee?: {
    dayRate: number;
    nightRate: number;
    pricingModel: "per_head" | "per_group";
    groupQuantity?: number;
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
  packages?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    includedCottages: Array<{
      id: string;
      name: string;
      type: string;
      pricePerNight: number;
      dayRate: number;
      nightRate: number;
      hasDayRate: boolean;
      hasNightRate: boolean;
      maxOccupancy: number;
      units: number;
      description?: string;
    }>;
    includedRooms: Array<{
      id: string;
      name: string;
      type: string;
      pricePerNight: number;
      maxOccupancy: number;
      units: number;
      description?: string;
    }>;
    includedAmenities: Array<{
      id: string;
      name: string;
      price: number;
      units: number;
      description?: string;
    }>;
    customItems: Array<{
      id: string;
      name: string;
      description?: string;
    }>;
    includedAdultEntranceFee: boolean;
    includedChildEntranceFee: boolean;
    isConfirmed?: boolean;
  }>;
};

type Props = {
  hotel?: HotelType;
  onSave: (hotelFormData: HotelFormData) => void;
  isLoading: boolean;
};

const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
  const formMethods = useForm<HotelFormData>({
    mode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      name: "",
      city: "",
      country: "",
      description: "",
      type: [],
      dayRate: 0,
      nightRate: 0,
      hasDayRate: false,
      hasNightRate: false,
      dayRateCheckInTime: "08:00 AM",
      dayRateCheckOutTime: "05:00 PM",
      nightRateCheckInTime: "02:00 PM",
      nightRateCheckOutTime: "02:00 PM",
      starRating: 3,
      facilities: [],
      imageUrls: [],
      contact: {
        phone: "",
        email: "",
        website: "",
        facebook: "",
        instagram: "",
        tiktok: "",
      },
      policies: {
        checkInTime: "",
        checkOutTime: "",
        dayCheckInTime: "",
        dayCheckOutTime: "",
        nightCheckInTime: "",
        nightCheckOutTime: "",
        resortPolicies: [],
      },
      amenities: [],
      rooms: [],
      cottages: [],
      discounts: {
        seniorCitizenEnabled: true,
        seniorCitizenPercentage: 20,
        pwdEnabled: true,
        pwdPercentage: 20,
      },
      packages: [],
      isFeatured: false,
      adultEntranceFee: {
        dayRate: 0,
        nightRate: 0,
        pricingModel: "per_head",
        groupQuantity: 1,
      },
      childEntranceFee: [],
    },
  });
  const { handleSubmit, reset } = formMethods;

  useEffect(() => {
    if (hotel) {
      // Ensure contact and policies are properly initialized
      const formData = {
        ...hotel,
        // Handle the new day/night rate fields with fallbacks
        dayRate: hotel.dayRate || 0,
        nightRate: hotel.nightRate || 0,
        hasDayRate: hotel.hasDayRate !== undefined ? hotel.hasDayRate : false,
        hasNightRate: hotel.hasNightRate !== undefined ? hotel.hasNightRate : false,
        dayRateCheckInTime: (hotel as any).dayRateCheckInTime || "08:00 AM",
        dayRateCheckOutTime: (hotel as any).dayRateCheckOutTime || "05:00 PM",
        nightRateCheckInTime: (hotel as any).nightRateCheckInTime || "02:00 PM",
        nightRateCheckOutTime: (hotel as any).nightRateCheckOutTime || "02:00 PM",
        contact: hotel.contact || {
          phone: "",
          email: "",
          website: "",
          facebook: "",
          instagram: "",
          tiktok: "",
        },
        policies: hotel.policies || {
          checkInTime: "",
          checkOutTime: "",
          dayCheckInTime: "",
          dayCheckOutTime: "",
          nightCheckInTime: "",
          nightCheckOutTime: "",
          resortPolicies: [],
        },
        rooms: hotel.rooms || [],
        cottages: hotel.cottages || [],
        discounts: hotel.discounts || {
          seniorCitizenEnabled: true,
          seniorCitizenPercentage: 20,
          pwdEnabled: true,
          pwdPercentage: 20
        },
        packages: hotel.packages || [],
        adultEntranceFee: hotel.adultEntranceFee || {
          dayRate: 0,
          nightRate: 0,
          pricingModel: "per_head",
          groupQuantity: 1,
        },
        childEntranceFee: hotel.childEntranceFee || [],
        imageUrls: hotel.imageUrls || [],
      };
      reset(formData);
    }
  }, [hotel, reset]);

  const handleSave = async (formDataJson: HotelFormData) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data JSON:', formDataJson);
    console.log('Rooms being sent:', formDataJson.rooms);
    console.log('Cottages being sent:', formDataJson.cottages);
    console.log('Packages being sent:', formDataJson.packages);

    // For JSON endpoint, send the data directly as JSON
    // This bypasses FormData issues and ensures rooms/cottages/packages are preserved
    onSave(formDataJson);
  };

  const onSubmit = handleSubmit(handleSave);

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection />
        <GuestsSection />
        <TypeSection />
        <FacilitiesSection />
        <FreshRoomsSection />
        <FreshCottagesSection />
        <AmenitiesSection />
        <FreshPackagesSection />
        <ContactSection />
        <PoliciesSection />
        <ImagesSection />
        <span className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-600 text-white  px-6 py-2 rounded-lg font-semibold hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageHotelForm;
