import { useFieldArray, useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Plus, Minus, Users, DollarSign, Bed } from "lucide-react";

const FreshRoomsSection = () => {
  const { control, watch } = useFormContext<HotelFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rooms",
  });

  const addRoom = () => {
    append({
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      type: "",
      pricePerNight: 0,
      minOccupancy: 1,
      maxOccupancy: 1,
      description: "",
      amenities: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Rooms</h3>
        <button
          type="button"
          onClick={addRoom}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Bed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No rooms added yet</p>
          <button
            type="button"
            onClick={addRoom}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Add your first room
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-800">Room {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Room Name
                  </label>
                  <input
                    {...control.register(`rooms.${index}.name` as const)}
                    type="text"
                    placeholder="e.g., Paradise Suite, Ocean View Room"
                    className="w-full border rounded px-3 py-2 font-normal"
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    {...control.register(`rooms.${index}.type` as const)}
                    className="w-full border rounded px-3 py-2 font-normal"
                  >
                    <option value="">Select room type</option>
                    <option value="Standard">Standard Room</option>
                    <option value="Deluxe">Deluxe Room</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family Room</option>
                    <option value="Ocean View">Ocean View</option>
                    <option value="Garden View">Garden View</option>
                  </select>
                </div>

                {/* Price Per Night */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Price Per Night
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      {...control.register(`rooms.${index}.pricePerNight` as const)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                    />
                  </div>
                </div>

                {/* Occupancy Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Occupancy Range
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        {...control.register(`rooms.${index}.minOccupancy` as const)}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1"
                        className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                      />
                    </div>
                    <span className="text-gray-500 font-semibold">-</span>
                    <div className="relative flex-1">
                      <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        {...control.register(`rooms.${index}.maxOccupancy` as const)}
                        type="number"
                        min="1"
                        max="100"
                        placeholder="1"
                        className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum people - Maximum people</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  {...control.register(`rooms.${index}.description` as const)}
                  rows={3}
                  placeholder="Describe the room features, view, amenities..."
                  className="w-full border rounded px-3 py-2 font-normal resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreshRoomsSection;
