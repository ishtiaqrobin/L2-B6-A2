import { Request, Response } from "express";
import { authServices } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
  const { role } = req.body;

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
    const { id, name, email, phone, role } = result.rows[0];

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id,
        name,
        email,
        phone,
        role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error" + error.message,
      errors: error,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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
    });
  }
};

export const authControllers = {
  createUser,
  loginUser,
};
