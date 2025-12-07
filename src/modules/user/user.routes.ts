import { Router } from "express";
import { userControllers } from "./user.controller";
import auth from "../../middleware/auth";
import logger from "../../middleware/logger";

const router = Router();

router.post("/", userControllers.createUser);

router.get("/", logger, auth("admin"), userControllers.getUsers);

router.get("/:id", userControllers.getUser);

router.put("/:id", userControllers.updateUser);

router.delete("/:id", userControllers.deleteUser);

export const userRoutes = router;
