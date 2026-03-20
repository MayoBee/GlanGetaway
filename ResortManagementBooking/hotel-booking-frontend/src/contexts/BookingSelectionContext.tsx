import React, { createContext, useContext, useState, ReactNode } from "react";
import { HotelType } from "../../../shared/types";

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
  maxOccupancy: number;
  description?: string;
}

export interface SelectedAmenity {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface BookingSelectionContextType {
  selectedRooms: SelectedRoom[];
  selectedCottages: SelectedCottage[];
  selectedAmenities: SelectedAmenity[];
  basePrice: number;
  accommodationTotal: number;
  amenitiesTotal: number;
  totalCost: number;
  numberOfNights: number;
  addRoom: (room: SelectedRoom) => void;
  removeRoom: (roomId: string) => void;
  addCottage: (cottage: SelectedCottage) => void;
  removeCottage: (cottageId: string) => void;
  addAmenity: (amenity: SelectedAmenity) => void;
  removeAmenity: (amenityId: string) => void;
  clearSelections: () => void;
  setBasePrice: (price: number) => void;
  setNumberOfNights: (nights: number) => void;
  calculateTotal: () => void;
  isRoomSelected: (roomId: string) => boolean;
  isCottageSelected: (cottageId: string) => boolean;
  isAmenitySelected: (amenityId: string) => boolean;
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
  const [basePrice, setBasePrice] = useState<number>(0);
  const [numberOfNights, setNumberOfNights] = useState<number>(1);

  const calculateTotal = () => {
    const accommodationTotal = 
      selectedRooms.reduce((sum, room) => sum + (room.pricePerNight * numberOfNights), 0) +
      selectedCottages.reduce((sum, cottage) => sum + (cottage.pricePerNight * numberOfNights), 0);
    
    const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + amenity.price, 0);
    
    return basePrice + accommodationTotal + amenitiesTotal;
  };

  const accommodationTotal = 
    selectedRooms.reduce((sum, room) => sum + (room.pricePerNight * numberOfNights), 0) +
    selectedCottages.reduce((sum, cottage) => sum + (cottage.pricePerNight * numberOfNights), 0);

  const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + amenity.price, 0);

  const totalCost = calculateTotal();

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

  const clearSelections = () => {
    setSelectedRooms([]);
    setSelectedCottages([]);
    setSelectedAmenities([]);
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

  const value: BookingSelectionContextType = {
    selectedRooms,
    selectedCottages,
    selectedAmenities,
    basePrice,
    accommodationTotal,
    amenitiesTotal,
    totalCost,
    numberOfNights,
    addRoom,
    removeRoom,
    addCottage,
    removeCottage,
    addAmenity,
    removeAmenity,
    clearSelections,
    setBasePrice,
    setNumberOfNights,
    calculateTotal,
    isRoomSelected,
    isCottageSelected,
    isAmenitySelected,
  };

  return (
    <BookingSelectionContext.Provider value={value}>
      {children}
    </BookingSelectionContext.Provider>
  );
};

export default BookingSelectionProvider;
