import { useMutation, useQuery } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import useAppContext from "../hooks/useAppContext";

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();
  const navigate = useNavigate();

  console.log("EditHotel - hotelId:", hotelId);
  console.log("EditHotel - current URL:", window.location.href);

  if (!hotelId) {
    console.error("No hotelId found in URL params");
    showToast({
      title: "Error",
      description: "No resort ID found. Please navigate from My Resorts page.",
      type: "ERROR",
    });
    navigate("/my-hotels");
    return null;
  }

  const { data: hotel } = useQuery(
    "fetchMyHotelById",
    () => apiClient.fetchMyHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelByIdJson, {
    onSuccess: () => {
      showToast({
        title: "Resort Updated Successfully",
        description:
          "Your resort details have been updated successfully! Redirecting to My Resorts...",
        type: "SUCCESS",
      });
      // Redirect to My Hotels page after successful update
      setTimeout(() => {
        navigate("/my-hotels");
      }, 1500); // Give user time to see the success message
    },
    onError: (error: any) => {
      console.error("=== EDIT HOTEL ERROR DETAILS ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error config:", error.config);
      console.error("Error response status:", error.response?.status);
      console.error("Error response status text:", error.response?.statusText);
      console.error("Error response headers:", error.response?.headers);
      console.error("Error response data:", error.response?.data);
      
      // Log the request that caused the error
      if (error.config) {
        console.log("=== REQUEST DETAILS ===");
        console.log("URL:", error.config.url);
        console.log("Method:", error.config.method);
        console.log("Headers:", error.config.headers);
        console.log("Data:", error.config.data);
      }
      
      let errorMessage = "";
      let errorTitle = "Failed to Update Resort";
      
      // Network/Connection errors
      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          errorTitle = "Request Timeout";
          errorMessage = "The request took too long to complete. Please check your internet connection and try again.";
        } else if (error.message === 'Network Error') {
          errorTitle = "Network Connection Error";
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
        } else {
          errorTitle = "Connection Error";
          errorMessage = "Unable to update resort. Please check your internet connection and try again.";
        }
      }
      // HTTP Status Code specific errors
      else if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorTitle = "Invalid Data";
            if (data.message) {
              errorMessage = `Validation error: ${data.message}`;
            } else if (data.errors && Array.isArray(data.errors)) {
              errorMessage = `Please fix the following issues: ${data.errors.map((e: any) => e.message).join(", ")}`;
            } else {
              errorMessage = "Please check all required fields and try again.";
            }
            break;
            
          case 401:
            errorTitle = "Authentication Error";
            errorMessage = "Your session has expired. Please log in again and retry.";
            break;
            
          case 403:
            errorTitle = "Permission Denied";
            errorMessage = "You don't have permission to update this resort.";
            break;
            
          case 404:
            errorTitle = "Resort Not Found";
            errorMessage = "The resort you're trying to update doesn't exist or has been deleted.";
            break;
            
          case 409:
            errorTitle = "Conflict Error";
            errorMessage = "This resort has been modified by another user. Please refresh and try again.";
            break;
            
          case 413:
            errorTitle = "File Too Large";
            errorMessage = "One or more images are too large. Please compress images and try again.";
            break;
            
          case 422:
            errorTitle = "Validation Error";
            if (data.message) {
              errorMessage = data.message;
            } else if (data.errors && Array.isArray(data.errors)) {
              errorMessage = data.errors.map((e: any) => e.message).join(", ");
            } else {
              errorMessage = "Please check all fields for correct formatting and required information.";
            }
            break;
            
          case 429:
            errorTitle = "Too Many Requests";
            errorMessage = "Please wait a moment before trying again.";
            break;
            
          case 500:
            errorTitle = "Server Error";
            errorMessage = "Our server encountered an error. Please try again in a few minutes.";
            break;
            
          case 502:
          case 503:
          case 504:
            errorTitle = "Service Unavailable";
            errorMessage = "Our servers are temporarily unavailable. Please try again in a few minutes.";
            break;
            
          default:
            errorTitle = "Update Failed";
            if (data.message) {
              errorMessage = data.message;
            } else {
              errorMessage = `An unexpected error occurred (${status}). Please try again or contact support if the problem persists.`;
            }
        }
      }
      
      // Fallback if no specific error message was set
      if (!errorMessage) {
        errorMessage = "Unable to update resort. Please try again or contact support if the problem persists.";
      }
      
      showToast({
        title: errorTitle,
        description: errorMessage,
        type: "ERROR",
      });
    },
  });

  const handleSave = (hotelFormData: any) => {
    // Log the data being sent for debugging
    console.log("=== EDIT HOTEL REQUEST DATA ===");
    console.log("Hotel ID:", hotelId);
    console.log("Form Data:", JSON.stringify(hotelFormData, null, 2));
    console.log("Form Data Keys:", Object.keys(hotelFormData));
    
    // Check for potential issues
    if (hotelFormData.imageFiles && Array.isArray(hotelFormData.imageFiles) && hotelFormData.imageFiles.length > 0) {
      console.log("Image Files:", hotelFormData.imageFiles.length, "files");
      hotelFormData.imageFiles.forEach((file: File, index: number) => {
        console.log(`File ${index}:`, file.name, file.size, file.type);
      });
    }
    
    // Don't add hotelId to the data - it comes from URL parameter
    mutate(hotelFormData);
  };

  return (
    <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isLoading} />
  );
};

export default EditHotel;
