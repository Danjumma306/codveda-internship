const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Essential for your Atlas connection

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// 1. Database Connection (Using your .env string)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Clinical Database Connected"))
    .catch(err => console.error("❌ Database Connection Error:", err));

// 2. Patient Schema (Optimized for Health-Tech)
const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    condition: { type: String, required: true },
    status: { type: String, default: "Admitted" }, // Admitted, Stable, Critical, Discharged
    lastCheckup: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', PatientSchema);

// 3. THE CRUD ROUTES

// [CREATE] - Add a new patient
app.post('/api/patients', async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (err) {
        res.status(400).json({ error: "Failed to create record. Check inputs." });
    }
});

// [READ] - Get all patients
app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ lastCheckup: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch records." });
    }
});

// [UPDATE] - Change patient status
app.put('/api/patients/:id', async (req, res) => {
    try {
        // Find by ID and update with the data sent in req.body
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true } // Returns the newly updated document
        );
        res.json(updatedPatient);
    } catch (err) {
        res.status(400).json({ error: "Update failed" });
    }
});

// [DELETE] - Remove a record
app.delete('/api/patients/:id', async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: "Patient record successfully purged." });
    } catch (err) {
        res.status(404).json({ error: "Record not found." });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Clinical API live at http://localhost:${PORT}`);
});