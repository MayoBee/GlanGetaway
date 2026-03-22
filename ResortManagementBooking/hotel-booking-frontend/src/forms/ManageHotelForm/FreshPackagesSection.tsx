import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Plus, Minus, Package, DollarSign } from "lucide-react";

const FreshPackagesSection = () => {
  const { control } = useFormContext<HotelFormData>();
  const rooms = useWatch({ control, name: "rooms" });
  const cottages = useWatch({ control, name: "cottages" });
  const amenities = useWatch({ control, name: "amenities" });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  const addPackage = () => {
    append({
      id: `package_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      description: "",
      price: 0,
      includedRooms: [],
      includedCottages: [],
      includedAmenities: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Package Offers</h3>
        <button
          type="button"
          onClick={addPackage}
          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No packages added yet</p>
          <button
            type="button"
            onClick={addPackage}
            className="text-purple-500 hover:text-purple-600 font-medium"
          >
            Create your first package
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-800">Package {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Package Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Package Name
                  </label>
                  <input
                    {...control.register(`packages.${index}.name` as const)}
                    type="text"
                    placeholder="e.g., Romantic Getaway, Family Fun Package"
                    className="w-full border rounded px-3 py-2 font-normal"
                  />
                </div>

                {/* Package Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Package Price
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      {...control.register(`packages.${index}.price` as const)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Price per night</p>
                </div>

                {/* Package Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Package Description
                  </label>
                  <textarea
                    {...control.register(`packages.${index}.description` as const)}
                    rows={3}
                    placeholder="Describe what this package includes..."
                    className="w-full border rounded px-3 py-2 font-normal resize-none"
                  />
                </div>
              </div>

              {/* Included Items */}
              <div className="mt-6 space-y-4">
                {/* Included Rooms */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Included Rooms
                  </label>
                  {rooms && rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {rooms.map((room, roomIndex) => (
                        <label
                          key={room.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                        >
                          <input
                            {...control.register(`packages.${index}.includedRooms` as const)}
                            type="checkbox"
                            value={room.id}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{room.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No rooms available. Add rooms first to include them in packages.
                    </p>
                  )}
                </div>

                {/* Included Cottages */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Included Cottages
                  </label>
                  {cottages && cottages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cottages.map((cottage, cottageIndex) => (
                        <label
                          key={cottage.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                        >
                          <input
                            {...control.register(`packages.${index}.includedCottages` as const)}
                            type="checkbox"
                            value={cottage.id}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{cottage.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No cottages available. Add cottages first to include them in packages.
                    </p>
                  )}
                </div>

                {/* Included Amenities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Included Amenities
                  </label>
                  {amenities && amenities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {amenities.map((amenity, amenityIndex) => (
                        <label
                          key={amenity.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100"
                        >
                          <input
                            {...control.register(`packages.${index}.includedAmenities` as const)}
                            type="checkbox"
                            value={amenity.id}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No amenities available. Add amenities first to include them in packages.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreshPackagesSection;
