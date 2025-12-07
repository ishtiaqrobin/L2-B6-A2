import { Router } from "express";
import { bookingControllers } from "./booking.controller";
import auth from "../../middleware/auth";

const router = Router();

// Create a new booking
router.post("/", auth("admin", "customer"), bookingControllers.createBooking);

// Get all bookings
router.get("/", auth("admin", "customer"), bookingControllers.getBookings);

// Update a booking
router.put(
  "/:bookingId",
  auth("admin", "customer"),
  bookingControllers.updateBooking
);

export const bookingRoutes = router;
