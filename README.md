# Bangla Ride API

A robust RESTful API for a vehicle rental service built with Node.js, Express, TypeScript, and PostgreSQL.

**Live Deployment:** [https://bangla-ride-api.vercel.app](https://bangla-ride-api.vercel.app)

---

## 📋 Features

### Authentication & Authorization

- **User Registration & Login** - Secure signup and signin with JWT-based authentication
- **Role-Based Access Control** - Admin and Customer roles with different permissions
- **Password Encryption** - Bcrypt hashing for secure password storage

### User Management

- **Get All Users** - Admin-only endpoint to retrieve all registered users
- **Update User Profile** - Users can update their own profile; admins can update any profile
- **Delete User** - Admin-only deletion with validation to prevent deletion of users with active bookings

### Vehicle Management

- **Create Vehicle** - Admin-only endpoint to add new vehicles to the fleet
- **Get All Vehicles** - Public endpoint to browse available vehicles
- **Get Single Vehicle** - Retrieve detailed information about a specific vehicle
- **Update Vehicle** - Admin-only endpoint to modify vehicle details
- **Delete Vehicle** - Admin-only endpoint to remove vehicles from the system

### Booking Management

- **Create Booking** - Authenticated users can book vehicles
- **Get Bookings** - Users can view their own bookings; admins can view all bookings
- **Update Booking** - Modify booking details (status, dates, etc.)

---

## 🛠️ Technology Stack

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript superset

### Database

- **PostgreSQL** - Relational database for data persistence
- **pg** - PostgreSQL client for Node.js

### Authentication & Security

- **JSON Web Tokens (JWT)** - Secure token-based authentication
- **bcryptjs** - Password hashing and encryption

### Development Tools

- **tsx** - TypeScript execution and watch mode
- **dotenv** - Environment variable management

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd BanglaRide API
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   CONNECTION_STRING=postgresql://neondb_owner:npg_QxMHvcpkEC29@ep-dark-flower-a8i7ldks-pooler...
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up the database**

   Ensure PostgreSQL is running and create the database:

   ```sql
   CREATE DATABASE banglaride;
   ```

   The application will automatically initialize the required tables on startup.

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 Usage

### API Endpoints

#### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Login and receive JWT token

#### Users

- `GET /api/v1/users` - Get all users (Admin only)
- `PUT /api/v1/users/:id` - Update user profile (Admin or own profile)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

#### Vehicles

- `POST /api/v1/vehicles` - Create a new vehicle (Admin only)
- `GET /api/v1/vehicles` - Get all vehicles (Public)
- `GET /api/v1/vehicles/:vehicleId` - Get single vehicle (Public)
- `PUT /api/v1/vehicles/:vehicleId` - Update vehicle (Admin only)
- `DELETE /api/v1/vehicles/:vehicleId` - Delete vehicle (Admin only)

#### Bookings

- `POST /api/v1/bookings` - Create a new booking (Authenticated)
- `GET /api/v1/bookings` - Get bookings (Own bookings for customers, all for admin)
- `PUT /api/v1/bookings/:bookingId` - Update booking (Authenticated)

### Authentication

Include the JWT token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📁 Project Structure

```
BanglaRide API/
├── src/
│   ├── config/          # Database and configuration files
│   ├── middleware/      # Authentication and logging middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication logic
│   │   ├── users/       # User management
│   │   ├── vehicles/    # Vehicle management
│   │   └── bookings/    # Booking management
│   ├── types/           # TypeScript type definitions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── dist/                # Compiled JavaScript (production)
├── .env                 # Environment variables
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── vercel.json          # Vercel deployment configuration
```

---

## 🔒 Security Features

- **Password Hashing** - All passwords are encrypted using bcrypt before storage
- **JWT Authentication** - Stateless authentication with secure token generation
- **Role-Based Authorization** - Middleware to protect routes based on user roles
- **Input Validation** - Request validation to prevent malicious data
- **Environment Variables** - Sensitive data stored securely in environment variables

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Developed as part of Level 2 - Batch 6 - Mission 3 Assignment

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

## 📞 Support

For support or questions, please contact the development team or open an issue in the repository.
