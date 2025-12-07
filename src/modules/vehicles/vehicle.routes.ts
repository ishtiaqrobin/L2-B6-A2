import { Router } from "express";
import { vehicleControllers } from "./vehicle.controller";
import auth from "../../middleware/auth";

const router = Router();

// Create a new vehicle
router.post("/", auth("admin"), vehicleControllers.createVehicle);

// Get all vehicles
router.get("/", vehicleControllers.getVehicles);

// Get a specific vehicle
router.get("/:vehicleId", vehicleControllers.getVehicle);

// Update a vehicle
router.put("/:vehicleId", auth("admin"), vehicleControllers.updateVehicle);

// Delete a vehicle
router.delete("/:vehicleId", auth("admin"), vehicleControllers.deleteVehicle);

export const vehicleRoutes = router;
