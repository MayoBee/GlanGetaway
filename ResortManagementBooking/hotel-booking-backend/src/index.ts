import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import imageService from "./services/imageService";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";
import bookingsManagementRoutes from "./routes/bookings";
import healthRoutes from "./routes/health";
import businessInsightsRoutes from "./routes/business-insights";
import reportRoutes from "./routes/reports";
import websiteFeedbackRoutes from "./routes/website-feedback";
import resortApprovalRoutes from "./routes/resort-approval";
import adminManagementRoutes from "./routes/admin-management";
import adminRoutes from "./routes/admin";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";

// New Resort Management Routes
import staffManagementRoutes from "./routes/staff-management";
import dashboardRoutes from "./routes/dashboard";
import roomRoutes from "./routes/rooms";
import pricingRoutes from "./routes/pricing";
import amenitiesRoutes from "./routes/amenities";
import housekeepingRoutes from "./routes/housekeeping-maintenance";
import billingRoutes from "./routes/billing";
import resortReportsRoutes from "./routes/resort-reports";
import debugAuthRoutes from "./routes/debug-auth";
import quickFixAdminRoutes from "./routes/quick-fix-admin";

// Smart Features Routes
import roomBlocksRoutes from "./routes/room-blocks";
import paymentsRoutes from "./routes/payments";
import identityVerificationRoutes from "./routes/identity-verification";
import weatherTriggerRoutes from "./routes/weather-triggers";
import amenitySlotsRoutes from "./routes/amenity-slots";
import housekeepingTasksRoutes from "./routes/housekeeping-tasks";

// Environment Variables Validation
const requiredEnvVars = [
  "MONGODB_CONNECTION_STRING",
  "JWT_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "STRIPE_API_KEY",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`));
  process.exit(1);
}

console.log("✅ All required environment variables are present");
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
console.log(
  `🔗 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}`
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("☁️  Cloudinary configured successfully");

// MongoDB Connection with Error Handling
const connectDB = async () => {
  try {
    console.log("📡 Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string);
    console.log("✅ MongoDB connected successfully");
    console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("💡 Please check your MONGODB_CONNECTION_STRING");
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB connection error:", error);
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected successfully");
});

connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Trust proxy for production (fixes rate limiting issues)
app.set("trust proxy", 1);

// Rate limiting - more lenient for payment endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for general requests
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Special limiter for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Higher limit for payment requests
  message: "Too many payment requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", generalLimiter);
app.use("/api/hotels/*/bookings/payment-intent", paymentLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5173",
  "http://127.0.0.1:55112",
  "https://mern-booking-hotel.netlify.app",
  "https://mern-booking-hotel.netlify.app/",
  "https://hotel-mern-booking.vercel.app",
  "https://hotel-mern-booking.vercel.app/",
].filter((origin): origin is string => Boolean(origin));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow all Netlify and Vercel preview URLs
      if (origin.includes("netlify.app") || origin.includes("vercel.app")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log blocked origins in development
      if (process.env.NODE_ENV === "development") {
        console.log("CORS blocked origin:", origin);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
    ],
  })
);
// Explicit preflight handler for all routes
app.options(
  "*",
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow all Netlify and Vercel preview URLs
      if (origin.includes("netlify.app") || origin.includes("vercel.app")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 204,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
    ],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  // Ensure Vary header for CORS
  res.header("Vary", "Origin");
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hotel Booking Backend API is running 🚀</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/my-bookings", bookingRoutes);
app.use("/api/bookings", bookingsManagementRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/business-insights", businessInsightsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/website-feedback", websiteFeedbackRoutes);
app.use("/api/resort-approval", resortApprovalRoutes);
app.use("/api/admin-management", adminManagementRoutes);
app.use("/api/admin", adminRoutes);

// New Resort Management API Routes
app.use("/api/staff", staffManagementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/amenities", amenitiesRoutes);
app.use("/api/operations", housekeepingRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/resort-reports", resortReportsRoutes);
app.use("/api/debug-auth", debugAuthRoutes);
app.use("/api/quick-fix-admin", quickFixAdminRoutes);

// Smart Features API Routes
app.use("/api/room-blocks", roomBlocksRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/identity-verification", identityVerificationRoutes);
app.use("/api/weather-triggers", weatherTriggerRoutes);
app.use("/api/amenity-slots", amenitySlotsRoutes);
app.use("/api/housekeeping-tasks", housekeepingTasksRoutes);

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Hotel Booking API Documentation",
  })
);

// Serve uploaded files using the new image service
app.get('/uploads/:filename', (req, res) => {
  // Set CORS headers for image serving
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  imageService.serveImage(req, res);
});

// Also handle the old static route for backwards compatibility
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '..', '..', 'uploads')));

// Dynamic Port Configuration (for Coolify/VPS and local development)
const PORT = process.env.PORT || 7002;

const backendBaseUrl =
  process.env.BACKEND_URL?.replace(/\/$/, "") || `http://localhost:${PORT}`;

const server = app.listen(PORT, () => {
  console.log("🚀 ============================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🔗 Public: ${backendBaseUrl}`);
  console.log(`📚 API Docs: ${backendBaseUrl}/api-docs`);
  console.log(`💚 Health Check: ${backendBaseUrl}/api/health`);
  console.log("🚀 ============================================");
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal: string) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("🔒 HTTP server closed");

    try {
      await mongoose.connection.close();
      console.log("🔒 MongoDB connection closed");
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
