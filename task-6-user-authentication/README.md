# MediLog Clinical Portal

A full-stack CRUD application for managing patient records in a clinical environment. MediLog allows healthcare staff to register patients, track their status, update conditions, and maintain a digital ward record system. All patient data is protected behind secure JWT-based authentication.

---

## Features

- **Secure Authentication**: JWT-based login and registration system for doctors and admins
- **Patient Intake**: Register new patients with name, age, and medical condition
- **Ward Dashboard**: View all current patient records in a clean, card-based layout
- **Status Tracking**: Toggle patient status between "Admitted" and "Recovered" with a single click
- **Record Management**: Delete patient records when no longer needed
- **Real-time Updates**: All changes sync instantly with the MongoDB database
- **Responsive UI**: Glass-morphism design with a modern clinical aesthetic
- **Session Management**: Automatic logout on token expiry or invalid credentials

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Axios, Lucide React |
| **Backend** | Node.js, Express.js, bcryptjs, jsonwebtoken |
| **Database** | MongoDB (Mongoose ODM) |
| **Styling** | Custom CSS with glass-morphism effects |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB instance)

---

## Project Structure

```
medilog/
├── medilog-client/          # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main application component with auth logic
│   │   ├── App.css          # Styling
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   └── package.json
│
├── medilog-server/          # Node.js backend
│   ├── server.js            # Express server, API routes & JWT middleware
│   ├── user.js              # User model (Mongoose schema)
│   ├── package.json
│   └── .env                 # Environment variables (create this)
│
└── README.md
```

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd medilog
```

### 2. Install Backend Dependencies

```bash
cd medilog-server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `medilog-server/` directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medilog?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
```

> Replace the placeholders with your actual MongoDB connection string and a strong secret key for JWT signing.

### 4. Install Frontend Dependencies

Open a new terminal, then run:

```bash
cd medilog-client
npm install
```

---

## Running the Application

You need to run both the backend server and the frontend client simultaneously.

### Start the Backend Server

```bash
cd medilog-server
node server.js
```

The API will be live at: `http://localhost:5000`

### Start the Frontend Client

In a separate terminal:

```bash
cd medilog-client
npm run dev
```

The app will be available at: `http://localhost:5173`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new doctor/admin account |
| `POST` | `/api/auth/login` | Login and receive a JWT token |

### Patient Records (Protected)

> All patient routes require the `x-auth-token` header with a valid JWT.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | Retrieve all patient records |
| `POST` | `/api/patients` | Create a new patient record |
| `PUT` | `/api/patients/:id` | Update a patient's status |
| `DELETE` | `/api/patients/:id` | Remove a patient record |

### User Schema

```json
{
  "email": "String (required, unique)",
  "password": "String (required, hashed)"
}
```

### Patient Schema

```json
{
  "name": "String (required)",
  "age": "Number (required)",
  "condition": "String (required)",
  "status": "String (default: 'Admitted')",
  "lastCheckup": "Date (default: Date.now)"
}
```

---

## Usage Guide

1. **Register an Account**: On first use, click "Need an account? Register here." and create a doctor/admin account with an email and password.
2. **Login**: Enter your credentials and click "Access Records" to receive your JWT session token.
3. **Register a Patient**: Fill out the Patient Intake form on the left and click **Register Patient**.
4. **View Records**: All patients appear in the Current Ward Records section.
5. **Update Status**: Click the status badge on any patient card to toggle between "Admitted" and "Recovered".
6. **Delete Record**: Click the trash icon to permanently remove a patient record.
7. **Logout**: Click the **Logout** button in the top navigation to end your session.

---

## Authentication Flow

```
┌─────────────┐     Register/Login      ┌─────────────┐
│   React     │ ──────────────────────> │   Express   │
│   Client    │                         │   Server    │
│             │ <────────────────────── │             │
└─────────────┘      JWT Token          └─────────────┘
       │                                        │
       │ Store token in localStorage            │
       │                                        │
       │ Send x-auth-token header               │
       │ on every subsequent request            │
       └────────────────────────────────────────┘
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No token, authorization denied" | Ensure you are logged in. The token may have expired — log in again. |
| "Error adding patient. Is the server running?" | Ensure the backend server is started on port 5000 |
| Database connection error | Verify your `MONGO_URI` in the `.env` file |
| CORS errors | Check that `cors` middleware is enabled in `server.js` |
| "Token is not valid" | Your session may have expired. Log out and log in again. |
| "User already exists" | Use a different email address for registration |

---

## Future Enhancements

- Role-based access control (Admin vs Doctor permissions)
- Patient search & filtering
- Medical history timeline
- Export records to PDF/CSV
- Appointment scheduling integration
- Password reset functionality

---

## License

This project is open-source and available under the [ISC License](https://opensource.org/licenses/ISC).

---

## Acknowledgements

Built with ❤️ using the MERN stack principles (MongoDB, Express, React, Node.js).

