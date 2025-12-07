import { Pool } from "pg";
import config from ".";

// Configure PostgreSQL connection pool (Database)
export const pool = new Pool({
  connectionString: `${config.connection_str}`,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone VARCHAR(15) NOT NULL,
            role VARCHAR(50) DEFAULT 'customer'
        )
        `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(100) NOT NULL,
            type VARCHAR(50),
            registration_number VARCHAR(50) UNIQUE NOT NULL,
            daily_rent_price INT NOT NULL,
            availability_status VARCHAR(50) DEFAULT 'available'
        )
        `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            customer_id INT REFERENCES users(id) ON DELETE CASCADE,
            vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
            rent_start_date DATE NOT NULL,
            rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
            total_price INT NOT NULL,
            status VARCHAR(50)
        )
        `);
};

export default initDB;
