// higher order function

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          errors: "Please provide a valid token",
        });
      }

      // Extract token from "Bearer <token>" format
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          errors: "Please provide a valid token",
        });
      }

      const decoded = jwt.verify(
        token,
        config.jwtSecret as string
      ) as JwtPayload;
      console.log({ decoded });
      req.user = decoded;

      // ["admin"]
      if (roles.length && !roles.includes(decoded.role as string)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
          errors: "You are not authorized to perform this action",
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error" + error.message,
      });
    }
  };
};

export default auth;
