import { pool } from "../../config/db";

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  // Step 1: Vehicle check and availability check
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

  // Step 2: Total price calculate
  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);
  const daysDifference = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total_price = daysDifference * vehicle.daily_rent_price;

  // Step 3: Booking create and vehicle status update
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Booking insert
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

    // Vehicle status update
    await client.query(
      `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
      ["booked", vehicle_id]
    );

    await client.query("COMMIT");

    // Step 4: Vehicle details with booking response return
    const booking = bookingResult.rows[0];
    return {
      ...booking,
      rent_start_date: formatDate(booking.rent_start_date),
      rent_end_date: formatDate(booking.rent_end_date),
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
  // Step 1: Auto-mark as returned - booking period over
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Active bookings (end_date over) returned mark
    const expiredBookings = await client.query(
      `
      SELECT id, vehicle_id 
      FROM bookings 
      WHERE rent_end_date < $1 
      AND status = 'active'
      `,
      [today]
    );

    // if expired bookings found, status update
    if (expiredBookings.rows.length > 0) {
      // Bookings status returned
      await client.query(
        `
        UPDATE bookings 
        SET status = 'returned' 
        WHERE rent_end_date < $1 
        AND status = 'active'
        `,
        [today]
      );

      // Corresponding vehicles is status available
      const vehicleIds = expiredBookings.rows.map((row) => row.vehicle_id);
      await client.query(
        `
        UPDATE vehicles 
        SET availability_status = 'available' 
        WHERE id = ANY($1::int[])
        `,
        [vehicleIds]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // Step 2: Role-based bookings fetch
  let query = "";
  let params: any[] = [];

  if (userRole === "admin") {
    // Admin all bookings show with customer details
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
    // Customer show only bookings with vehicle details
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

  // Response format
  if (userRole === "admin") {
    return result.rows.map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: formatDate(row.rent_start_date),
      rent_end_date: formatDate(row.rent_end_date),
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
      rent_start_date: formatDate(row.rent_start_date),
      rent_end_date: formatDate(row.rent_end_date),
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

    // Booking fetch
    const bookingResult = await client.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingResult.rows[0];

    // Customer ownership check
    if (userRole === "customer" && booking.customer_id !== userId) {
      throw new Error("You are not authorized to update this booking");
    }

    // Customer cancel status date check (before start date only)
    if (userRole === "customer" && status === "cancelled") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(booking.rent_start_date);
      startDate.setHours(0, 0, 0, 0);

      if (today >= startDate) {
        throw new Error(
          "Cannot cancel booking. Cancellation is only allowed before the start date."
        );
      }
    }

    // Status update
    const updateResult = await client.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    // If status 'returned', then vehicle status 'available'
    if (status === "returned") {
      await client.query(
        `UPDATE vehicles SET availability_status = $1 WHERE id = $2`,
        ["available", booking.vehicle_id]
      );
    }

    await client.query("COMMIT");

    // Vehicle details fetch (if returned)
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
