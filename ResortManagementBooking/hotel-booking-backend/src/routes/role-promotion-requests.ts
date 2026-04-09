import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import verifyToken from "../middleware/auth";
// import RolePromotionRequest from "../models/rolePromotionRequest"; // Assuming model exists

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'promotion-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image and document files
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

const router = express.Router();

// POST create request with multer upload
router.post(
  "/",
  verifyToken,
  upload.single('document'),
  async (req: Request, res: Response) => {
    try {
      // Placeholder for creating promotion request
      // const newRequest = new RolePromotionRequest({
      //   userId: req.userId,
      //   document: req.file ? `/uploads/${req.file.filename}` : undefined,
      //   ...req.body
      // });
      // await newRequest.save();

      res.status(201).json({ message: "Promotion request created successfully" });
    } catch (error) {
      console.error("Error creating promotion request:", error);
      res.status(500).json({ message: "Failed to create promotion request" });
    }
  }
);

// GET pending requests
router.get("/pending", verifyToken, async (req: Request, res: Response) => {
  try {
    // Placeholder for fetching pending requests
    // const pendingRequests = await RolePromotionRequest.find({ status: 'pending' });

    res.json({ requests: [] }); // Placeholder
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

// POST approve request
router.post("/approve", verifyToken, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    // Placeholder for approving request
    // await RolePromotionRequest.findByIdAndUpdate(requestId, { status: 'approved' });

    res.json({ message: "Request approved successfully" });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: "Failed to approve request" });
  }
});

// POST decline request
router.post("/decline", verifyToken, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.body;
    // Placeholder for declining request
    // await RolePromotionRequest.findByIdAndUpdate(requestId, { status: 'declined' });

    res.json({ message: "Request declined successfully" });
  } catch (error) {
    console.error("Error declining request:", error);
    res.status(500).json({ message: "Failed to decline request" });
  }
});

// DELETE request
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Placeholder for deleting request
    // await RolePromotionRequest.findByIdAndDelete(id);

    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Failed to delete request" });
  }
});

export default router;