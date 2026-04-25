import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Trash2, UserPlus, ClipboardList } from 'lucide-react';
import './App.css';

// This is the bridge to your Node.js server
const API_URL = 'http://localhost:5000/api/patients';

function App() {
  // 1. STATE: These variables "remember" your data
  const [patients, setPatients] = useState([]); // List of patients from DB
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');

  // 2. USEEFFECT: This runs once as soon as the app loads
  useEffect(() => {
    getPatients();
  }, []);

  // READ: Fetch all patient records from the Backend
  const getPatients = async () => {
    try {
      const response = await axios.get(API_URL);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // CREATE: Send new patient data to the Backend
  const addPatient = async (e) => {
    e.preventDefault(); // Stop the page from refreshing
    try {
      await axios.post(API_URL, { name, age, condition });
      // Reset the form fields
      setName(''); setAge(''); setCondition('');
      // Refresh the list to show the new patient
      getPatients();
    } catch (error) {
      alert("Error adding patient. Is the server running?");
    }
  };

  // DELETE: Tell the backend to remove a specific record
  const deletePatient = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      getPatients(); // Refresh the list
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === "Admitted" ? "Recovered" : "Admitted";
  try {
    await axios.put(`${API_URL}/${id}`, { status: newStatus });
    getPatients(); // Refresh the list from the DB
  } catch (error) {
    console.error("Update error:", error);
  }
};


  return (
    <div id="universe">
      <header className="glass-nav">
        <h2><Activity size={24} /> MediLog Clinical Portal</h2>
      </header>

      <main className="dashboard">
        {/* INTAKE FORM (CREATE) */}
        <section className="form-container">
          <h3><UserPlus size={20} /> Patient Intake</h3>
          <form onSubmit={addPatient}>
            <input 
              type="text" placeholder="Full Name" value={name}
              onChange={(e) => setName(e.target.value)} required 
            />
            <input 
              type="number" placeholder="Age" value={age}
              onChange={(e) => setAge(e.target.value)} required 
            />
            <input 
              type="text" placeholder="Condition (e.g. Hypertension)" value={condition}
              onChange={(e) => setCondition(e.target.value)} required 
            />
            <button type="submit" className="add-btn">Register Patient</button>
          </form>
        </section>

        {/* PATIENT LIST (READ & DELETE) */}
        <section className="list-container">
          <h3><ClipboardList size={20} /> Current Ward Records</h3>
          <div className="patient-grid">
            {patients.length === 0 ? <p>No patients currently admitted.</p> : 
              patients.map(patient => (
                <div key={patient._id} className="patient-card">
                  <div className="patient-info">
                    <h4>{patient.name}</h4>
                    
                    <span
                    className={`status-badge ${patient.status === "Recovered" ? "status-green" : "status-blue"}`}
                    onClick={() => toggleStatus(patient._id, patient.status)}
                    >
                        {patient.status || "Admitted"}
                    </span>
                    <span>{patient.age} years old</span>
                    <p><strong>Diagnosis:</strong> {patient.condition}</p>
                  </div>
                  <button onClick={() => deletePatient(patient._id)} className="delete-icon">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            }
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;