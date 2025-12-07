import { Request, Response } from "express";
import { vehicleServices } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  const { daily_rent_price } = req.body;

  if (daily_rent_price === undefined || daily_rent_price === null) {
    return res.status(400).json({
      success: false,
      message: "Invalid daily rent price",
      errors: "`daily_rent_price` is required",
    });
  }

  if (typeof daily_rent_price !== "number" || Number.isNaN(daily_rent_price)) {
    return res.status(400).json({
      success: false,
      message: "Invalid daily rent price",
      errors: "Please provide a valid number for `daily_rent_price`",
    });
  }

  if (daily_rent_price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid daily rent price",
      errors: "`daily_rent_price` must be a positive number",
    });
  }

  try {
    const result = await vehicleServices.createVehicle(req.body);

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });

    console.log(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error " + error.message,
      errors: error,
    });
  }
};

const getVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicles();

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error " + error.message,
      errors: error,
    });
  }
};

const getVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getVehicle(
      req.params.vehicleId as string
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicle found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error " + error.message,
      errors: error,
    });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  const { daily_rent_price } = req.body;

  // daily_rent_price optional কিন্তু যদি পাঠানো হয় তাহলে validate করতে হবে
  if (daily_rent_price !== undefined && daily_rent_price !== null) {
    if (
      typeof daily_rent_price !== "number" ||
      Number.isNaN(daily_rent_price)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily rent price",
        errors: "Please provide a valid number for `daily_rent_price`",
      });
    }

    if (daily_rent_price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid daily rent price",
        errors: "`daily_rent_price` must be a positive number",
      });
    }
  }

  try {
    const result = await vehicleServices.updateVehicle(
      req.body,
      req.params.vehicleId as string
    );

    if (result.rowCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicle found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    });

    console.log(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error " + error.message,
      errors: error,
    });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.deleteVehicle(
      req.params.vehicleId as string
    );

    if (result.rowCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No vehicle found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error " + error.message,
      errors: error,
    });
  }
};

export const vehicleControllers = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
