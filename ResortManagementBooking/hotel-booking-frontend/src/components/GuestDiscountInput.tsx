import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { 
  Badge 
} from "../components/ui/badge";
import { 
  Users,
  Percent,
  Ticket,
  AlertCircle,
  Check,
  Calculator,
  Info
} from "lucide-react";
import { 
  calculateDiscountSimple, 
  DiscountConfig,
  GuestDiscountInput as GuestDiscountInputType,
  DiscountCalculationResult,
  validateDiscountInput,
  validatePromoCode
} from "../lib/discountCalculation";

interface GuestDiscountInputProps {
  totalGuests: number;
  pricePerNight: number;
  numberOfNights: number;
  discountConfig: DiscountConfig;
  onDiscountChange: (result: DiscountCalculationResult) => void;
}

const defaultDiscountConfig: DiscountConfig = {
  seniorCitizenEnabled: true,
  seniorCitizenPercentage: 20,
  pwdEnabled: true,
  pwdPercentage: 20,
  customDiscounts: []
};

const GuestDiscountInputComponent = ({
  totalGuests,
  pricePerNight,
  numberOfNights,
  discountConfig = defaultDiscountConfig,
  onDiscountChange
}: GuestDiscountInputProps) => {
  const [hasDiscount, setHasDiscount] = useState(false);
  const [seniorCitizens, setSeniorCitizens] = useState(0);
  const [pwdGuests, setPwdGuests] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [discountResult, setDiscountResult] = useState<DiscountCalculationResult | null>(null);

  // Calculate discount whenever inputs change
  useEffect(() => {
    if (!hasDiscount && !promoCode) {
      // No discount applied
      const result = calculateDiscountSimple({
        pricePerNight,
        numberOfNights,
        totalGuests,
        guestDiscountInput: {
          totalGuests,
          seniorCitizens: 0,
          pwdGuests: 0,
          promoCode: "",
          hasDiscount: false
        },
        discountConfig
      });
      setDiscountResult(result);
      onDiscountChange(result);
      return;
    }

    // Validate inputs
    const guestInput: GuestDiscountInput = {
      totalGuests,
      seniorCitizens,
      pwdGuests,
      promoCode,
      hasDiscount
    };

    const validation = validateDiscountInput(guestInput, totalGuests);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid discount configuration");
      return;
    }

    // Validate promo code if provided
    if (promoCode) {
      const promoValidation = validatePromoCode(promoCode, discountConfig);
      if (!promoValidation.isValid) {
        setPromoError(promoValidation.error || "Invalid promo code");
        setPromoSuccess(false);
      } else {
        setPromoError(null);
        setPromoSuccess(true);
      }
    } else {
      setPromoError(null);
      setPromoSuccess(false);
    }

    setValidationError(null);

    // Calculate discount
    const result = calculateDiscountSimple({
      pricePerNight,
      numberOfNights,
      totalGuests,
      guestDiscountInput: {
        ...guestInput,
        hasDiscount: true
      },
      discountConfig
    });

    setDiscountResult(result);
    onDiscountChange(result);
  }, [hasDiscount, seniorCitizens, pwdGuests, promoCode, totalGuests, pricePerNight, numberOfNights, discountConfig, onDiscountChange]);

  const handleSeniorCitizensChange = (value: string) => {
    const count = parseInt(value) || 0;
    setSeniorCitizens(Math.min(count, totalGuests));
  };

  const handlePwdGuestsChange = (value: string) => {
    const count = parseInt(value) || 0;
    setPwdGuests(Math.min(count, totalGuests));
  };

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value.toUpperCase());
    setPromoError(null);
    setPromoSuccess(false);
  };

  const getPromoValidation = () => {
    if (!promoCode) return null;
    return validatePromoCode(promoCode, discountConfig);
  };

  const discountedGuests = seniorCitizens + pwdGuests;
  const remainingGuests = totalGuests - discountedGuests;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-green-600" />
          Discount & Promo Codes
        </CardTitle>
        <CardDescription>
          Apply eligible discounts or promo codes to your booking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Discount Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Checkbox
            id="hasDiscount"
            checked={hasDiscount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHasDiscount(e.target.checked)}
          />
          <Label htmlFor="hasDiscount" className="font-medium cursor-pointer">
            I have eligible discounts (Senior Citizen / PWD)
          </Label>
        </div>

        {/* Discount Input Fields */}
        {hasDiscount && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Senior Citizens */}
              <div className="space-y-2">
                <Label htmlFor="seniorCitizens" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Senior Citizens
                  {discountConfig.seniorCitizenEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      {discountConfig.seniorCitizenPercentage}% off
                    </Badge>
                  )}
                </Label>
                <Input
                  id="seniorCitizens"
                  type="number"
                  min="0"
                  max={totalGuests}
                  value={seniorCitizens}
                  onChange={(e) => handleSeniorCitizensChange(e.target.value)}
                  placeholder="Number of senior citizens"
                  disabled={!discountConfig.seniorCitizenEnabled}
                />
                {!discountConfig.seniorCitizenEnabled && (
                  <p className="text-xs text-gray-500">Senior citizen discount is not available</p>
                )}
              </div>

              {/* PWD Guests */}
              <div className="space-y-2">
                <Label htmlFor="pwdGuests" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  PWD (Persons with Disabilities)
                  {discountConfig.pwdEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      {discountConfig.pwdPercentage}% off
                    </Badge>
                  )}
                </Label>
                <Input
                  id="pwdGuests"
                  type="number"
                  min="0"
                  max={totalGuests}
                  value={pwdGuests}
                  onChange={(e) => handlePwdGuestsChange(e.target.value)}
                  placeholder="Number of PWD guests"
                  disabled={!discountConfig.pwdEnabled}
                />
                {!discountConfig.pwdEnabled && (
                  <p className="text-xs text-gray-500">PWD discount is not available</p>
                )}
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{validationError}</span>
              </div>
            )}

            {/* Guest Summary */}
            {discountedGuests > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Discount Summary</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{seniorCitizens} Senior Citizen(s) × {discountConfig.seniorCitizenPercentage}% off</p>
                  <p>{pwdGuests} PWD Guest(s) × {discountConfig.pwdPercentage}% off</p>
                  <p>{remainingGuests} Regular Guest(s) at full price</p>
                </div>
              </div>
            )}
          </div>
        )}

        <hr className="my-4" />

        {/* Promo Code Section */}
        <div className="space-y-4">
          <Label htmlFor="promoCode" className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-orange-500" />
            Promo Code
          </Label>
          <div className="flex gap-2">
            <Input
              id="promoCode"
              type="text"
              value={promoCode}
              onChange={(e) => handlePromoCodeChange(e.target.value)}
              placeholder="Enter promo code"
              className="uppercase font-mono"
            />
            {promoCode && (
              <div className="flex items-center">
                {promoSuccess ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="h-4 w-4" /> Valid
                  </span>
                ) : promoError ? (
                  <span className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" /> Invalid
                  </span>
                ) : null}
              </div>
            )}
          </div>
          {promoError && (
            <p className="text-sm text-red-600">{promoError}</p>
          )}
          {promoSuccess && (
            <p className="text-sm text-green-600">
              Promo code applied! {getPromoValidation()?.discount?.name} - {getPromoValidation()?.discount?.percentage}% off
            </p>
          )}
        </div>

        <hr className="my-4" />

        {/* Discount Calculation Display */}
        {discountResult && (discountResult.totalSavings > 0 || promoSuccess) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Discount Calculation</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Price:</span>
                <span className="line-through text-gray-400">₱{discountResult.originalPrice.toFixed(2)}</span>
              </div>
              
              {discountResult.discountBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-green-700">
                  <span>{item.category} ({item.count} × {item.percentage}%):</span>
                  <span>-₱{item.discountAmount.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="flex justify-between font-bold text-green-800 pt-2 border-t border-green-200">
                <span>Total Savings:</span>
                <span>-₱{discountResult.totalSavings.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-green-800">
                <span>Final Payable:</span>
                <span>₱{discountResult.finalPayableAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="disclaimer"
              checked={agreedToDisclaimer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreedToDisclaimer(e.target.checked)}
            />
            <Label htmlFor="disclaimer" className="text-sm cursor-pointer">
              I confirm that all information provided is accurate. Senior citizens and PWD guests 
              must present valid ID upon check-in to avail of the discount. Failure to provide 
              valid documentation will result in the standard rate being charged.
            </Label>
          </div>
          {!agreedToDisclaimer && hasDiscount && (
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Please accept the disclaimer to proceed with discounts
            </p>
          )}
        </div>

        {/* Hidden Calculation Result for Form Submission */}
        {discountResult && (
          <input type="hidden" name="discountResult" value={JSON.stringify(discountResult)} />
        )}
      </CardContent>
    </Card>
  );
};

export default GuestDiscountInputComponent;
