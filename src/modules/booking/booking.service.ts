import { pool } from "../../config/db";

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const result = await pool.query(
    `
    INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date) VALUES ($1, $2, $3, $4) RETURNING *
    `,
    [customer_id, vehicle_id, rent_start_date, rent_end_date]
  );

  return result;
};

export const bookingServices = {
  createBooking,
};
