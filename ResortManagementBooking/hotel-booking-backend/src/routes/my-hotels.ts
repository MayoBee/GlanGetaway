import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../../../shared/types";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your-cloudinary-cloud-name" &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "your-cloudinary-api-key" &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== "your-cloudinary-api-secret"
  );
};

// Local storage configuration for fallback
const localUploadDir = path.join(__dirname, "..", "..", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const localUpload = multer({
  storage: localStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.post(
  "/",
  verifyToken,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type")
      .notEmpty()
      .isArray({ min: 1 })
      .withMessage("Select at least one hotel type"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("starRating")
      .notEmpty()
      .isNumeric()
      .withMessage("Star rating is required and must be a number"),
    body("adultCount")
      .notEmpty()
      .isNumeric()
      .withMessage("Adult count is required and must be a number"),
    body("childCount")
      .notEmpty()
      .isNumeric()
      .withMessage("Child count is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6),
  async (req: Request, res: Response) => {
    console.log("=== POST /api/my-hotels called ===");
    console.log("Request body:", req.body);
    console.log("Files:", req.files);
    
    try {
      const imageFiles = (req as any).files as any[];
      console.log("Image files count:", imageFiles?.length);
      
      const newHotel: HotelType = req.body;
      console.log("newHotel before parse:", newHotel);

      // Ensure type is always an array
      if (typeof newHotel.type === "string") {
        newHotel.type = [newHotel.type];
      }

      // Handle nested objects from FormData
      newHotel.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
        facebook: req.body["contact.facebook"] || "",
        instagram: req.body["contact.instagram"] || "",
        tiktok: req.body["contact.tiktok"] || "",
      };

      newHotel.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      // Parse amenities from FormData
      const amenities: Array<{
        id: string;
        name: string;
        price: number;
        description?: string;
      }> = [];
      let amenityIndex = 0;
      while (req.body[`amenities[${amenityIndex}][id]`]) {
        amenities.push({
          id: req.body[`amenities[${amenityIndex}][id]`],
          name: req.body[`amenities[${amenityIndex}][name]`],
          price: parseFloat(req.body[`amenities[${amenityIndex}][price]`]) || 0,
          description: req.body[`amenities[${amenityIndex}][description]`] || "",
        });
        amenityIndex++;
      }
      if (amenities.length > 0) {
        newHotel.amenities = amenities;
      }

      // Handle discounts from FormData
      newHotel.discounts = {
        seniorCitizenEnabled: req.body["discounts.seniorCitizenEnabled"] === "true" || req.body["discounts.seniorCitizenEnabled"] === true,
        seniorCitizenPercentage: parseFloat(req.body["discounts.seniorCitizenPercentage"]) || 20,
        pwdEnabled: req.body["discounts.pwdEnabled"] === "true" || req.body["discounts.pwdEnabled"] === true,
        pwdPercentage: parseFloat(req.body["discounts.pwdPercentage"]) || 20,
        customDiscounts: []
      };

      // Parse custom discounts from FormData
      const customDiscounts: Array<{
        id: string;
        name: string;
        percentage: number;
        promoCode: string;
        isEnabled: boolean;
        maxUses?: number;
        validUntil?: string;
      }> = [];
      let discountIndex = 0;
      while (req.body[`discounts.customDiscounts[${discountIndex}][id]`]) {
        const maxUsesVal = req.body[`discounts.customDiscounts[${discountIndex}][maxUses]`];
        const validUntilVal = req.body[`discounts.customDiscounts[${discountIndex}][validUntil]`];
        customDiscounts.push({
          id: req.body[`discounts.customDiscounts[${discountIndex}][id]`],
          name: req.body[`discounts.customDiscounts[${discountIndex}][name]`],
          percentage: parseFloat(req.body[`discounts.customDiscounts[${discountIndex}][percentage]`]) || 0,
          promoCode: req.body[`discounts.customDiscounts[${discountIndex}][promoCode]`],
          isEnabled: req.body[`discounts.customDiscounts[${discountIndex}][isEnabled]`] === "true" || req.body[`discounts.customDiscounts[${discountIndex}][isEnabled]`] === true,
          maxUses: maxUsesVal ? parseInt(maxUsesVal) : undefined,
          validUntil: validUntilVal || undefined,
        });
        discountIndex++;
      }
      if (customDiscounts.length > 0) {
        newHotel.discounts!.customDiscounts = customDiscounts;
      }

      // Handle image uploads only if files are provided
      let imageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        try {
          imageUrls = await uploadImages(imageFiles);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Continue without images if upload fails
          imageUrls = [];
        }
      }

      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;
      
      // Set approval status - resorts need admin approval
      newHotel.isApproved = false;

      const hotel = new Hotel(newHotel);
      await hotel.save();

      res.status(201).json({
        ...hotel.toObject(),
        message: "Resort submitted for approval. It will be visible to users once approved by an administrator."
      });
    } catch (error: any) {
      console.error("Error creating hotel:", error);
      
      // Handle validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors = error.errors.map((err: any) => ({
          field: err.path,
          message: err.msg,
        }));
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationErrors 
        });
      }
      
      // Handle other errors
      res.status(500).json({ 
        message: "Something went wrong",
        error: error.message || "Unknown error"
      });
    }
  }
);

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  const id = req.params.id.toString();
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId,
    });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      console.log("=== PUT /api/my-hotels/:hotelId called ===");
      console.log("Request body:", req.body);
      console.log("Hotel ID:", req.params.hotelId);
      console.log("User ID:", req.userId);
      console.log("Files:", (req as any).files);
      console.log("Files length:", (req as any).files?.length);

      // First, find the existing hotel
      const existingHotel = await Hotel.findOne({
        _id: req.params.hotelId,
        userId: req.userId,
      });

      if (!existingHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      // Prepare update data
      const updateData: any = {
        name: req.body.name,
        city: req.body.city,
        country: req.body.country,
        description: req.body.description,
        type: Array.isArray(req.body.type) ? req.body.type : [req.body.type],
        pricePerNight: Number(req.body.pricePerNight),
        starRating: Number(req.body.starRating),
        adultCount: Number(req.body.adultCount),
        childCount: Number(req.body.childCount),
        facilities: Array.isArray(req.body.facilities)
          ? req.body.facilities
          : [req.body.facilities],
        lastUpdated: new Date(),
      };

      // Handle contact information
      updateData.contact = {
        phone: req.body["contact.phone"] || "",
        email: req.body["contact.email"] || "",
        website: req.body["contact.website"] || "",
        facebook: req.body["contact.facebook"] || "",
        instagram: req.body["contact.instagram"] || "",
        tiktok: req.body["contact.tiktok"] || "",
      };

      // Handle policies
      updateData.policies = {
        checkInTime: req.body["policies.checkInTime"] || "",
        checkOutTime: req.body["policies.checkOutTime"] || "",
        cancellationPolicy: req.body["policies.cancellationPolicy"] || "",
        petPolicy: req.body["policies.petPolicy"] || "",
        smokingPolicy: req.body["policies.smokingPolicy"] || "",
      };

      // Parse amenities from FormData
      const amenities: Array<{
        id: string;
        name: string;
        price: number;
        description?: string;
      }> = [];
      let amenityIndex = 0;
      while (req.body[`amenities[${amenityIndex}][id]`]) {
        amenities.push({
          id: req.body[`amenities[${amenityIndex}][id]`],
          name: req.body[`amenities[${amenityIndex}][name]`],
          price: parseFloat(req.body[`amenities[${amenityIndex}][price]`]) || 0,
          description: req.body[`amenities[${amenityIndex}][description]`] || "",
        });
        amenityIndex++;
      }
      if (amenities.length > 0) {
        updateData.amenities = amenities;
      }

      // Handle discounts from FormData
      updateData.discounts = {
        seniorCitizenEnabled: req.body["discounts.seniorCitizenEnabled"] === "true" || req.body["discounts.seniorCitizenEnabled"] === true,
        seniorCitizenPercentage: parseFloat(req.body["discounts.seniorCitizenPercentage"]) || 20,
        pwdEnabled: req.body["discounts.pwdEnabled"] === "true" || req.body["discounts.pwdEnabled"] === true,
        pwdPercentage: parseFloat(req.body["discounts.pwdPercentage"]) || 20,
        customDiscounts: []
      };

      // Parse custom discounts from FormData
      const customDiscounts: Array<{
        id: string;
        name: string;
        percentage: number;
        promoCode: string;
        isEnabled: boolean;
        maxUses?: number;
        validUntil?: string;
      }> = [];
      let discountIndex = 0;
      while (req.body[`discounts.customDiscounts[${discountIndex}][id]`]) {
        const maxUsesVal = req.body[`discounts.customDiscounts[${discountIndex}][maxUses]`];
        const validUntilVal = req.body[`discounts.customDiscounts[${discountIndex}][validUntil]`];
        customDiscounts.push({
          id: req.body[`discounts.customDiscounts[${discountIndex}][id]`],
          name: req.body[`discounts.customDiscounts[${discountIndex}][name]`],
          percentage: parseFloat(req.body[`discounts.customDiscounts[${discountIndex}][percentage]`]) || 0,
          promoCode: req.body[`discounts.customDiscounts[${discountIndex}][promoCode]`],
          isEnabled: req.body[`discounts.customDiscounts[${discountIndex}][isEnabled]`] === "true" || req.body[`discounts.customDiscounts[${discountIndex}][isEnabled]`] === true,
          maxUses: maxUsesVal ? parseInt(maxUsesVal) : undefined,
          validUntil: validUntilVal || undefined,
        });
        discountIndex++;
      }
      if (customDiscounts.length > 0) {
        updateData.discounts!.customDiscounts = customDiscounts;
      }

      console.log("Update data:", updateData);

      // Update the hotel
      // Handle image uploads if any
      const files = (req as any).files as any[];
      let finalImageUrls: string[] = [];
      
      if (files && files.length > 0) {
        // Upload new images
        const newImageUrls = await uploadImages(files);
        
        // Get existing image URLs from request body
        const existingImageUrls = req.body.imageUrls
          ? Array.isArray(req.body.imageUrls)
            ? req.body.imageUrls
            : [req.body.imageUrls]
          : [];
        
        // Combine existing and new images
        finalImageUrls = [...existingImageUrls, ...newImageUrls];
      } else {
        // No new files, keep existing images
        finalImageUrls = req.body.imageUrls
          ? Array.isArray(req.body.imageUrls)
            ? req.body.imageUrls
            : [req.body.imageUrls]
          : [];
      }
      
      // Update the hotel with all image URLs
      updateData.imageUrls = finalImageUrls;
      
      const updatedHotel = await Hotel.findByIdAndUpdate(
        req.params.hotelId,
        updateData,
        { new: true }
      );

      if (!updatedHotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      res.status(200).json(updatedHotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      console.error("Request body:", req.body);
      console.error("Hotel ID:", req.params.hotelId);
      console.error("User ID:", req.userId);
      res.status(500).json({
        message: "Something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

async function uploadImages(imageFiles: any[]) {
  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    console.log("⚠️ Cloudinary not configured, using local storage fallback");
    
    // Use local storage fallback - save files locally and return local URLs
    const imageUrls: string[] = [];
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    
    for (const image of imageFiles) {
      const uniqueName = `${crypto.randomUUID()}${path.extname(image.originalname)}`;
      const filePath = path.join(localUploadDir, uniqueName);
      
      // Write file to disk
      fs.writeFileSync(filePath, image.buffer);
      
      // Return local URL
      const imageUrl = `${backendUrl}/uploads/${uniqueName}`;
      imageUrls.push(imageUrl);
    }
    
    return imageUrls;
  }
  
  // Use Cloudinary if configured
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer as Uint8Array).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI, {
      secure: true, // Force HTTPS URLs
      transformation: [
        { width: 800, height: 600, crop: "fill" },
        { quality: "auto" },
      ],
    });
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

export default router;
