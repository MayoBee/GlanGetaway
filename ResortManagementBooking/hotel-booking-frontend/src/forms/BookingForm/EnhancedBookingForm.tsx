import { useForm } from "react-hook-form";
import { PaymentIntentResponse, UserType } from "../../../../shared/types";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripeCardElement } from "@stripe/stripe-js";
import useSearchContext from "../../hooks/useSearchContext";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import GuestVerificationLayer from "../../components/GuestVerificationLayer";
import { GuestVerification } from "../../lib/mockOCR";
import {
  User,
  Phone,
  MessageSquare,
  CreditCard,
  Shield,
  CheckCircle,
  Copy,
  Smartphone,
  Percent,
  Users,
} from "lucide-react";
import { useState } from "react";
import GCashPaymentForm, { GCashPaymentData } from "../../components/GCashPaymentForm";
import { SelectedRoom, SelectedCottage, SelectedAmenity } from "../../contexts/BookingSelectionContext";

type Props = {
  currentUser: UserType;
  paymentIntent: PaymentIntentResponse;
  calculatedTotal: number;
  selectedRooms: SelectedRoom[];
  selectedCottages: SelectedCottage[];
  selectedAmenities: SelectedAmenity[];
};

export type BookingFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adultCount: number;
  childCount: number;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  hotelId: string;
  paymentIntentId: string;
  totalCost: number;
  basePrice: number;
  specialRequests?: string;
  paymentMethod: "card" | "gcash";
  selectedRooms?: SelectedRoom[];
  selectedCottages?: SelectedCottage[];
  selectedAmenities?: SelectedAmenity[];
};

