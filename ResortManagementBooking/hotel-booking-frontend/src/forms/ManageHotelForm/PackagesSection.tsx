import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";
import { Plus, X, Package, DollarSign, Home, Bed } from "lucide-react";

const PackagesSection = () => {
  const { control, register, formState: { errors } } = useFormContext<HotelFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages",
  });

  // Watch the cottages, rooms, and amenities to use in package selection
  const cottages = useWatch({ control, name: "cottages" });
  const rooms = useWatch({ control, name: "rooms" });
  const amenities = useWatch({ control, name: "amenities" });

  const handleCottageUnitsChange = (packageIndex: number, cottageId: string, units: number) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    const cottageIndex = packageToUpdate.includedCottages.findIndex((c: any) => c.id === cottageId);
    
    if (cottageIndex !== -1) {
      packageToUpdate.includedCottages[cottageIndex].units = units;
    }
    
    control._formValues.packages = [...currentPackages];
  };

  const handleRoomUnitsChange = (packageIndex: number, roomId: string, units: number) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    const roomIndex = packageToUpdate.includedRooms.findIndex((r: any) => r.id === roomId);
    
    if (roomIndex !== -1) {
      packageToUpdate.includedRooms[roomIndex].units = units;
    }
    
    control._formValues.packages = [...currentPackages];
  };

  const handleAmenityUnitsChange = (packageIndex: number, amenityId: string, units: number) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    const amenityIndex = packageToUpdate.includedAmenities.findIndex((a: any) => a.id === amenityId);
    
    if (amenityIndex !== -1) {
      packageToUpdate.includedAmenities[amenityIndex].units = units;
    }
    
    control._formValues.packages = [...currentPackages];
  };

  const handleAddCustomCottage = (packageIndex: number) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    
    const newCottage = {
      id: `custom_cottage_${Date.now()}`,
      name: "Custom Cottage",
      type: "Custom",
      pricePerNight: 0,
      dayRate: 0,
      nightRate: 0,
      hasDayRate: false,
      hasNightRate: false,
      minOccupancy: 1,
      maxOccupancy: 4,
      units: 1,
      description: "Custom cottage for this package"
    };
    
    packageToUpdate.includedCottages.push(newCottage);
    control._formValues.packages = [...currentPackages];
  };

  const handleAddCustomRoom = (packageIndex: number) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    
    const newRoom = {
      id: `custom_room_${Date.now()}`,
      name: "Custom Room",
      type: "Custom",
      pricePerNight: 0,
      minOccupancy: 1,
      maxOccupancy: 4,
      units: 1,
      description: "Custom room for this package"
    };
    
    packageToUpdate.includedRooms.push(newRoom);
    control._formValues.packages = [...currentPackages];
  };

  const handleAddCustomAmenity = (packageIndex: number) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    
    const newAmenity = {
      id: `custom_amenity_${Date.now()}`,
      name: "Custom Amenity",
      price: 0,
      units: 1,
      description: "Custom amenity for this package"
    };
    
    packageToUpdate.includedAmenities.push(newAmenity);
    control._formValues.packages = [...currentPackages];
  };

  const handleAddPackage = () => {
    append({
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      description: "",
      price: 0,
      includedCottages: [],
      includedRooms: [],
      includedAmenities: [],
      includedAdultEntranceFee: false,
      includedChildEntranceFee: false,
    });
  };

  const handleCottageToggle = (packageIndex: number, cottageId: string) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    const isIncluded = packageToUpdate.includedCottages.some((c: any) => c.id === cottageId);
    
    if (isIncluded) {
      packageToUpdate.includedCottages = packageToUpdate.includedCottages.filter((c: any) => c.id !== cottageId);
    } else {
      const cottage = cottages.find((c: any) => c.id === cottageId);
      if (cottage) {
        packageToUpdate.includedCottages.push({
          ...cottage,
          units: 1 // Default to 1 unit
        });
      }
    }
    
    // Force re-render by updating field array
    control._formValues.packages = [...currentPackages];
  };

  const handleRoomToggle = (packageIndex: number, roomId: string) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    const isIncluded = packageToUpdate.includedRooms.some((r: any) => r.id === roomId);
    
    if (isIncluded) {
      packageToUpdate.includedRooms = packageToUpdate.includedRooms.filter((r: any) => r.id !== roomId);
    } else {
      const room = rooms.find((r: any) => r.id === roomId);
      if (room) {
        packageToUpdate.includedRooms.push({
          ...room,
          units: 1 // Default to 1 unit
        });
      }
    }
    
    // Force re-render by updating the field array
    control._formValues.packages = [...currentPackages];
  };

  const handleAmenityToggle = (packageIndex: number, amenityId: string) => {
    const currentPackages = control._formValues.packages;
    const packageToUpdate = currentPackages[packageIndex];
    const isIncluded = packageToUpdate.includedAmenities.some((a: any) => a.id === amenityId);
    
    if (isIncluded) {
      packageToUpdate.includedAmenities = packageToUpdate.includedAmenities.filter((a: any) => a.id !== amenityId);
    } else {
      const amenity = amenities.find((a: any) => a.id === amenityId);
      if (amenity) {
        packageToUpdate.includedAmenities.push({
          ...amenity,
          units: 1 // Default to 1 unit
        });
      }
    }
    
    // Force re-render by updating the field array
    control._formValues.packages = [...currentPackages];
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Package Offers</h2>
        <p className="text-gray-600 text-sm mb-4">
          Create special packages by combining cottages, rooms, and amenities at a discounted price
        </p>
        <p className="text-gray-500 text-xs mb-4">
          Note: You must add cottages, rooms, and amenities first before creating packages
        </p>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {fields.map((field, index) => {
          const currentPackage = control._formValues.packages?.[index] || {};
          
          return (
            <div
              key={field.id}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Package {index + 1}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Package Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Package Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Romantic Getaway, Family Fun Package"
                    className="w-full border rounded px-3 py-2 font-normal"
                    {...register(`packages.${index}.name`, {
                      required: "Package name is required",
                    })}
                  />
                  {errors.packages?.[index]?.name && (
                    <span className="text-red-500 text-sm">
                      {errors.packages[index]?.name?.message}
                    </span>
                  )}
                </div>

                {/* Package Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Package Price (₱)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border rounded pl-10 pr-3 py-2 font-normal"
                      {...register(`packages.${index}.price`, {
                        required: "Package price is required",
                        min: { value: 0, message: "Price must be positive" },
                      })}
                    />
                  </div>
                  {errors.packages?.[index]?.price && (
                    <span className="text-red-500 text-sm">
                      {errors.packages[index]?.price?.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Package Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Package Description
                </label>
                <textarea
                  placeholder="Describe what's included in this package and any special features..."
                  className="w-full border rounded px-3 py-2 font-normal h-20 resize-none"
                  {...register(`packages.${index}.description`, {
                    required: "Package description is required",
                  })}
                />
                {errors.packages?.[index]?.description && (
                  <span className="text-red-500 text-sm">
                    {errors.packages[index]?.description?.message}
                  </span>
                )}
              </div>

              {/* Included Items */}
              <div className="space-y-4">
                {/* Cottages Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Home className="inline w-4 h-4 mr-1" />
                    Included Cottages
                  </label>
                  {cottages && cottages.length > 0 ? (
                    <div className="space-y-2">
                      {cottages.map((cottage) => {
                        const includedCottage = currentPackage.includedCottages?.find((c: any) => c.id === cottage.id);
                        const isIncluded = !!includedCottage;
                        const units = includedCottage?.units || 1;
                        
                        return (
                          <div key={cottage.id} className="border rounded p-2">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => handleCottageToggle(index, cottage.id)}
                                className="rounded"
                              />
                              <span className="text-sm flex-1">
                                {cottage.name} - ₱{cottage.pricePerNight}/night
                              </span>
                              {isIncluded && (
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-600">Units:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={units}
                                    onChange={(e) => handleCottageUnitsChange(index, cottage.id, parseInt(e.target.value) || 1)}
                                    className="w-16 text-xs border rounded px-1 py-1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => handleAddCustomCottage(index)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                      >
                        + Add Custom Cottage
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-500 text-sm">No cottages available. Add cottages first.</p>
                      <button
                        type="button"
                        onClick={() => handleAddCustomCottage(index)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                      >
                        + Add Custom Cottage
                      </button>
                    </div>
                  )}
                </div>

                {/* Rooms Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Bed className="inline w-4 h-4 mr-1" />
                    Included Rooms
                  </label>
                  {rooms && rooms.length > 0 ? (
                    <div className="space-y-2">
                      {rooms.map((room) => {
                        const includedRoom = currentPackage.includedRooms?.find((r: any) => r.id === room.id);
                        const isIncluded = !!includedRoom;
                        const units = includedRoom?.units || 1;
                        
                        return (
                          <div key={room.id} className="border rounded p-2">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => handleRoomToggle(index, room.id)}
                                className="rounded"
                              />
                              <span className="text-sm flex-1">
                                {room.name} - ₱{room.pricePerNight}/night
                              </span>
                              {isIncluded && (
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-600">Units:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={units}
                                    onChange={(e) => handleRoomUnitsChange(index, room.id, parseInt(e.target.value) || 1)}
                                    className="w-16 text-xs border rounded px-1 py-1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => handleAddCustomRoom(index)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                      >
                        + Add Custom Room
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-500 text-sm">No rooms available. Add rooms first.</p>
                      <button
                        type="button"
                        onClick={() => handleAddCustomRoom(index)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                      >
                        + Add Custom Room
                      </button>
                    </div>
                  )}
                </div>

                {/* Amenities Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Included Amenities
                  </label>
                  {amenities && amenities.length > 0 ? (
                    <div className="space-y-2">
                      {amenities.map((amenity) => {
                        const includedAmenity = currentPackage.includedAmenities?.find((a: any) => a.id === amenity.id);
                        const isIncluded = !!includedAmenity;
                        const units = includedAmenity?.units || 1;
                        
                        return (
                          <div key={amenity.id} className="border rounded p-2">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={isIncluded}
                                onChange={() => handleAmenityToggle(index, amenity.id)}
                                className="rounded"
                              />
                              <span className="text-sm flex-1">
                                {amenity.name} - ₱{amenity.price}
                              </span>
                              {isIncluded && (
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-600">Units:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={units}
                                    onChange={(e) => handleAmenityUnitsChange(index, amenity.id, parseInt(e.target.value) || 1)}
                                    className="w-16 text-xs border rounded px-1 py-1"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => handleAddCustomAmenity(index)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                      >
                        + Add Custom Amenity
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-500 text-sm">No amenities available. Add amenities first.</p>
                      <button
                        type="button"
                        onClick={() => handleAddCustomAmenity(index)}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700"
                      >
                        + Add Custom Amenity
                      </button>
                    </div>
                  )}
                </div>

                {/* Entrance Fees Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎫 Included Entrance Fees
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={currentPackage.includedAdultEntranceFee || false}
                        onChange={(e) => {
                          const currentPackages = control._formValues.packages;
                          currentPackages[index].includedAdultEntranceFee = e.target.checked;
                          control._formValues.packages = [...currentPackages];
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">
                        Adult Entrance Fee (Day Rate: ₱{control._formValues.adultEntranceFee?.dayRate || 0}, Night Rate: ₱{control._formValues.adultEntranceFee?.nightRate || 0})
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={currentPackage.includedChildEntranceFee || false}
                        onChange={(e) => {
                          const currentPackages = control._formValues.packages;
                          currentPackages[index].includedChildEntranceFee = e.target.checked;
                          control._formValues.packages = [...currentPackages];
                        }}
                        className="rounded"
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

              {/* Hidden inputs are removed - arrays are handled manually in ManageHotelForm.tsx */}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddPackage}
        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold w-fit"
      >
        <Plus className="w-4 h-4" />
        Add Package
      </button>

      {fields.length === 0 && (
        <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
          No packages added yet. Click "Add Package" to get started!
        </div>
      )}
    </div>
  );
};

export default PackagesSection;
