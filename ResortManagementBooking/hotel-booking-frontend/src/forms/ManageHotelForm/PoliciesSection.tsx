import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const PoliciesSection = () => {
  const { register } = useFormContext<HotelFormData>();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Resort Policies</h2>
      
      {/* Check-in/Check-out Times */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Check-in & Check-out Times</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day Rate Times */}
          <div className="space-y-3">
            <h4 className="text-md font-medium text-blue-700">Day Rate</h4>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-gray-700 text-sm font-bold">
                Day Check-in Time
                <input
                  type="text"
                  placeholder="e.g., 8:00 AM"
                  className="border rounded w-full py-2 px-3 font-normal"
                  {...register("policies.dayCheckInTime")}
                />
              </label>
              <label className="text-gray-700 text-sm font-bold">
                Day Check-out Time
                <input
                  type="text"
                  placeholder="e.g., 5:00 PM"
                  className="border rounded w-full py-2 px-3 font-normal"
                  {...register("policies.dayCheckOutTime")}
                />
              </label>
            </div>
          </div>

          {/* Night Rate Times */}
          <div className="space-y-3">
            <h4 className="text-md font-medium text-purple-700">Night Rate</h4>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-gray-700 text-sm font-bold">
                Night Check-in Time
                <input
                  type="text"
                  placeholder="e.g., 6:00 PM"
                  className="border rounded w-full py-2 px-3 font-normal"
                  {...register("policies.nightCheckInTime")}
                />
              </label>
              <label className="text-gray-700 text-sm font-bold">
                Night Check-out Time
                <input
                  type="text"
                  placeholder="e.g., 10:00 AM"
                  className="border rounded w-full py-2 px-3 font-normal"
                  {...register("policies.nightCheckOutTime")}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Other Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-gray-700 text-sm font-bold flex-1">
          Cancellation Policy
          <textarea
            placeholder="Describe your cancellation policy..."
            className="border rounded w-full py-2 px-3 font-normal"
            rows={3}
            {...register("policies.cancellationPolicy")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Pet Policy
          <textarea
            placeholder="Describe your pet policy..."
            className="border rounded w-full py-2 px-3 font-normal"
            rows={3}
            {...register("policies.petPolicy")}
          />
        </label>
        <label className="text-gray-700 text-sm font-bold flex-1">
          Smoking Policy
          <textarea
            placeholder="Describe your smoking policy..."
            className="border rounded w-full py-2 px-3 font-normal"
            rows={3}
            {...register("policies.smokingPolicy")}
          />
        </label>
      </div>
    </div>
  );
};

export default PoliciesSection;
