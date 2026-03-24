import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Plus, Package, Check, X } from "lucide-react";
import { useState, useEffect } from "react";

const FreshPackagesSection = () => {
  const { control } = useFormContext<HotelFormData>();
  const rooms = useWatch({ control, name: "rooms" });
  const cottages = useWatch({ control, name: "cottages" });
  const amenities = useWatch({ control, name: "amenities" });
  const adultEntranceFee = useWatch({ control, name: "adultEntranceFee" });
  const packages = useWatch({ control, name: "packages" });
  
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "packages",
  });
  const [confirmedPackages, setConfirmedPackages] = useState<Set<string>>(new Set());

  const addPackage = () => {
    const newPackageId = `package_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    append({
      id: newPackageId,
      name: "",
      description: "",
      price: 0,
      includedRooms: [],
      includedCottages: [],
      includedAmenities: [],
      includedAdultEntranceFee: false,
      includedChildEntranceFee: false,
      isConfirmed: false,
    });
  };

  // Load confirmed states from form data
  useEffect(() => {
    if (packages) {
      const confirmedIds = packages
        .filter(pkg => pkg.isConfirmed)
        .map(pkg => pkg.id)
        .filter(Boolean);
      setConfirmedPackages(new Set(confirmedIds));
    }
  }, [packages]);

  const confirmPackage = (packageId: string) => {
    setConfirmedPackages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });

    // Update the form data with the new confirmation state
    if (packages) {
      const packageIndex = packages.findIndex(pkg => pkg.id === packageId);
      if (packageIndex !== -1) {
        const isCurrentlyConfirmed = confirmedPackages.has(packageId);
        update(packageIndex, {
          ...packages[packageIndex],
          isConfirmed: !isCurrentlyConfirmed,
        });
      }
    }
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
          <p className="text-gray-500">No packages added yet</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-800">Package {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
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
                    <span className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 flex items-center justify-center text-sm font-medium">₱</span>
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
                      {rooms.map((room) => (
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
                      {cottages.map((cottage) => (
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
                      {amenities.map((amenity) => (
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

                {/* Entrance Fees */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎫 Included Entrance Fees
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100">
                      <input
                        {...control.register(`packages.${index}.includedAdultEntranceFee` as const)}
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        Adult Entrance Fee (Day: ₱{adultEntranceFee?.dayRate || 0}, Night: ₱{adultEntranceFee?.nightRate || 0})
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100">
                      <input
                        {...control.register(`packages.${index}.includedChildEntranceFee` as const)}
                        type="checkbox"
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        Child Entrance Fee (Available rates for children)
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 When included in a package, entrance fees become free for the user since they're already paid for in the package price.
                  </p>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => confirmPackage(field.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    confirmedPackages.has(field.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {confirmedPackages.has(field.id) ? 'Confirmed' : 'Confirm Package'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreshPackagesSection;
