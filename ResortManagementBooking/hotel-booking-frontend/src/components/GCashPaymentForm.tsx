import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, Smartphone } from "lucide-react";

type Props = {
  totalCost: number;
  downPaymentAmount: number;
  remainingAmount: number;
  onPaymentSubmit: (paymentData: GCashPaymentData) => void;
  isLoading?: boolean;
};

export type GCashPaymentData = {
  gcashNumber: string;
  referenceNumber: string;
  amountPaid: number;
  screenshotFile: File;
  paymentTime: Date;
};

const GCashPaymentForm = ({ totalCost, downPaymentAmount, remainingAmount, onPaymentSubmit, isLoading }: Props) => {
  const [gcashNumber, setGcashNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState(downPaymentAmount);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);

  // Abort FileReader on component unmount
  useEffect(() => {
    return () => {
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      
      // Abort any existing FileReader
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
      
      const reader = new FileReader();
      fileReaderRef.current = reader;
      
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        fileReaderRef.current = null;
      };
      
      reader.onerror = () => {
        fileReaderRef.current = null;
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!screenshotFile) {
      alert("Please upload a payment screenshot");
      return;
    }

    if (amountPaid < downPaymentAmount) {
      alert(`Amount paid (₱${amountPaid}) is less than required down payment (₱${downPaymentAmount})`);
      return;
    }

    const paymentData: GCashPaymentData = {
      gcashNumber,
      referenceNumber,
      amountPaid,
      screenshotFile,
      paymentTime: new Date(),
    };

    onPaymentSubmit(paymentData);
  };

  const clearFile = () => {
    setScreenshotFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">GCash Payment</h3>
          <p className="text-sm text-gray-600">Upload your payment screenshot to complete booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* GCash Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GCash Number
          </label>
          <input
            type="tel"
            value={gcashNumber}
            onChange={(e) => setGcashNumber(e.target.value)}
            placeholder="09XXXXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Reference Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Enter GCash reference number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Amount Paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid (₱)
          </label>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            min={downPaymentAmount}
            step="0.01"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {amountPaid < downPaymentAmount && (
            <p className="text-red-500 text-sm mt-1">
              Amount must be at least ₱{downPaymentAmount} (50% down payment)
            </p>
          )}
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Screenshot
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Payment screenshot"
                  className="max-w-full h-48 mx-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-8">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 font-medium hover:text-blue-700">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload Screenshot
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="font-semibold mb-1">Amount to Send:</div>
              <div className="text-xl font-bold text-green-600">₱{downPaymentAmount.toFixed(2)}</div>
              <div className="text-xs text-gray-500">This is 50% down payment of total cost (₱{totalCost.toFixed(2)})</div>
            </div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Send <strong>₱{downPaymentAmount.toFixed(2)}</strong> to the resort's GCash number</li>
              <li>Take a screenshot of the successful transaction</li>
              <li>Upload the screenshot with your GCash details above</li>
              <li>Wait for the resort owner to verify your payment</li>
              <li>Remaining balance (₱{remainingAmount.toFixed(2)}) will be paid on-site</li>
            </ol>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !screenshotFile || amountPaid < downPaymentAmount}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </span>
          ) : (
            "Submit Payment Screenshot"
          )}
        </button>
      </form>
    </div>
  );
};

export default GCashPaymentForm;
