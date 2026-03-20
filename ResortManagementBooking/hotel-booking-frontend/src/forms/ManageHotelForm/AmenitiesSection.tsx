import { useFormContext, useFieldArray } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Plus, X } from "lucide-react";

const AmenitiesSection = () => {
  const { control, register, formState: { errors } } = useFormContext<HotelFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "amenities",
  });

  const handleAddAmenity = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      price: 0,
      description: "",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Beach Resort Amenities & Activities</h2>
        <p className="text-gray-600 text-sm mb-4">
          Add water sports, activities, and other amenities with their prices (e.g., Kayaks, Banana Boat, Karaoke)
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-3 p-4 border border-gray-300 rounded-lg bg-gray-50 items-end"
          >
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Amenity Name
              </label>
              <input
                type="text"
                placeholder="e.g., Kayaks, Banana Boat, Karaoke"
                className="w-full border rounded px-3 py-2 font-normal"
                {...register(`amenities.${index}.name`, {
                  required: "Amenity name is required",
                })}
              />
              {errors.amenities?.[index]?.name && (
                <span className="text-red-500 text-sm">
                  {errors.amenities[index]?.name?.message}
                </span>
              )}
            </div>

            <div className="w-32">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Price (₱)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full border rounded px-3 py-2 font-normal"
                {...register(`amenities.${index}.price`, {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
              />
              {errors.amenities?.[index]?.price && (
                <span className="text-red-500 text-sm">
                  {errors.amenities[index]?.price?.message}
                </span>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 30-minute tour"
                className="w-full border rounded px-3 py-2 font-normal"
                {...register(`amenities.${index}.description`)}
              />
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddAmenity}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold w-fit"
      >
        <Plus className="w-4 h-4" />
        Add Amenity
      </button>

      {fields.length === 0 && (
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          No amenities added yet. Click "Add Amenity" to get started!
        </div>
      )}
    </div>
  );
};

export default AmenitiesSection;
