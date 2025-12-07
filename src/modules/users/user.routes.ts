import { Router } from "express";
import { userControllers } from "./user.controller";
import auth from "../../middleware/auth";
import logger from "../../middleware/logger";

const router = Router();

// Get all users (only admin can access this route)
router.get("/", logger, auth("admin"), userControllers.getUsers);

// Update user (admin and customer can access this route)
router.put("/:id", auth("admin", "customer"), userControllers.updateUser);

// Delete user (only admin can access this route)
// Delete a user (only if no active bookings exist)
router.delete("/:id", auth("admin"), userControllers.deleteUser);

export const userRoutes = router;
