import express, { Request, Response } from "express";
import initDB from "./config/db";
import { userRoutes } from "./modules/user/user.routes";
import { authRoutes } from "./modules/auth/auth.routes";

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

// Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
