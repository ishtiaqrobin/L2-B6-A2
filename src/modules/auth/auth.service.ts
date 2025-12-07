import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role
    `,
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const loginUser = async (email: string, password: string) => {
  const result = await pool.query(
    `
    SELECT * FROM users WHERE email = $1 
    `,
    [email]
  );

  console.log(result.rows);
  if (result.rows.length === 0) {
    return null;
  } else {
    const user = result.rows[0];
    const { id, name, email, phone, role } = user;

    const match = await bcrypt.compare(
      password as string,
      user.password as string
    );

    if (!match) {
      return false;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      config.jwtSecret as string,
      {
        expiresIn: "7d",
      }
    );

    console.log({ token });

    return {
      token,
      user: {
        id,
        name,
        email,
        phone,
        role,
      },
    };
  }
};

export const authServices = {
  createUser,
  loginUser,
};
