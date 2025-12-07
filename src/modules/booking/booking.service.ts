import { pool } from "../../config/db";

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // Step 1: Vehicle এর daily_rent_price fetch করা এবং availability check করা
  const vehicleResult = await pool.query(
    `SELECT id, vehicle_name, daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
    [vehicle_id]
  );

  if (vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status !== "available") {
    throw new Error("Vehicle is not available for booking");
  }

  // Step 2: Total price calculate করা
  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);
  const daysDifference = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total_price = daysDifference * vehicle.daily_rent_price;

  // Step 3: Booking create করা এবং vehicle status update করা (transaction)
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Booking insert করা
    const bookingResult = await client.query(
      `
      INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
      `,
      [
        customer_id,
        vehicle_id,
        rent_start_date,
        rent_end_date,
        total_price,
        "active",
      ]
    );

    // Vehicle status update করা
    await client.query(
      `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
      ["booked", vehicle_id]
    );

    await client.query("COMMIT");

    // Step 4: Vehicle details সহ response return করা
    const booking = bookingResult.rows[0];
    return {
      ...booking,
      vehicle: {
        vehicle_name: vehicle.vehicle_name,
        daily_rent_price: vehicle.daily_rent_price,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getBookings = async (userId: number, userRole: string) => {
  let query = "";
  let params: any[] = [];

  if (userRole === "admin") {
    // Admin সব bookings দেখবে customer এবং vehicle details সহ
    query = `
      SELECT 
        b.id, 
        b.customer_id, 
        b.vehicle_id, 
        b.rent_start_date, 
        b.rent_end_date, 
        b.total_price, 
        b.status,
        u.name as customer_name,
        u.email as customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
    `;
  } else {
    // Customer শুধু নিজের bookings দেখবে vehicle details সহ
    query = `
      SELECT 
        b.id, 
        b.vehicle_id, 
        b.rent_start_date, 
        b.rent_end_date, 
        b.total_price, 
        b.status,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id DESC
    `;
    params = [userId];
  }

  const result = await pool.query(query, params);

  // Response format করা
  if (userRole === "admin") {
    return result.rows.map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));
  } else {
    return result.rows.map((row) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date,
      rent_end_date: row.rent_end_date,
      total_price: row.total_price,
      status: row.status,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  }
};

const updateBooking = async (
  bookingId: string,
  status: string,
  userId?: number,
  userRole?: string
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Booking fetch করা
    const bookingResult = await client.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    // Customer হলে ownership check করা
    if (userRole === "customer" && booking.customer_id !== userId) {
      throw new Error("You are not authorized to update this booking");
    }

    // Status update করা
    const updateResult = await client.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    // যদি status 'returned' হয়, তাহলে vehicle status 'available' করা
    if (status === "returned") {
      await client.query(
        `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
        ["available", booking.vehicle_id]
      );
    }

    await client.query("COMMIT");

    // Vehicle details fetch করা (যদি returned হয়)
    if (status === "returned") {
      const vehicleResult = await pool.query(
        `SELECT availability_status FROM vehicles WHERE id = $1`,
        [booking.vehicle_id]
      );

      return {
        ...updateResult.rows[0],
        vehicle: {
          availability_status: vehicleResult.rows[0].availability_status,
        },
      };
    }

    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const bookingServices = {
  createBooking,
  getBookings,
  updateBooking,
};
