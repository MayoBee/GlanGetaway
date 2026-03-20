import { useFormContext, useFieldArray } from "react-hook-form";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "../../components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "../../components/ui/dialog";
import { 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  Tag, 
  Percent,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export type CustomDiscountFormData = {
  id: string;
  name: string;
  percentage: number;
  promoCode: string;
  isEnabled: boolean;
  maxUses?: number;
  validUntil?: string;
};

export type DiscountsFormData = {
  seniorCitizenEnabled: boolean;
  seniorCitizenPercentage: number;
  pwdEnabled: boolean;
  pwdPercentage: number;
  customDiscounts: CustomDiscountFormData[];
};

// Generate a random promo code
const generatePromoCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "PROMO-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const DiscountsSection = () => {
  const { control, register, setValue, watch } = useFormContext<{
    discounts: DiscountsFormData;
  }>();
  
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [newDiscountName, setNewDiscountName] = useState("");
  const [newDiscountPercentage, setNewDiscountPercentage] = useState(10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "discounts.customDiscounts"
  });

  // Watch standard discounts
  const seniorCitizenEnabled = watch("discounts.seniorCitizenEnabled");
  const pwdEnabled = watch("discounts.pwdEnabled");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRegenerateCode = (index: number) => {
    const newCode = generatePromoCode();
    setValue(`discounts.customDiscounts.${index}.promoCode`, newCode);
  };

  const handleAddDiscount = () => {
    if (newDiscountName.trim()) {
      append({
        id: Date.now().toString(),
        name: newDiscountName,
        percentage: newDiscountPercentage,
        promoCode: generatePromoCode(),
        isEnabled: true,
        maxUses: undefined,
        validUntil: undefined
      });
      setNewDiscountName("");
      setNewDiscountPercentage(10);
      setIsAddDiscountOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Discount Settings</h2>
        <p className="text-gray-600">
          Configure discounts for your beach resort. These discounts will be available to guests during booking.
        </p>
      </div>

      {/* Standard Discounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            Standard Discounts
          </CardTitle>
          <CardDescription>
            Enable discounts for Senior Citizens and Persons with Disabilities (PWD)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Senior Citizen Discount */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="seniorCitizenEnabled"
              {...register("discounts.seniorCitizenEnabled")}
              defaultChecked={true}
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="seniorCitizenEnabled"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Senior Citizen Discount
              </Label>
              <p className="text-xs text-gray-600">
                Enable this to allow senior citizens (60+) to avail of a discount
              </p>
              {seniorCitizenEnabled && (
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    {...register("discounts.seniorCitizenPercentage", { valueAsNumber: true })}
                    defaultValue={20}
                  />
                  <span className="text-sm text-gray-600">% off</span>
                </div>
              )}
            </div>
          </div>

          {/* PWD Discount */}
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="pwdEnabled"
              {...register("discounts.pwdEnabled")}
              defaultChecked={true}
            />
            <div className="flex-1 space-y-2">
              <Label
                htmlFor="pwdEnabled"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                PWD (Person with Disability) Discount
              </Label>
              <p className="text-xs text-gray-600">
                Enable this to allow persons with disabilities to avail of a discount
              </p>
              {pwdEnabled && (
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20"
                    {...register("discounts.pwdPercentage", { valueAsNumber: true })}
                    defaultValue={20}
                  />
                  <span className="text-sm text-gray-600">% off</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Discounts / Promo Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Custom Discounts & Promo Codes
          </CardTitle>
          <CardDescription>
            Create custom discount categories with unique promo codes for special offers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p>No custom discounts yet</p>
              <p className="text-sm">Add custom discounts to offer special promotions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={`customDiscounts.${index}.isEnabled`}
                        {...register(`discounts.customDiscounts.${index}.isEnabled`)}
                        defaultChecked={true}
                      />
                      <div className="space-y-1">
                        <Input
                          {...register(`discounts.customDiscounts.${index}.name`)}
                          className="font-semibold w-48"
                          placeholder="Discount Name"
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            {...register(`discounts.customDiscounts.${index}.promoCode`)}
                            className="w-40 font-mono text-sm"
                            placeholder="PROMO-CODE"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleCopyCode(watch(`discounts.customDiscounts.${index}.promoCode`))}
                          >
                            {copiedCode === watch(`discounts.customDiscounts.${index}.promoCode`) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRegenerateCode(index)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-8">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        className="w-20"
                        {...register(`discounts.customDiscounts.${index}.percentage`, { valueAsNumber: true })}
                      />
                      <span className="text-sm text-gray-600">% off</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min={1}
                        className="w-24"
                        placeholder="Max uses"
                        {...register(`discounts.customDiscounts.${index}.maxUses`, { valueAsNumber: true })}
                      />
                      <span className="text-sm text-gray-600">max uses</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="date"
                        className="w-40"
                        {...register(`discounts.customDiscounts.${index}.validUntil`)}
                      />
                      <span className="text-sm text-gray-600">valid until</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Discount Dialog */}
          <Dialog open={isAddDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Discount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Discount</DialogTitle>
                <DialogDescription>
                  Create a new discount category with a unique promo code
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="discountName">Discount Name</Label>
                  <Input
                    id="discountName"
                    placeholder="e.g., Sports Club Member, Government Employee"
                    value={newDiscountName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDiscountName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Discount Percentage</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min={1}
                    max={100}
                    value={newDiscountPercentage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDiscountPercentage(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDiscountOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDiscount} disabled={!newDiscountName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Discount
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Important Information</h4>
            <ul className="text-sm text-blue-800 mt-1 list-disc list-inside">
              <li>Senior citizens must present a valid Senior Citizen ID upon check-in</li>
              <li>PWD guests must present a valid PWD ID upon check-in</li>
              <li>Promo codes can be shared with guests for special discounts</li>
              <li>Discounts cannot be combined unless explicitly enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountsSection;
