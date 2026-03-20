import { HotelType } from "../../../shared/types";
import { Bed, Home, Users, DollarSign, Check, Plus } from "lucide-react";
import { useBookingSelection } from "../contexts/BookingSelectionContext";

type Props = {
  hotel: HotelType;
};

const AccommodationDisplay = ({ hotel }: Props) => {
  const hasRooms = hotel.rooms && hotel.rooms.length > 0;
  const hasCottages = hotel.cottages && hotel.cottages.length > 0;
  const { 
    addRoom, 
    removeRoom, 
    addCottage, 
    removeCottage, 
    isRoomSelected, 
    isCottageSelected,
    numberOfNights 
  } = useBookingSelection();

  if (!hasRooms && !hasCottages) {
    return (
      <div className="border border-slate-300 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Rooms & Cottages</h3>
        <div className="text-center text-gray-500 py-8">
          <p>No rooms or cottages have been added to this resort yet.</p>
          <p className="text-sm mt-2">Contact the resort owner for more accommodation options.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rooms Section */}
      {hasRooms && (
        <div className="border border-slate-300 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bed className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Available Rooms</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.rooms?.map((room) => {
              const isSelected = isRoomSelected(room.id);
              return (
                <div
                  key={room.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{room.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {room.type}
                      </span>
                      {isSelected && (
                        <div className="bg-blue-600 text-white p-1 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          ₱{room.pricePerNight}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">per night</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Up to {room.maxOccupancy} guests
                      </span>
                    </div>

                    {numberOfNights > 1 && (
                      <div className="text-sm text-blue-600 font-medium">
                        Total: ₱{room.pricePerNight * numberOfNights} ({numberOfNights} nights)
                      </div>
                    )}
                  </div>
                  
                  {room.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                  
                  <button
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm ${
                      isSelected
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        removeRoom(room.id);
                      } else {
                        addRoom({
                          id: room.id,
                          name: room.name,
                          type: room.type,
                          pricePerNight: room.pricePerNight,
                          maxOccupancy: room.maxOccupancy,
                          description: room.description
                        });
                      }
                    }}
                  >
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>Remove</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Add to Booking</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cottages Section */}
      {hasCottages && (
        <div className="border border-slate-300 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Home className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold">Available Cottages</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.cottages?.map((cottage) => {
              const isSelected = isCottageSelected(cottage.id);
              return (
                <div
                  key={cottage.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                    isSelected 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{cottage.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {cottage.type}
                      </span>
                      {isSelected && (
                        <div className="bg-green-600 text-white p-1 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          ₱{cottage.pricePerNight}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">per night</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Up to {cottage.maxOccupancy} guests
                      </span>
                    </div>

                    {numberOfNights > 1 && (
                      <div className="text-sm text-green-600 font-medium">
                        Total: ₱{cottage.pricePerNight * numberOfNights} ({numberOfNights} nights)
                      </div>
                    )}
                  </div>
                  
                  {cottage.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {cottage.description}
                    </p>
                  )}
                  
                  <button
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-sm ${
                      isSelected
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        removeCottage(cottage.id);
                      } else {
                        addCottage({
                          id: cottage.id,
                          name: cottage.name,
                          type: cottage.type,
                          pricePerNight: cottage.pricePerNight,
                          maxOccupancy: cottage.maxOccupancy,
                          description: cottage.description
                        });
                      }
                    }}
                  >
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>Remove</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Add to Booking</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationDisplay;
