import { Request, Response } from "express";
import { authServices } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
  const { role, email, password } = req.body;

  // Email lowercase enforcement
  if (email) {
    req.body.email = email.toLowerCase();
  }

  // Password validation: min 6 characters
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Invalid password",
      errors: "Password must be at least 6 characters long",
    });
  }

  // Validate role before hitting database
  if (role !== "admin" && role !== "customer") {
    return res.status(400).json({
      success: false,
      message: "Invalid role",
      errors: "Please provide a valid role",
    });
  }

  try {
    const result = await authServices.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error" + error.message,
      errors: error.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    // Email lowercase enforcement
    if (email) {
      email = email.toLowerCase();
    }

    const result = await authServices.loginUser(
      email as string,
      password as string
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error" + error.message,
      errors: error.message,
    });
  }
};

export const authControllers = {
  createUser,
  loginUser,
};
