import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUser = async (data: any) => {
  const { name, email, password, phone, role } = data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *
    `,
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const loginUser = async (email: string, password: string) => {
  console.log({ email });
  const result = await pool.query(
    `
    SELECT * FROM users WHERE email = $1
    `,
    [email]
  );

  console.log(result);
  if (result.rows.length === 0) {
    return null;
  } else {
    const user = result.rows[0];

    const match = await bcrypt.compare(
      password as string,
      user.password as string
    );

    if (!match) {
      return false;
    }

    const token = jwt.sign(
      { name: user.name, email: user.email, role: user.role },
      config.jwtSecret as string,
      {
        expiresIn: "7d",
      }
    );

    console.log({ token });

    return {
      token,
      user,
    };
  }
};

export const authServices = {
  createUser,
  loginUser,
};
