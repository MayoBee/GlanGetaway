import { useParams } from "react-router-dom";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "./../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";
import FreshAccommodationDisplay from "../components/FreshAccommodationDisplay";
import ReportButton from "../components/ReportButton";
import { Badge } from "../components/ui/badge";
import SocialShareButtons from "../components/SocialShareButtons";
import { useBookingSelection } from "../contexts/BookingSelectionContext";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Car,
  Wifi,
  Waves,
  Dumbbell,
  Sparkles,
  Plane,
  Facebook,
  Instagram,
  Music,
} from "lucide-react";

// URL validation helper - only allows http/https protocols
const isValidExternalUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const Detail = () => {
  const { id } = useParams();
  const { setRateType } = useBookingSelection();
  const [selectedRateType, setSelectedRateType] = useState<'day' | 'night'>('night');

  const { data: hotel } = useQueryWithLoading(
    "fetchHotelById",
    () => apiClient.fetchHotelById(id || ""),
    {
      enabled: !!id,
      loadingMessage: "Loading hotel details...",
    }
  );

  if (!hotel) {
    return (
      <div className="text-center text-lg text-gray-500 py-10">
        No hotel found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="flex">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <AiFillStar key={i} className="fill-yellow-400" />
          ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>

        {/* Location and Contact Info */}
        <div className="flex items-center gap-4 mt-2 text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>
              {hotel.city}, {hotel.country}
            </span>
          </div>
          {hotel.contact?.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{hotel.contact.phone}</span>
            </div>
          )}
          {hotel.contact?.website && isValidExternalUrl(hotel.contact.website) && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <a
                href={hotel.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {/* Hotel Stats */}
        {((hotel.totalBookings && hotel.totalBookings > 0) ||
          (hotel.totalRevenue && hotel.totalRevenue > 0) ||
          hotel.isFeatured) && (
          <div className="flex gap-4 mt-4">
            {hotel.totalBookings && hotel.totalBookings > 0 && (
              <Badge variant="outline">{hotel.totalBookings} bookings</Badge>
            )}
            {hotel.totalRevenue && hotel.totalRevenue > 0 && (
              <Badge variant="outline">
                ₱{hotel.totalRevenue.toLocaleString()} revenue
              </Badge>
            )}
            {/* Rating Badge - Always show with appropriate message */}
            <Badge variant="outline" className="text-gray-600">
              {hotel.averageRating && hotel.averageRating > 0
                ? `${hotel.averageRating.toFixed(1)} avg rating`
                : "Rating feature not yet implemented"}
            </Badge>
            {hotel.isFeatured && (
              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
            )}
          </div>
        )}

        {/* Resort Types */}
        {hotel.type && hotel.type.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {hotel.type.map((type, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Hotel Images */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {hotel.imageUrls.map((image: string, i: number) => (
            <div key={i} className="h-[300px]">
              <img
                src={image}
                alt={hotel.name}
                className="rounded-md w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Price and Guest Info */}
        <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {(hotel.hasDayRate && hotel.hasNightRate) ? `₱${hotel.dayRate || 0}/₱${hotel.nightRate || 0}` :
                 hotel.hasDayRate ? `₱${hotel.dayRate || 0}` :
                 hotel.hasNightRate ? `₱${hotel.nightRate || 0}` :
                 `₱0`}
            </p>
            <p className="text-sm text-gray-600">Day rate Price / Night rate Price</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {hotel.starRating}
            </p>
            <p className="text-sm text-gray-600">Star Rating</p>
          </div>
        </div>

        {/* Entrance Fees */}
      {((hotel.adultEntranceFee && (hotel.adultEntranceFee.dayRate > 0 || hotel.adultEntranceFee.nightRate > 0)) ||
        (hotel.childEntranceFee && hotel.childEntranceFee.length > 0)) && (
        <div className="border border-slate-300 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">Entrance Fees</h3>
          
          {/* Rate Type Descriptions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Rate Type Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotel.adultEntranceFee?.dayRate && hotel.adultEntranceFee.dayRate > 0 && (
                <div 
                  className={`p-3 rounded border-2 cursor-pointer transition-all ${
                    selectedRateType === 'day' 
                      ? 'bg-blue-100 border-blue-400 text-blue-900' 
                      : 'bg-white border-blue-100 text-blue-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    setSelectedRateType('day');
                    setRateType('day');
                  }}
                >
                  <h5 className="font-medium mb-1">Day Rate</h5>
                  <p className="text-sm mb-2">
                    Perfect for day trips! Check-in time is flexible, and check-out is automatically set at 5:00 PM on the same day.
                  </p>
                  <div className="text-xs font-medium">
                    Adults: ₱{hotel.adultEntranceFee.dayRate.toLocaleString()}/person
                    {hotel.childEntranceFee && hotel.childEntranceFee.length > 0 && (
                      <span className="ml-2">• Children: From ₱{Math.min(...hotel.childEntranceFee.map(child => child.dayRate)).toLocaleString()}/person</span>
                    )}
                  </div>
                </div>
              )}
              {hotel.adultEntranceFee?.nightRate && hotel.adultEntranceFee.nightRate > 0 && (
                <div 
                  className={`p-3 rounded border-2 cursor-pointer transition-all ${
                    selectedRateType === 'night' 
                      ? 'bg-green-100 border-green-400 text-green-900' 
                      : 'bg-green-50 border-green-100 text-green-700 hover:border-green-300 hover:bg-green-100'
                  }`}
                  onClick={() => {
                    setSelectedRateType('night');
                    setRateType('night');
                  }}
                >
                  <h5 className="font-medium mb-1">Night Rate</h5>
                  <p className="text-sm mb-2">
                    Ideal for overnight stays! Enjoy 24-hour accommodation from check-in to check-out time the next day.
                  </p>
                  <div className="text-xs font-medium">
                    Adults: ₱{hotel.adultEntranceFee.nightRate.toLocaleString()}/person
                    {hotel.childEntranceFee && hotel.childEntranceFee.length > 0 && (
                      <span className="ml-2">• Children: From ₱{Math.min(...hotel.childEntranceFee.map(child => child.nightRate)).toLocaleString()}/person</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {selectedRateType && (
              <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Selected:</strong> {selectedRateType === 'day' ? 'Day Rate' : 'Night Rate'} - 
                  <span className="ml-1">Scroll down to complete your booking with this rate type</span>
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Adult Entrance Fee */}
            {hotel.adultEntranceFee && (hotel.adultEntranceFee.dayRate > 0 || hotel.adultEntranceFee.nightRate > 0) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Adult Entrance Fee</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Day Rate:</span>
                    <span className="font-bold text-gray-900">
                      ₱{hotel.adultEntranceFee.dayRate.toLocaleString()}
                      {hotel.adultEntranceFee.pricingModel === 'per_group' && ` (${hotel.adultEntranceFee.groupQuantity} people)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Night Rate:</span>
                    <span className="font-bold text-gray-900">
                      ₱{hotel.adultEntranceFee.nightRate.toLocaleString()}
                      {hotel.adultEntranceFee.pricingModel === 'per_group' && ` (${hotel.adultEntranceFee.groupQuantity} people)`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Pricing Model: {hotel.adultEntranceFee.pricingModel === 'per_group' ? `Per Group (${hotel.adultEntranceFee.groupQuantity} people)` : 'Per Head'}
                  </div>
                </div>
              </div>
            )}

            {/* Child Entrance Fees */}
            {hotel.childEntranceFee && hotel.childEntranceFee.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Child Entrance Fees</h4>
                <div className="space-y-3">
                  {hotel.childEntranceFee.map((childFee, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-900">
                          Ages {childFee.minAge}-{childFee.maxAge} years
                        </h5>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">Pricing Model: </span>
                          <span className="text-sm font-medium text-blue-600">
                            {childFee.pricingModel === 'per_group' ? `Per Group (${childFee.groupQuantity} people)` : 'Per Head'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Day Rate:</span>
                          <span className="font-bold text-gray-900">₱{childFee.dayRate.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Night Rate:</span>
                          <span className="font-bold text-gray-900">₱{childFee.nightRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resort Description */}
        {hotel.description && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">About This Resort</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
            
            {/* Social Sharing */}
            <div className="mt-4">
              <SocialShareButtons 
                resortName={hotel.name}
                resortUrl={window.location.href}
              />
            </div>
          </div>
        )}

        {/* Report Button - Always visible */}
        <div className="mt-6 border-t pt-4">
          <div className="text-sm text-gray-500 mb-2">Having issues with this resort?</div>
          <ReportButton 
            itemId={hotel._id}
            itemType="hotel"
            itemName={hotel.name}
          />
        </div>
      </div>

      {/* Contact Information */}
      {hotel.contact && (
        <div className="border border-slate-300 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">Resort Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotel.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span>
                  <strong>Phone:</strong> {hotel.contact.phone}
                </span>
              </div>
            )}
            {hotel.contact.email && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span>
                  <strong>Email:</strong> {hotel.contact.email}
                </span>
              </div>
            )}
            {hotel.contact.website && isValidExternalUrl(hotel.contact.website) && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span>
                  <strong>Website:</strong>{" "}
                  <a
                    href={hotel.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Media Links */}
      {hotel.contact && (hotel.contact.facebook || hotel.contact.instagram || hotel.contact.tiktok) && (
        <div className="border border-slate-300 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">Follow Us on Social Media</h3>
          <div className="flex flex-wrap gap-4">
            {hotel.contact.facebook && isValidExternalUrl(hotel.contact.facebook) && (
              <a
                href={hotel.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
                <span>Facebook</span>
              </a>
            )}
            {hotel.contact.instagram && isValidExternalUrl(hotel.contact.instagram) && (
              <a
                href={hotel.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <Instagram className="w-5 h-5" />
                <span>Instagram</span>
              </a>
            )}
            {hotel.contact.tiktok && isValidExternalUrl(hotel.contact.tiktok) && (
              <a
                href={hotel.contact.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <Music className="w-5 h-5" />
                <span>TikTok</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Resort Policies */}
      {hotel.policies && (
        <div className="border border-slate-300 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-3">Resort Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.policies.checkInTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span>
                  <strong>Check-in:</strong> {hotel.policies.checkInTime}
                </span>
              </div>
            )}
            {hotel.policies.checkOutTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span>
                  <strong>Check-out:</strong> {hotel.policies.checkOutTime}
                </span>
              </div>
            )}
            {hotel.policies.cancellationPolicy && (
              <div>
                <strong>Cancellation:</strong>{" "}
                {hotel.policies.cancellationPolicy}
              </div>
            )}
            {hotel.policies.petPolicy && (
              <div>
                <strong>Pet Policy:</strong> {hotel.policies.petPolicy}
              </div>
            )}
            {hotel.policies.smokingPolicy && (
              <div>
                <strong>Smoking:</strong> {hotel.policies.smokingPolicy}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facilities */}
      <div className="border border-slate-300 rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-3">Facilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {hotel.facilities.map((facility) => (
            <div key={facility} className="flex items-center gap-2">
              <div className="w-4 h-4 text-green-600">
                {facility === "Free WiFi" && <Wifi className="w-4 h-4" />}
                {facility === "Parking" && <Car className="w-4 h-4" />}
                {facility === "Airport Shuttle" && (
                  <Plane className="w-4 h-4" />
                )}
                {facility === "Outdoor Pool" && <Waves className="w-4 h-4" />}
                {facility === "Spa" && <Sparkles className="w-4 h-4" />}
                {facility === "Fitness Center" && (
                  <Dumbbell className="w-4 h-4" />
                )}
                {facility === "Family Rooms" && (
                  <span className="w-4 h-4 text-green-600">🌴</span>
                )}
                {facility === "Non-Smoking Rooms" && (
                  <span className="w-4 h-4 text-green-600">🌴</span>
                )}
                {![
                  "Free WiFi",
                  "Parking",
                  "Airport Shuttle",
                  "Outdoor Pool",
                  "Spa",
                  "Fitness Center",
                  "Family Rooms",
                  "Non-Smoking Rooms",
                ].includes(facility) && <span className="w-4 h-4 text-green-600">🏢</span>}
              </div>
              <span>{facility}</span>
            </div>
          ))}
        </div>
      </div>

      
      {/* Rooms and Cottages */}
      <FreshAccommodationDisplay hotel={hotel} selectedRateType={selectedRateType} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr]">
        <div className="h-fit">
          <GuestInfoForm
            pricePerNight={hotel.hasDayRate ? hotel.dayRate || 0 : hotel.nightRate || 0}
            hotelId={hotel._id}
            initialRateType={selectedRateType}
          />
        </div>
      </div>
    </div>
  );
};

export default Detail;
