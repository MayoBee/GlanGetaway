import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import useAppContext from "../hooks/useAppContext";
import * as apiClient from "../api-client";

const AddHotel = () => {
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
    onSuccess: () => {
      showToast({
        title: "Beach Resort Added Successfully",
        description:
          "Your beach resort has been added to the platform successfully! Redirecting to My Resorts...",
        type: "SUCCESS",
      });
      // Redirect to My Hotels page after successful save
      setTimeout(() => {
        navigate("/my-hotels");
      }, 1500); // Give user time to see the success message
    },
    onError: (error: any) => {
      console.error("Error adding hotel:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      // Show alert for debugging
      const errorInfo = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      alert("Backend Error: " + errorInfo);
      
      // Try to extract more details from the error response
      let errorMessage = "There was an error saving your beach resort. Please try again.";
      
      if (error.response?.data) {
        // Log the full response for debugging
        console.log("Full error response:", JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          // Handle validation errors from backend
          const validationErrors = error.response.data.errors;
          if (Array.isArray(validationErrors)) {
            errorMessage = validationErrors.map((e: any) => e.message).join(", ");
          } else {
            errorMessage = JSON.stringify(validationErrors);
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast({
        title: "Failed to Add Resort",
        description: errorMessage,
        type: "ERROR",
      });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return <ManageHotelForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddHotel;
