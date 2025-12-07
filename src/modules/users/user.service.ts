import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

const getUsers = async () => {
  const result = await pool.query(`
      SELECT id, name, email, phone, role FROM users
      `);

  return result;
};

const updateUser = async (
  payload: Record<string, unknown>,
  id: string,
  requestUserId?: number,
  requestUserRole?: string
) => {
  // Dynamic UPDATE query তৈরি করা
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // শুধু যে fields পাঠানো হয়েছে সেগুলো নিয়ে query তৈরি করা
  if (payload.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(payload.name);
  }

  if (payload.email !== undefined) {
    // Email lowercase enforcement
    const email = (payload.email as string).toLowerCase();
    fields.push(`email = $${paramCount++}`);
    values.push(email);
  }

  if (payload.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(payload.phone);
  }

  // Role update শুধু admin করতে পারবে
  if (payload.role !== undefined) {
    if (requestUserRole !== "admin") {
      throw new Error("Only admin can update user role");
    }
    fields.push(`role = $${paramCount++}`);
    values.push(payload.role);
  }

  // যদি কোনো field update করার জন্য না পাঠানো হয়
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  // id শেষে add করা
  values.push(id);

  const query = `
    UPDATE users 
    SET ${fields.join(", ")} 
    WHERE id = $${paramCount} 
    RETURNING id, name, email, phone, role
  `;

  const result = await pool.query(query, values);

  return result;
};

const deleteUser = async (id: string) => {
  // Active booking check করা
  const bookingCheck = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [id]
  );

  if (bookingCheck.rows.length > 0) {
    throw new Error(
      "Cannot delete user with active bookings. Please complete or cancel all active bookings first."
    );
  }

  const result = await pool.query(
    `
      DELETE FROM users WHERE id = $1 RETURNING id, name, email, phone, role
      `,
    [id]
  );

  return result;
};

export const userServices = {
  getUsers,
  updateUser,
  deleteUser,
};
