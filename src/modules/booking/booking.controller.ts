import { Request, Response } from "express";
import { bookingServices } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  const { rent_start_date, rent_end_date } = req.body;

  // Date validation
  if (!rent_start_date || !rent_end_date) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
      errors: "rent_start_date and rent_end_date are required",
    });
  }

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);

  if (endDate <= startDate) {
    return res.status(400).json({
      success: false,
      message: "Invalid date range",
      errors: "rent_end_date must be after rent_start_date",
    });
  }

  try {
    const result = await bookingServices.createBooking(req.body);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    // Specific error handling
    if (error.message === "Vehicle not found") {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: error.message,
      });
    }

    if (error.message === "Vehicle is not available for booking") {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available",
        errors: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
      errors: error.message,
    });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "User information not found",
      });
    }

    const bookings = await bookingServices.getBookings(userId, userRole);

    if (bookings.length === 0) {
      const message =
        userRole === "admin" ? "No bookings found" : "You have no bookings yet";

      return res.status(200).json({
        success: true,
        message: message,
        data: [],
      });
    }

    const message =
      userRole === "admin"
        ? "Bookings retrieved successfully"
        : "Your bookings retrieved successfully";

    res.status(200).json({
      success: true,
      message: message,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
      errors: error.message,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { bookingId } = req.params;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  // User authentication check
  if (!userId || !userRole) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: "User information not found",
    });
  }

  // Status validation
  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
      errors: "status is required",
    });
  }

  // Role-based status validation
  if (userRole === "customer" && status !== "cancelled") {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
      errors: "Customers can only cancel bookings",
    });
  }

  if (userRole === "admin" && status !== "returned" && status !== "cancelled") {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
      errors: "Admin can only mark bookings as 'returned' or 'cancelled'",
    });
  }

  try {
    const result = await bookingServices.updateBooking(
      bookingId as string,
      status,
      userId,
      userRole
    );

    let message = "";
    if (status === "cancelled") {
      message = "Booking cancelled successfully";
    } else if (status === "returned") {
      message = "Booking marked as returned. Vehicle is now available";
    }

    res.status(200).json({
      success: true,
      message: message,
      data: result,
    });
  } catch (error: any) {
    // Specific error handling
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        errors: error.message,
      });
    }

    if (error.message === "You are not authorized to update this booking") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: error.message,
      });
    }

    if (
      error.message.includes(
        "Cannot cancel booking. Cancellation is only allowed before the start date"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking",
        errors: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
      errors: error.message,
    });
  }
};

export const bookingControllers = {
  createBooking,
  getBookings,
  updateBooking,
};
