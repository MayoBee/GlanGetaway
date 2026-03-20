import { useFormContext, useFieldArray } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Plus, X, Home, Users, DollarSign } from "lucide-react";

const CottagesSection = () => {
  const { control, register, formState: { errors } } = useFormContext<HotelFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "cottages",
  });

  const handleAddCottage = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      type: "Beach Cottage",
      pricePerNight: 0,
      maxOccupancy: 4,
      description: "",
      amenities: [],
    });
  };

  const cottageTypes = ["Beach Cottage", "Garden Cottage", "Luxury Villa", "Family Cottage", "Romantic Cottage", "Tree House"];
  const commonAmenities = ["Kitchen", "Living Room", "Private Pool", "Garden", "BBQ Grill", "Ocean View", "WiFi", "Air Conditioning"];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Resort Cottages</h2>
        <p className="text-gray-600 text-sm mb-4">
          Add different cottage types with their respective prices and amenities
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-300 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Cottage {index + 1}</h4>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cottage Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cottage Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paradise Beach Villa, Garden Hideaway"
                  className="w-full border rounded px-3 py-2 font-normal"
                  {...register(`cottages.${index}.name`, {
                    required: "Cottage name is required",
                  })}
                />
                {errors.cottages?.[index]?.name && (
                  <span className="text-red-500 text-sm">
                    {errors.cottages[index]?.name?.message}
                  </span>
                )}
              </div>

              {/* Cottage Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cottage Type
                </label>
                <select
                  className="w-full border rounded px-3 py-2 font-normal"
                  {...register(`cottages.${index}.type`)}
                >
                  {cottageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Per Night */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price Per Night (₱)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                    {...register(`cottages.${index}.pricePerNight`, {
                      required: "Price is required",
                      min: { value: 0, message: "Price must be positive" },
                    })}
                  />
                </div>
                {errors.cottages?.[index]?.pricePerNight && (
                  <span className="text-red-500 text-sm">
                    {errors.cottages[index]?.pricePerNight?.message}
                  </span>
                )}
              </div>

              {/* Max Occupancy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Max Occupancy
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="4"
                    className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                    {...register(`cottages.${index}.maxOccupancy`, {
                      required: "Max occupancy is required",
                      min: { value: 1, message: "At least 1 guest required" },
                    })}
                  />
                </div>
                {errors.cottages?.[index]?.maxOccupancy && (
                  <span className="text-red-500 text-sm">
                    {errors.cottages[index]?.maxOccupancy?.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe the cottage features, privacy, special amenities, and surroundings..."
                  className="w-full border rounded px-3 py-2 font-normal h-20 resize-none"
                  {...register(`cottages.${index}.description`)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddCottage}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold w-fit"
      >
        <Plus className="w-4 h-4" />
        Add Cottage
      </button>

      {fields.length === 0 && (
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          No cottages added yet. Click "Add Cottage" to get started!
        </div>
      )}
    </div>
  );
};

export default CottagesSection;
