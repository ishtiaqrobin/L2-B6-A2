import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

const getUsers = async () => {
  const result = await pool.query(`
      SELECT id, name, email, phone, role FROM users
      `);

  return result;
};

const getUser = async (id: string) => {
  const result = await pool.query(
    `
      SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1
  `,
    [id]
  );

  return result;
};

const updateUser = async (name: string, email: string, id: string) => {
  const result = await pool.query(
    `
      UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, phone, role, created_at, updated_at
      `,
    [name, email, id]
  );

  return result;
};

const deleteUser = async (id: string) => {
  const result = await pool.query(
    `
      DELETE FROM users WHERE id = $1 RETURNING id, name, email, phone, role, created_at, updated_at
      `,
    [id]
  );

  return result;
};

export const userServices = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