const EnhancedBookingForm = ({ 
  currentUser, 
  paymentIntent, 
  calculatedTotal,
  selectedRooms,
  selectedCottages,
  selectedAmenities
}: Props) => {
  console.log("EnhancedBookingForm received:", {
    calculatedTotal,
    selectedRooms,
    selectedCottages,
    selectedAmenities,
    paymentIntentTotal: paymentIntent.totalCost
  });
  const stripe = useStripe();
  const elements = useElements();
  const search = useSearchContext();
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAppContext();

  // Use local state for form fields to prevent losing data
  const [phone, setPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "gcash">("card");
  
  // Guest verification state
  const [seniorCount, setSeniorCount] = useState<number>(search.seniorCount || 0);
  const [pwdCount, setPwdCount] = useState<number>(search.pwdCount || 0);
  const [verifiedGuests, setVerifiedGuests] = useState<GuestVerification[]>([]);
  const [verificationDiscount, setVerificationDiscount] = useState<number>(0);
  const [hasDiscount, setHasDiscount] = useState<boolean>(search.seniorCount > 0 || search.pwdCount > 0);

  const { mutate: bookRoom, isLoading: isCardLoading } = useMutation(
    apiClient.createRoomBooking,
    {
      onSuccess: () => {
        showToast({
          title: "Booking Successful",
          description: "Your hotel booking has been confirmed successfully!",
          type: "SUCCESS",
        });

        // Navigate to My Bookings page after a short delay
        setTimeout(() => {
          navigate("/my-bookings");
        }, 1500);
      },
      onError: () => {
        showToast({
          title: "Booking Failed",
          description:
            "There was an error processing your booking. Please try again.",
          type: "ERROR",
        });
      },
    }
  );

  const { mutate: bookWithGCash, isLoading: isGCashLoading } = useMutation(
    apiClient.createGCashBooking,
    {
      onSuccess: () => {
        showToast({
          title: "Payment Submitted",
          description: "Your GCash payment has been submitted for verification. The resort owner will review your payment screenshot.",
          type: "SUCCESS",
        });

        setTimeout(() => {
          navigate("/my-bookings");
        }, 1500);
      },
      onError: () => {
        showToast({
          title: "Payment Submission Failed",
          description: "There was an error submitting your payment. Please try again.",
          type: "ERROR",
        });
      },
    }
  );

  const { handleSubmit, register } = useForm<BookingFormData>({
    defaultValues: {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      adultCount: search.adultCount,
      childCount: search.childCount,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      hotelId: hotelId,
      totalCost: calculatedTotal, // Use calculated total instead of paymentIntent total
      basePrice: paymentIntent.totalCost, // Use paymentIntent total as base price
      paymentIntentId: paymentIntent.paymentIntentId,
      paymentMethod: "card",
      selectedRooms,
      selectedCottages,
      selectedAmenities,
    },
    mode: "onChange",
    shouldUnregister: false,
  });

  const handleCopyCredentials = async () => {
    const credentials = `Card: 4242 4242 4242 4242
MM/YY: 12/35 CVC: 123`;

    try {
      await navigator.clipboard.writeText(credentials);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy credentials:", err);
    }
  };

  const onCardSubmit = async (formData: BookingFormData) => {
    if (!stripe || !elements) {
      showToast({
        title: "Payment System Error",
        description: "Stripe payment system is not loaded. Please refresh and try again.",
        type: "ERROR",
      });
      return;
    }

    // Add local state values and booking selections to form data
    const finalTotal = calculatedTotal - verificationDiscount;
    const completeFormData = {
      ...formData,
      phone,
      specialRequests,
      paymentMethod: "card",
      totalCost: finalTotal, // Use calculated total minus verification discount
      basePrice: paymentIntent.totalCost, // Use paymentIntent total as base price
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      selectedRooms,
      selectedCottages,
      selectedAmenities,
      guestVerifications: verifiedGuests,
      discountAmount: verificationDiscount,
    };

    const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement) as StripeCardElement,
      },
    });

    if (result.error) {
      showToast({
        title: "Payment Failed",
        description: result.error.message || "An error occurred while processing your payment.",
        type: "ERROR",
      });
      return;
    }

    bookRoom(completeFormData);
  };

  const onGCashSubmit = (paymentData: GCashPaymentData) => {
    const finalTotal = calculatedTotal - verificationDiscount;
    const formData = {
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: paymentData.gcashNumber,
      adultCount: search.adultCount,
      childCount: search.childCount,
      checkIn: search.checkIn.toISOString(),
      checkOut: search.checkOut.toISOString(),
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      hotelId: hotelId || "",
      totalCost: finalTotal, // Use calculated total minus verification discount
      basePrice: paymentIntent.totalCost, // Use paymentIntent total as base price
      paymentIntentId: paymentIntent.paymentIntentId,
      specialRequests,
      paymentMethod: "gcash" as const,
      selectedRooms,
      selectedCottages,
      selectedAmenities,
      guestVerifications: verifiedGuests,
      discountAmount: verificationDiscount,
      gcashPayment: {
        gcashNumber: paymentData.gcashNumber,
        referenceNumber: paymentData.referenceNumber,
        amountPaid: paymentData.amountPaid,
        paymentTime: paymentData.paymentTime,
        status: "pending",
      },
    };

    bookWithGCash(formData);
  };

  const isLoading = isCardLoading || isGCashLoading;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
      {/* Booking Form */}
      <form onSubmit={handleSubmit(onCardSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  type="text"
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-600"
                  {...register("firstName")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  type="text"
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-600"
                  {...register("lastName")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  type="email"
                  readOnly
                  disabled
                  className="bg-gray-50 text-gray-600"
                  {...register("email")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone (Optional)
                </Label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Special Requests (Optional)
              </h3>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder="Any special requests, preferences, or additional information..."
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Let us know if you have any special requirements or preferences
                  for your stay.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Price Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Total Cost</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₱{(calculatedTotal - verificationDiscount).toFixed(2)}
                </span>
              </div>
              
              {/* Show verification discount if applied */}
              {verificationDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm text-green-600">
                  <span>ID Verification Discount:</span>
                  <span>-₱{verificationDiscount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Show original price if discount applied */}
              {verificationDiscount > 0 && (
                <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                  <span>Original Price:</span>
                  <span className="line-through">₱{calculatedTotal.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {verificationDiscount > 0 
                  ? "Includes verified guest discounts"
                  : "Includes all selected accommodations and amenities"
                }
              </div>
              {(selectedRooms.length > 0 || selectedCottages.length > 0 || selectedAmenities.length > 0) && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-gray-600">
                    {selectedRooms.length > 0 && `${selectedRooms.length} room(s)`}
                    {selectedCottages.length > 0 && `${selectedRooms.length > 0 ? ', ' : ''}${selectedCottages.length} cottage(s)`}
                    {selectedAmenities.length > 0 && `${(selectedRooms.length > 0 || selectedCottages.length > 0) ? ', ' : ''}${selectedAmenities.length} amenit(ies)`}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Senior/PWD Count Input - Must be before verification layer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              Discount Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="hasDiscount"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="hasDiscount" className="font-medium cursor-pointer">
                I have eligible discounts (Senior Citizen / PWD)
              </label>
            </div>
            
            {hasDiscount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seniorCount" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Senior Citizens
                    <Badge variant="secondary" className="text-xs">20% off</Badge>
                  </Label>
                  <Input
                    id="seniorCount"
                    type="number"
                    min="0"
                    max={search.adultCount + search.childCount}
                    value={seniorCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      setSeniorCount(Math.min(count, search.adultCount + search.childCount - pwdCount));
                    }}
                    placeholder="Number of senior citizens"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pwdCount" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    PWD (Persons with Disabilities)
                    <Badge variant="secondary" className="text-xs">20% off</Badge>
                  </Label>
                  <Input
                    id="pwdCount"
                    type="number"
                    min="0"
                    max={search.adultCount + search.childCount}
                    value={pwdCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      setPwdCount(Math.min(count, search.adultCount + search.childCount - seniorCount));
                    }}
                    placeholder="Number of PWD guests"
                  />
                </div>
              </div>
            )}
            
            {hasDiscount && (seniorCount + pwdCount > 0) && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                <p><strong>{seniorCount + pwdCount} guest(s)</strong> eligible for discount verification.</p>
                <p className="text-blue-600 mt-1">Please complete ID verification below to avail the discount.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Verification Layer */}
        {hasDiscount && (
          <GuestVerificationLayer
            totalGuests={search.adultCount + search.childCount}
            pricePerPerson={calculatedTotal / (search.adultCount + search.childCount || 1)}
            numberOfNights={Math.ceil((search.checkOut.getTime() - search.checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 1}
            seniorCount={seniorCount}
            pwdCount={pwdCount}
            onVerificationComplete={(verified, discount) => {
              setVerifiedGuests(verified);
              setVerificationDiscount(discount);
              console.log("Verification complete:", { verified, discount });
            }}
          />
        )}

        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("card");
                  }}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    paymentMethod === "card"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <div>Credit/Debit Card</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("gcash");
                  }}
                  className={`p-4 rounded-lg border-2 font-medium transition-all ${
                    paymentMethod === "gcash"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className="w-6 h-6 mx-auto mb-2" />
                  <div>GCash</div>
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === "card" && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <CardElement
                      id="payment-element"
                      className="text-sm"
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": {
                              color: "#aab7c4",
                            },
                          },
                        },
                      }}
                    />
                  </div>

                  {/* Test Credentials */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <div className="font-medium text-yellow-800 mb-1">Test Credentials:</div>
                        <div className="text-yellow-700">Card: 4242 4242 4242 4242</div>
                        <div className="text-yellow-700">MM/YY: 12/35</div>
                        <div className="text-yellow-700">CVC: 123</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 inline mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* GCash Payment Form */}
              {paymentMethod === "gcash" && (
                <GCashPaymentForm
                  totalCost={paymentIntent.totalCost}
                  onPaymentSubmit={onGCashSubmit}
                  isLoading={isGCashLoading}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {paymentMethod === "card" && (
          <Button
            disabled={isLoading}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Confirm Booking
              </div>
            )}
          </Button>
        )}
      </form>

      {/* Trust Indicators */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-500" />
            Secure Payment
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Instant Confirmation
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-green-500" />
            24/7 Support
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingForm;
