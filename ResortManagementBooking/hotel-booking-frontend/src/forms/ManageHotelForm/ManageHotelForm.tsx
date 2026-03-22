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
import DiscountsSection from "./DiscountsSection";
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
  starRating: number;
  facilities: string[];
  imageFiles?: FileList;
  imageUrls: string[];
  adultCount: number;
  childCount: number;
  amenities?: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
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
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
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
  }>;
  packages?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    includedCottages: string[];
    includedRooms: string[];
    includedAmenities: string[];
  }>;
};

type Props = {
  hotel?: HotelType;
  onSave: (hotelFormData: FormData) => void;
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
      hasDayRate: true,
      hasNightRate: true,
      dayRateCheckInTime: "08:00 AM",
      dayRateCheckOutTime: "05:00 PM",
      nightRateCheckInTime: "02:00 PM",
      nightRateCheckOutTime: "02:00 PM",
      starRating: 3,
      adultCount: 1,
      childCount: 0,
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
        cancellationPolicy: "",
        petPolicy: "",
        smokingPolicy: "",
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
        hasDayRate: hotel.hasDayRate !== undefined ? hotel.hasDayRate : true,
        hasNightRate: hotel.hasNightRate !== undefined ? hotel.hasNightRate : true,
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
          cancellationPolicy: "",
          petPolicy: "",
          smokingPolicy: "",
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
      };
      reset(formData);
    }
  }, [hotel, reset]);

  const onSubmit = handleSubmit((formDataJson: HotelFormData) => {
    console.log("Form submitted with data:", formDataJson);
    console.log("Type field value:", formDataJson.type);
    console.log("Facilities field value:", formDataJson.facilities);
    
    const formData = new FormData();
    if (hotel) {
      formData.append("hotelId", hotel._id);
    }
    formData.append("name", formDataJson.name);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);
    formData.append("description", formDataJson.description);
    formDataJson.type.forEach((t, idx) => {
      formData.append(`type[${idx}]`, t);
    });
    formData.append("dayRate", formDataJson.dayRate.toString());
    formData.append("nightRate", formDataJson.nightRate.toString());
    formData.append("hasDayRate", formDataJson.hasDayRate.toString());
    formData.append("hasNightRate", formDataJson.hasNightRate.toString());
    formData.append("dayRateCheckInTime", formDataJson.dayRateCheckInTime || "");
    formData.append("dayRateCheckOutTime", formDataJson.dayRateCheckOutTime || "");
    formData.append("nightRateCheckInTime", formDataJson.nightRateCheckInTime || "");
    formData.append("nightRateCheckOutTime", formDataJson.nightRateCheckOutTime || "");
    formData.append("starRating", formDataJson.starRating.toString());
    formData.append("adultCount", formDataJson.adultCount.toString());
    formData.append("childCount", formDataJson.childCount.toString());

    formDataJson.facilities.forEach((facility, index) => {
      formData.append(`facilities[${index}]`, facility);
    });

    // Add contact information
    if (formDataJson.contact) {
      formData.append("contact.phone", formDataJson.contact.phone || "");
      formData.append("contact.email", formDataJson.contact.email || "");
      formData.append("contact.website", formDataJson.contact.website || "");
      formData.append("contact.facebook", formDataJson.contact.facebook || "");
      formData.append("contact.instagram", formDataJson.contact.instagram || "");
      formData.append("contact.tiktok", formDataJson.contact.tiktok || "");
    }

    // Add policies
    if (formDataJson.policies) {
      formData.append(
        "policies.checkInTime",
        formDataJson.policies.checkInTime || ""
      );
      formData.append(
        "policies.checkOutTime",
        formDataJson.policies.checkOutTime || ""
      );
      formData.append(
        "policies.cancellationPolicy",
        formDataJson.policies.cancellationPolicy || ""
      );
      formData.append(
        "policies.petPolicy",
        formDataJson.policies.petPolicy || ""
      );
      formData.append(
        "policies.smokingPolicy",
        formDataJson.policies.smokingPolicy || ""
      );
    }

    // Add amenities
    if (formDataJson.amenities && formDataJson.amenities.length > 0) {
      formDataJson.amenities.forEach((amenity, index) => {
        formData.append(`amenities[${index}][id]`, amenity.id);
        formData.append(`amenities[${index}][name]`, amenity.name);
        formData.append(`amenities[${index}][price]`, amenity.price.toString());
        formData.append(`amenities[${index}][description]`, amenity.description || "");
      });
    }

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data JSON:', formDataJson);
    console.log('Rooms being sent:', formDataJson.rooms);
    console.log('Cottages being sent:', formDataJson.cottages);
    console.log('Packages being sent:', formDataJson.packages);

    // Add rooms
    if (formDataJson.rooms && formDataJson.rooms.length > 0) {
      formDataJson.rooms.forEach((room, index) => {
        formData.append(`rooms[${index}][id]`, room.id);
        formData.append(`rooms[${index}][name]`, room.name);
        formData.append(`rooms[${index}][type]`, room.type);
        formData.append(`rooms[${index}][pricePerNight]`, room.pricePerNight.toString());
        formData.append(`rooms[${index}][minOccupancy]`, room.minOccupancy.toString());
        formData.append(`rooms[${index}][maxOccupancy]`, room.maxOccupancy.toString());
        formData.append(`rooms[${index}][description]`, room.description || "");
        if (room.amenities && room.amenities.length > 0) {
          room.amenities.forEach((amenity, amenityIndex) => {
            formData.append(`rooms[${index}][amenities][${amenityIndex}]`, amenity);
          });
        }
      });
    }

    // Add cottages
    if (formDataJson.cottages && formDataJson.cottages.length > 0) {
      formDataJson.cottages.forEach((cottage, index) => {
        formData.append(`cottages[${index}][id]`, cottage.id);
        formData.append(`cottages[${index}][name]`, cottage.name);
        formData.append(`cottages[${index}][type]`, cottage.type);
        formData.append(`cottages[${index}][pricePerNight]`, cottage.pricePerNight.toString());
        formData.append(`cottages[${index}][dayRate]`, cottage.dayRate.toString());
        formData.append(`cottages[${index}][nightRate]`, cottage.nightRate.toString());
        formData.append(`cottages[${index}][hasDayRate]`, cottage.hasDayRate.toString());
        formData.append(`cottages[${index}][hasNightRate]`, cottage.hasNightRate.toString());
        formData.append(`cottages[${index}][minOccupancy]`, cottage.minOccupancy.toString());
        formData.append(`cottages[${index}][maxOccupancy]`, cottage.maxOccupancy.toString());
        formData.append(`cottages[${index}][description]`, cottage.description || "");
        if (cottage.amenities && cottage.amenities.length > 0) {
          cottage.amenities.forEach((amenity, amenityIndex) => {
            formData.append(`cottages[${index}][amenities][${amenityIndex}]`, amenity);
          });
        }
      });
    }

    // Add discounts
    if (formDataJson.discounts) {
      formData.append("discounts.seniorCitizenEnabled", formDataJson.discounts.seniorCitizenEnabled.toString());
      formData.append("discounts.seniorCitizenPercentage", formDataJson.discounts.seniorCitizenPercentage.toString());
      formData.append("discounts.pwdEnabled", formDataJson.discounts.pwdEnabled.toString());
      formData.append("discounts.pwdPercentage", formDataJson.discounts.pwdPercentage.toString());
    }

    // Add packages
    if (formDataJson.packages && formDataJson.packages.length > 0) {
      formDataJson.packages.forEach((pkg, index) => {
        formData.append(`packages[${index}][id]`, pkg.id);
        formData.append(`packages[${index}][name]`, pkg.name);
        formData.append(`packages[${index}][description]`, pkg.description);
        formData.append(`packages[${index}][price]`, pkg.price.toString());
        pkg.includedCottages.forEach((cottageId, cottageIndex) => {
          formData.append(`packages[${index}][includedCottages][${cottageIndex}]`, cottageId);
        });
        pkg.includedRooms.forEach((roomId, roomIndex) => {
          formData.append(`packages[${index}][includedRooms][${roomIndex}]`, roomId);
        });
        pkg.includedAmenities.forEach((amenityId, amenityIndex) => {
          formData.append(`packages[${index}][includedAmenities][${amenityIndex}]`, amenityId);
        });
      });
    }

    // Add entrance fees
    if (formDataJson.adultEntranceFee) {
      formData.append("adultEntranceFee.dayRate", formDataJson.adultEntranceFee.dayRate.toString());
      formData.append("adultEntranceFee.nightRate", formDataJson.adultEntranceFee.nightRate.toString());
      formData.append("adultEntranceFee.pricingModel", formDataJson.adultEntranceFee.pricingModel);
      if (formDataJson.adultEntranceFee.groupQuantity) {
        formData.append("adultEntranceFee.groupQuantity", formDataJson.adultEntranceFee.groupQuantity.toString());
      }
    }

    if (formDataJson.childEntranceFee && formDataJson.childEntranceFee.length > 0) {
      formDataJson.childEntranceFee.forEach((childFee, index) => {
        formData.append(`childEntranceFee[${index}][id]`, childFee.id);
        formData.append(`childEntranceFee[${index}][minAge]`, childFee.minAge.toString());
        formData.append(`childEntranceFee[${index}][maxAge]`, childFee.maxAge.toString());
        formData.append(`childEntranceFee[${index}][dayRate]`, childFee.dayRate.toString());
        formData.append(`childEntranceFee[${index}][nightRate]`, childFee.nightRate.toString());
        formData.append(`childEntranceFee[${index}][pricingModel]`, childFee.pricingModel);
        if (childFee.groupQuantity) {
          formData.append(`childEntranceFee[${index}][groupQuantity]`, childFee.groupQuantity.toString());
        }
      });
    }

    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    if (formDataJson.imageFiles && formDataJson.imageFiles.length > 0) {
      Array.from(formDataJson.imageFiles).forEach((imageFile) => {
        formData.append(`imageFiles`, imageFile);
      });
    }

    // Log FormData contents
    console.log("FormData being sent:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("FormData entries count:", formData.entries.length);

    onSave(formData);
  });

  return (
    <FormProvider {...formMethods}>
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection />
        <TypeSection />
        <FacilitiesSection />
        <GuestsSection />
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
