import express, { Request, Response } from "express";
import initDB from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/booking/booking.routes";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize the database
initDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Bangla Ride API!");
});

//* Auth Routes
app.use("/api/v1/auth", authRoutes);

//* User Routes
app.use("/api/v1/users", userRoutes);

//* Vehicle Routes
app.use("/api/v1/vehicles", vehicleRoutes);

//* Booking Routes
app.use("/api/v1/bookings", bookingRoutes);

// Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
