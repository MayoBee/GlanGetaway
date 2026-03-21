import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { useLocation } from "react-router-dom";

const DetailsSection = () => {
  const location = useLocation();
  const isEditing = location.pathname.includes("/edit-hotel");
  
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-3">
        {isEditing ? "Edit Beach Resort" : "Add Beach Resort"}
      </h1>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Name <span className="text-red-500">*</span>
        <input
          type="text"
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("name", { required: "This field is required" })}
        ></input>
        {errors.name && (
          <span className="text-red-500">{errors.name.message}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="text-gray-700 text-sm font-bold flex-1">
          Barangay <span className="text-red-500">*</span>
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("city", { required: "This field is required" })}
          ></input>
          {errors.city && (
            <span className="text-red-500">{errors.city.message}</span>
          )}
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Purok <span className="text-red-500">*</span>
          <input
            type="text"
            className="border rounded w-full py-1 px-2 font-normal"
            {...register("country", { required: "This field is required" })}
          ></input>
          {errors.country && (
            <span className="text-red-500">{errors.country.message}</span>
          )}
        </label>
      </div>
      <label className="text-gray-700 text-sm font-bold flex-1">
        Description <span className="text-red-500">*</span>
        <textarea
          rows={10}
          className="border rounded w-full py-1 px-2 font-normal"
          {...register("description", { required: "This field is required" })}
        ></textarea>
        {errors.description && (
          <span className="text-red-500">{errors.description.message}</span>
        )}
      </label>

      <div className="space-y-4">
        <label className="text-gray-700 text-sm font-bold">
          Resort Owner Pricing <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="hasDayRate"
              className="h-4 w-4 text-blue-600"
              {...register("hasDayRate", { required: "Please select at least one rate type" })}
            />
            <label htmlFor="hasDayRate" className="flex-1 cursor-pointer">
              <span className="font-medium text-blue-800">Day Rate (Resort Owner) <span className="text-red-500">*</span></span>
              <span className="text-xs text-blue-600 block">Limited time beach access until 5PM</span>
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Day Rate Price (₱) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">₱</span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                {...register("dayRate", { 
                  required: "Day rate is required",
                  min: { value: 0, message: "Price must be positive" }
                })}
              />
            </div>
            {errors.dayRate && (
              <span className="text-red-500 text-sm">{errors.dayRate.message}</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              id="hasNightRate"
              className="h-4 w-4 text-green-600"
              {...register("hasNightRate", { required: "Please select at least one rate type" })}
            />
            <label htmlFor="hasNightRate" className="flex-1 cursor-pointer">
              <span className="font-medium text-green-800">Night Rate (Resort Owner) <span className="text-red-500">*</span></span>
              <span className="text-xs text-green-600 block">24-hour overnight stay</span>
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Night Rate Price (₱) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">₱</span>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                {...register("nightRate", { 
                  required: "Night rate is required",
                  min: { value: 0, message: "Price must be positive" }
                })}
              />
            </div>
            {errors.nightRate && (
              <span className="text-red-500 text-sm">{errors.nightRate.message}</span>
            )}
          </div>
        </div>
      </div>

      <label className="text-gray-700 text-sm font-bold max-w-[50%]">
        Star Rating <span className="text-red-500">*</span>
        <select
          {...register("starRating", {
            required: "This field is required",
            valueAsNumber: true,
          })}
          className="border rounded w-full p-2 text-gray-700 font-normal"
          defaultValue={3}
        >
          <option value="" className="text-sm font-bold">
            Select as Rating
          </option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        {errors.starRating && (
          <span className="text-red-500">{errors.starRating.message}</span>
        )}
      </label>
    </div>
  );
};

export default DetailsSection;
