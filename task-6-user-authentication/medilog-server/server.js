
// 1. IMPORTS & SETUP 

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your Database Models
const User = require('./User'); 

// Initialize Express application
const app = express();


// 2. CONFIGURATION & MIDDLEWARE

app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Tells the server to accept JSON data in requests

// It checks your .env file first, and uses a fallback string if it's not there.
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_123";


// 3. DATABASE CONNECTION

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Clinical Database Connected"))
    .catch(err => console.error("❌ Database Connection Error:", err));


// 4. DATABASE MODELS (Schemas)

// This defines the structure of our patient records in MongoDB
const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    condition: { type: String, required: true },
    status: { type: String, default: "Admitted" }, 
    lastCheckup: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', PatientSchema);


// 5. SECURITY MIDDLEWARE (The Gatekeeper)

// This function intercepts requests and checks for a valid JWT token
const auth = (req, res, next) => {
    // 1. Grab the token from the request headers
    const token = req.header('x-auth-token');

    // 2. If no token is provided, deny access immediately
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. If there is a token, verify it's legitimate
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach the user's ID to the request
        next(); // Let the user pass through the gate!
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};


// 6. AUTHENTICATION ROUTES (Register & Login)


// [REGISTER] - Create a new Doctor/Admin account
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists to prevent duplicates
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash (scramble) the password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save the new secure user
        user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully!" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Server Error during registration" });
    }
});

// [LOGIN] - Verify credentials and issue a JWT Badge
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Verify the email exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        // 2. Verify the password matches the hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        // 3. Generate the JWT (The ID Badge) valid for 1 hour
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        
        // Send the token back to React
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server Error during login" });
    }
});


// 7. PATIENT CRUD ROUTES (Protected APIs)


// [CREATE] - Add a new patient
app.post('/api/patients', auth, async (req, res) => { 
    try {
        const newPatient = new Patient(req.body);
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (err) {
        res.status(400).json({ error: "Failed to create record. Check inputs." });
    }
});

// [READ] - Get all patients
app.get('/api/patients', auth, async (req, res) => { 
    try {
        const patients = await Patient.find().sort({ lastCheckup: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch records." });
    }
});

// [UPDATE] - Change patient status (🐛 BUG FIX: Added 'auth' to protect this route)
app.put('/api/patients/:id', auth, async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true } 
        );
        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

// [DELETE] - Remove a record (🐛 BUG FIX: Added 'auth' to protect this route)
app.delete('/api/patients/:id', auth, async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: "Patient record successfully purged." });
    } catch (err) {
        res.status(404).json({ error: "Record not found." });
    }
});


// 8. SERVER START

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Clinical API live at http://localhost:${PORT}`);
});