import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useSearchContext from "../../hooks/useSearchContext";
import useAppContext from "../../hooks/useAppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Calendar, Users, User, Baby, CreditCard, Ticket, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useBookingSelection } from "../../contexts/BookingSelectionContext";
import BookingSummary from "../../components/BookingSummary";
import * as apiClient from "../../api-client";

type Props = {
  hotelId: string;
  pricePerNight: number;
};

type GuestInfoFormData = {
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  seniorCount: number;
  pwdCount: number;
};

const GuestInfoForm = ({ hotelId, pricePerNight }: Props) => {
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    setBasePrice, 
    setNumberOfNights, 
    totalCost, 
    selectedRooms, 
    selectedCottages, 
    selectedAmenities,
    clearSelections 
  } = useBookingSelection();

  // Time state variables
  const [checkInTime, setCheckInTime] = useState<string>(search.checkInTime);
  const [checkOutTime, setCheckOutTime] = useState<string>(search.checkOutTime);
  const [childAges, setChildAges] = useState<number[]>(() => []);
  
  // Senior/PWD verification state
  const [hasSeniorGuest, setHasSeniorGuest] = useState<boolean>(search.seniorCount > 0);
  const [hasPwdGuest, setHasPwdGuest] = useState<boolean>(search.pwdCount > 0);
  const [seniorCount, setSeniorCount] = useState<number>(search.seniorCount);
  const [pwdCount, setPwdCount] = useState<number>(search.pwdCount);
  
  // Voucher/Promo code state
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoCodeLoading, setPromoCodeLoading] = useState<boolean>(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [promoCodeSuccess, setPromoCodeSuccess] = useState<boolean>(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discountAmount: number; name: string } | null>(null);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    defaultValues: {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adultCount: search.adultCount,
      childCount: search.childCount,
    },
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const adultCount = watch("adultCount");
  const childCount = watch("childCount");

  // Calculate number of nights for display
  let numberOfNights = 1;
  if (checkIn && checkOut) {
    const diff = checkOut.getTime() - checkIn.getTime();
    numberOfNights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Calculate number of nights and update booking context
  useEffect(() => {
    let nights = 1;
    if (checkIn && checkOut) {
      const diff = checkOut.getTime() - checkIn.getTime();
      nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    
    const basePrice = pricePerNight * nights;
    setBasePrice(basePrice);
    setNumberOfNights(nights);
  }, [checkIn, checkOut, pricePerNight, setBasePrice, setNumberOfNights]);

  // Update child ages when child count changes
  useEffect(() => {
    if (childCount > childAges.length) {
      setChildAges((prev) => [
        ...prev,
        ...Array(childCount - prev.length).fill(1),
      ]);
    } else if (childCount < childAges.length) {
      setChildAges((prev) => prev.slice(0, childCount));
    }
  }, [childCount, childAges.length]);

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const onSignInClick = (data: GuestInfoFormData) => {
    search.saveSearchValues(
      "",
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount,
      childAges,
      checkInTime,
      checkOutTime,
      "PM",
      "AM",
      seniorCount,
      pwdCount
    );
    navigate("/sign-in", { state: { from: location } });
  };

  const onSubmit = (data: GuestInfoFormData) => {
    search.saveSearchValues(
      "",
      data.checkIn,
      data.checkOut,
      data.adultCount,
      data.childCount,
      childAges,
      checkInTime,
      checkOutTime,
      "PM",
      "AM",
      seniorCount,
      pwdCount
    );
    navigate(`/hotel/${hotelId}/booking`);
  };

  // Handle promo code validation
  const handlePromoCodeApply = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }
    
    setPromoCodeLoading(true);
    setPromoCodeError(null);
    setPromoCodeSuccess(false);
    
    try {
      const response = await apiClient.validateDiscountCode(hotelId, promoCode.toUpperCase(), pricePerNight * numberOfNights);
      if (response.success && response.data) {
        setAppliedPromoCode({
          code: response.data.code,
          discountAmount: response.data.discountAmount,
          name: response.data.name
        });
        setPromoCodeSuccess(true);
      } else {
        setPromoCodeError(response.message || "Invalid promo code");
        setAppliedPromoCode(null);
      }
    } catch (error: any) {
      setPromoCodeError(error.response?.data?.message || "Failed to validate promo code. Please try again.");
      setAppliedPromoCode(null);
    } finally {
      setPromoCodeLoading(false);
    }
  };

  // Handle promo code removal
  const handleRemovePromoCode = () => {
    setPromoCode("");
    setAppliedPromoCode(null);
    setPromoCodeError(null);
    setPromoCodeSuccess(false);
  };

  return (
    <>
      <style>
        {`
          .react-datepicker {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            font-family: inherit !important;
          }
          .react-datepicker__header {
            background-color: #f8fafc !important;
            border-bottom: 1px solid #e5e7eb !important;
            border-radius: 8px 8px 0 0 !important;
          }
          .react-datepicker__current-month {
            color: #374151 !important;
            font-weight: 600 !important;
          }
          .react-datepicker__day-name {
            color: #6b7280 !important;
            font-weight: 500 !important;
          }
          .react-datepicker__day {
            color: #374151 !important;
            border-radius: 6px !important;
            margin: 2px !important;
          }
          .react-datepicker__day:hover {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }
          .react-datepicker__day--selected {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .react-datepicker__day--in-range {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: #3b82f6 !important;
            color: white !important;
          }
          .react-datepicker__day--outside-month {
            color: #9ca3af !important;
          }
          .react-datepicker__navigation {
            color: #6b7280 !important;
          }
          .react-datepicker__navigation:hover {
            color: #374151 !important;
          }
        `}
      </style>
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Booking Summary</span>
            </div>
            <Badge variant="outline" className="text-sm">
              ₱{pricePerNight}/night
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                ₱{pricePerNight} × {numberOfNights} night
                {numberOfNights > 1 ? "s" : ""}
              </span>
              {totalCost > pricePerNight * numberOfNights && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                  + Extras
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ₱{totalCost.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Price</div>
            </div>
          </div>

          {/* Booking Summary */}
          <BookingSummary />

          <form
            onSubmit={
              isLoggedIn ? handleSubmit(onSubmit) : handleSubmit(onSignInClick)
            }
            className="space-y-4"
          >
            {/* Date Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Select Dates
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <DatePicker
                    required
                    selected={checkIn}
                    onChange={(date) => setValue("checkIn", date as Date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Check-in Date"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    wrapperClassName="w-full"
                  />
                  <div className="mt-2">
                    <input
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="relative">
                  <DatePicker
                    required
                    selected={checkOut}
                    onChange={(date) => setValue("checkOut", date as Date)}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={minDate}
                    maxDate={maxDate}
                    placeholderText="Check-out Date"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    wrapperClassName="w-full"
                  />
                  <div className="mt-2">
                    <input
                      type="time"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Count */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Guest Information
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Adults
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white w-full">
                    <button
                      type="button"
                      onClick={() => setValue("adultCount", Math.max(1, adultCount - 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold">
                      {adultCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("adultCount", adultCount + 1)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="hidden"
                    {...register("adultCount", {
                      required: "This field is required",
                      min: {
                        value: 1,
                        message: "There must be at least one adult",
                      },
                      valueAsNumber: true,
                    })}
                  />
                  {errors.adultCount && (
                    <span className="text-red-500 text-xs">
                      {errors.adultCount.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Children
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white w-full">
                    <button
                      type="button"
                      onClick={() => setValue("childCount", Math.max(0, childCount - 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold">
                      {childCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("childCount", childCount + 1)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg leading-none"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="hidden"
                    {...register("childCount", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              {/* Child age selectors */}
              {childCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {childAges.map((age, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-xs text-gray-500">
                        Child {idx + 1} age
                      </label>
                      <select
                        value={age}
                        onChange={(e) => {
                          const newAges = [...childAges];
                          newAges[idx] = parseInt(e.target.value);
                          setChildAges(newAges);
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {Array.from({ length: 17 }, (_, i) => i + 1).map(
                          (n) => (
                            <option key={n} value={n}>
                              {n} yr{n > 1 ? "s" : ""}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Senior/PWD Guest Verification Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="h-4 w-4" />
                Guest Discount Verification
              </Label>
              
              <p className="text-xs text-gray-500">
                Select if any guest is a Senior Citizen or Person with Disability (PWD) to avail of discounts. 
                Valid ID must be presented upon check-in.
              </p>

              {/* Senior Citizen Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <input
                  type="checkbox"
                  id="hasSeniorGuest"
                  checked={hasSeniorGuest}
                  onChange={(e) => {
                    setHasSeniorGuest(e.target.checked);
                    if (!e.target.checked) {
                      setSeniorCount(0);
                    } else if (seniorCount === 0) {
                      setSeniorCount(1);
                    }
                  }}
                  className="h-4 w-4 text-amber-600"
                />
                <label htmlFor="hasSeniorGuest" className="flex-1 cursor-pointer">
                  <span className="font-medium text-amber-800">Senior Citizen</span>
                  <span className="text-xs text-amber-600 block">20% discount</span>
                </label>
                {hasSeniorGuest && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSeniorCount(Math.max(0, seniorCount - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-amber-200 rounded hover:bg-amber-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{seniorCount}</span>
                    <button
                      type="button"
                      onClick={() => setSeniorCount(Math.min(adultCount + childCount, seniorCount + 1))}
                      className="w-8 h-8 flex items-center justify-center bg-amber-200 rounded hover:bg-amber-300"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* PWD Checkbox */}
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="hasPwdGuest"
                  checked={hasPwdGuest}
                  onChange={(e) => {
                    setHasPwdGuest(e.target.checked);
                    if (!e.target.checked) {
                      setPwdCount(0);
                    } else if (pwdCount === 0) {
                      setPwdCount(1);
                    }
                  }}
                  className="h-4 w-4 text-purple-600"
                />
                <label htmlFor="hasPwdGuest" className="flex-1 cursor-pointer">
                  <span className="font-medium text-purple-800">Person with Disability (PWD)</span>
                  <span className="text-xs text-purple-600 block">20% discount</span>
                </label>
                {hasPwdGuest && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPwdCount(Math.max(0, pwdCount - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-purple-200 rounded hover:bg-purple-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{pwdCount}</span>
                    <button
                      type="button"
                      onClick={() => setPwdCount(Math.min(adultCount + childCount, pwdCount + 1))}
                      className="w-8 h-8 flex items-center justify-center bg-purple-200 rounded hover:bg-purple-300"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Summary of discount eligible guests */}
              {(seniorCount > 0 || pwdCount > 0) && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm text-green-800">
                  <p className="font-medium">
                    ✓ {seniorCount + pwdCount} guest(s) eligible for discount
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Please bring valid Senior Citizen ID or PWD ID upon check-in to avail the discount.
                  </p>
                </div>
              )}
            </div>

            {/* Voucher/Promo Code Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Ticket className="h-4 w-4" />
                Have a Voucher or Promo Code?
              </Label>
              
              {!appliedPromoCode ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoCodeError(null);
                        setPromoCodeSuccess(false);
                      }}
                      placeholder="Enter voucher code"
                      className="uppercase font-mono flex-1"
                      disabled={promoCodeLoading}
                    />
                    <Button
                      type="button"
                      onClick={handlePromoCodeApply}
                      disabled={promoCodeLoading || !promoCode.trim()}
                      variant="outline"
                      className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                    >
                      {promoCodeLoading ? (
                        <span className="flex items-center gap-1">
                          <span className="animate-spin h-3 w-3 border-2 border-orange-600 border-t-transparent rounded-full"></span>
                          Checking...
                        </span>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  
                  {promoCodeError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {promoCodeError}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Enter your voucher code to get exclusive discounts
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          Voucher Applied: {appliedPromoCode.code}
                        </p>
                        <p className="text-sm text-green-600">
                          {appliedPromoCode.name} - ₱{appliedPromoCode.discountAmount.toFixed(2)} off
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromoCode}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Book Now
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign in to Book
                </div>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
            Free cancellation • No booking fees • Instant confirmation
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default GuestInfoForm;
