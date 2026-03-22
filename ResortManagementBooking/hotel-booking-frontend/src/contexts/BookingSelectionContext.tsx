import React, { createContext, useContext, useState, ReactNode } from "react";

export interface SelectedRoom {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  maxOccupancy: number;
  description?: string;
}

export interface SelectedCottage {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  dayRate: number;
  nightRate: number;
  hasDayRate: boolean;
  hasNightRate: boolean;
  maxOccupancy: number;
  description?: string;
}

export interface SelectedAmenity {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface SelectedPackage {
  id: string;
  name: string;
  description: string;
  price: number;
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
    description?: string;
  }>;
  includedRooms: Array<{
    id: string;
    name: string;
    type: string;
    pricePerNight: number;
    maxOccupancy: number;
    description?: string;
  }>;
  includedAmenities: Array<{
    id: string;
    name: string;
    price: number;
    description?: string;
  }>;
}

interface BookingSelectionContextType {
  selectedRooms: SelectedRoom[];
  selectedCottages: SelectedCottage[];
  selectedAmenities: SelectedAmenity[];
  selectedPackages: SelectedPackage[];
  basePrice: number;
  accommodationTotal: number;
  amenitiesTotal: number;
  packagesTotal: number;
  totalCost: number;
  downPaymentAmount: number;
  remainingAmount: number;
  numberOfNights: number;
  depositPercentage: number;
  selectedRateType: 'day' | 'night';
  addRoom: (room: SelectedRoom) => void;
  removeRoom: (roomId: string) => void;
  addCottage: (cottage: SelectedCottage) => void;
  removeCottage: (cottageId: string) => void;
  addAmenity: (amenity: SelectedAmenity) => void;
  removeAmenity: (amenityId: string) => void;
  addPackage: (pkg: SelectedPackage) => void;
  removePackage: (packageId: string) => void;
  clearSelections: () => void;
  setBasePrice: (price: number) => void;
  setNumberOfNights: (nights: number) => void;
  setDepositPercentage: (percentage: number) => void;
  setRateType: (rateType: 'day' | 'night') => void;
  calculateTotal: () => void;
  isRoomSelected: (roomId: string) => boolean;
  isCottageSelected: (cottageId: string) => boolean;
  isAmenitySelected: (amenityId: string) => boolean;
  isPackageSelected: (packageId: string) => boolean;
}

const BookingSelectionContext = createContext<BookingSelectionContextType | undefined>(undefined);

export const useBookingSelection = () => {
  const context = useContext(BookingSelectionContext);
  if (!context) {
    throw new Error("useBookingSelection must be used within BookingSelectionProvider");
  }
  return context;
};

interface BookingSelectionProviderProps {
  children: ReactNode;
}

export const BookingSelectionProvider: React.FC<BookingSelectionProviderProps> = ({ children }) => {
  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [selectedCottages, setSelectedCottages] = useState<SelectedCottage[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<SelectedAmenity[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([]);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [numberOfNights, setNumberOfNights] = useState<number>(1);
  const [depositPercentage, setDepositPercentage] = useState<number>(50); // Default 50% down payment
  const [selectedRateType, setSelectedRateType] = useState<'day' | 'night'>('night');

  const calculateTotal = () => {
    const accommodationTotal = 
      selectedRooms.reduce((sum, room) => sum + (room.pricePerNight * numberOfNights), 0) +
      selectedCottages.reduce((sum, cottage) => {
        const rate = selectedRateType === 'day' ? cottage.dayRate : cottage.nightRate;
        return sum + (rate * numberOfNights);
      }, 0);
    
    const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + amenity.price, 0);
    const packagesTotal = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
    
    const total = basePrice + accommodationTotal + amenitiesTotal + packagesTotal;
    const downPayment = Math.round(total * (depositPercentage / 100));
    const remaining = total - downPayment;
    
    return {
      total,
      downPayment,
      remaining
    };
  };

  const accommodationTotal = 
    selectedRooms.reduce((sum, room) => sum + (room.pricePerNight * numberOfNights), 0) +
    selectedCottages.reduce((sum, cottage) => {
      const rate = selectedRateType === 'day' ? cottage.dayRate : cottage.nightRate;
      return sum + (rate * numberOfNights);
    }, 0);

  const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + amenity.price, 0);
  const packagesTotal = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);

  const totalCalculation = calculateTotal();
  const totalCost = totalCalculation.total;
  const downPaymentAmount = totalCalculation.downPayment;
  const remainingAmount = totalCalculation.remaining;

  const addRoom = (room: SelectedRoom) => {
    setSelectedRooms(prev => {
      const exists = prev.some(r => r.id === room.id);
      if (exists) return prev;
      return [...prev, room];
    });
  };

  const removeRoom = (roomId: string) => {
    setSelectedRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const addCottage = (cottage: SelectedCottage) => {
    setSelectedCottages(prev => {
      const exists = prev.some(c => c.id === cottage.id);
      if (exists) return prev;
      return [...prev, cottage];
    });
  };

  const removeCottage = (cottageId: string) => {
    setSelectedCottages(prev => prev.filter(cottage => cottage.id !== cottageId));
  };

  const addAmenity = (amenity: SelectedAmenity) => {
    setSelectedAmenities(prev => {
      const exists = prev.some(a => a.id === amenity.id);
      if (exists) return prev;
      return [...prev, amenity];
    });
  };

  const removeAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => prev.filter(amenity => amenity.id !== amenityId));
  };

  const addPackage = (pkg: SelectedPackage) => {
    setSelectedPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id);
      if (exists) return prev;
      return [...prev, pkg];
    });
  };

  const removePackage = (packageId: string) => {
    setSelectedPackages(prev => prev.filter(pkg => pkg.id !== packageId));
  };

  const clearSelections = () => {
    setSelectedRooms([]);
    setSelectedCottages([]);
    setSelectedAmenities([]);
    setSelectedPackages([]);
  };

  const isRoomSelected = (roomId: string) => {
    return selectedRooms.some(room => room.id === roomId);
  };

  const isCottageSelected = (cottageId: string) => {
    return selectedCottages.some(cottage => cottage.id === cottageId);
  };

  const isAmenitySelected = (amenityId: string) => {
    return selectedAmenities.some(amenity => amenity.id === amenityId);
  };

  const isPackageSelected = (packageId: string) => {
    return selectedPackages.some(pkg => pkg.id === packageId);
  };

  const setRateType = (rateType: 'day' | 'night') => {
    setSelectedRateType(rateType);
  };

  const value: BookingSelectionContextType = {
    selectedRooms,
    selectedCottages,
    selectedAmenities,
    selectedPackages,
    basePrice,
    accommodationTotal,
    amenitiesTotal,
    packagesTotal,
    totalCost,
    downPaymentAmount,
    remainingAmount,
    numberOfNights,
    depositPercentage,
    selectedRateType,
    addRoom,
    removeRoom,
    addCottage,
    removeCottage,
    addAmenity,
    removeAmenity,
    addPackage,
    removePackage,
    clearSelections,
    setBasePrice,
    setNumberOfNights,
    setDepositPercentage,
    setRateType,
    calculateTotal,
    isRoomSelected,
    isCottageSelected,
    isAmenitySelected,
    isPackageSelected,
  };

  return (
    <BookingSelectionContext.Provider value={value}>
      {children}
    </BookingSelectionContext.Provider>
  );
};

export default BookingSelectionProvider;
