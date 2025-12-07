import { Router } from "express";
import { authControllers } from "./auth.controller";

const router = Router();

// Signup
router.post("/signup", authControllers.createUser);

// Login
router.post("/signin", authControllers.loginUser);

export const authRoutes = router;
