import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const result = await pool.query(
    `
        INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *
        `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result;
};

const getVehicles = async () => {
  const result = await pool.query(`
      SELECT * FROM vehicles
      `);

  return result;
};

const getVehicle = async (id: string) => {
  const result = await pool.query(
    `
      SELECT * FROM vehicles WHERE id = $1
  `,
    [id]
  );

  return result;
};

const updateVehicle = async (payload: Record<string, unknown>, id: string) => {
  // Dynamic UPDATE query তৈরি করা হচ্ছে
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // শুধু যে fields পাঠানো হয়েছে সেগুলো নিয়ে query তৈরি করা
  if (payload.vehicle_name !== undefined) {
    fields.push(`vehicle_name = $${paramCount++}`);
    values.push(payload.vehicle_name);
  }

  if (payload.type !== undefined) {
    fields.push(`type = $${paramCount++}`);
    values.push(payload.type);
  }

  if (payload.registration_number !== undefined) {
    fields.push(`registration_number = $${paramCount++}`);
    values.push(payload.registration_number);
  }

  if (payload.daily_rent_price !== undefined) {
    fields.push(`daily_rent_price = $${paramCount++}`);
    values.push(payload.daily_rent_price);
  }

  if (payload.availability_status !== undefined) {
    fields.push(`availability_status = $${paramCount++}`);
    values.push(payload.availability_status);
  }

  // যদি কোনো field update করার জন্য না পাঠানো হয়
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  // id শেষে add করা
  values.push(id);

  const query = `
    UPDATE vehicles 
    SET ${fields.join(", ")} 
    WHERE id = $${paramCount} 
    RETURNING *
  `;

  const result = await pool.query(query, values);

  return result;
};

const deleteVehicle = async (id: string) => {
  // Active booking check করা
  const bookingCheck = await pool.query(
    `SELECT id FROM bookings WHERE vehicle_id = $1 AND status = 'active'`,
    [id]
  );

  if (bookingCheck.rows.length > 0) {
    throw new Error(
      "Cannot delete vehicle with active bookings. Please complete or cancel all active bookings first."
    );
  }

  const result = await pool.query(
    `
    DELETE FROM vehicles WHERE id = $1 RETURNING *
    `,
    [id]
  );

  return result;
};

export const vehicleServices = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};
