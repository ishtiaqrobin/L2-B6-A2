import { Request, Response } from "express";
import { userServices } from "./user.service";

const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUsers();
    console.log("Result rows data: ", result.rows);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error " + error.message,
      details: error,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const targetUserId = req.params.id;

    // Authentication check
    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: "User information not found",
      });
    }

    // Authorization check: Customer শুধু নিজের profile update করতে পারবে
    if (
      userRole === "customer" &&
      userId !== parseInt(targetUserId as string)
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You can only update your own profile",
      });
    }

    // Role validation: Customer role change করতে পারবে না
    if (userRole === "customer" && req.body.role !== undefined) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "You cannot change your own role",
      });
    }

    const result = await userServices.updateUser(
      req.body,
      targetUserId as string,
      userId,
      userRole as string
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    // Specific error handling
    if (error.message === "Only admin can update user role") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: error.message,
      });
    }

    if (error.message === "No fields to update") {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
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

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.deleteUser(req.params.id as string);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  } catch (error: any) {
    // Active booking error handling
    if (error.message.includes("Cannot delete user with active bookings")) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user",
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

export const userControllers = {
  getUsers,
  updateUser,
  deleteUser,
};
