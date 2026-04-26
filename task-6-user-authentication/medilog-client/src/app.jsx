import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Trash2, UserPlus, ClipboardList } from 'lucide-react';
import './App.css';

// The bridge to your Node.js server
const API_URL = 'http://localhost:5000/api/patients';

function App() {
  // 1. STATE: ALL hooks MUST be inside the component function
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  const [patients, setPatients] = useState([]); 
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [condition, setCondition] = useState('');
  

  // 2. USEEFFECT: Runs once when the app loads
  useEffect(() => {
    if (isLoggedIn) {
      getPatients();
    }
  }, [isLoggedIn]); // Added isLoggedIn as a dependency

  // --- AUTHENTICATION FUNCTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Save token to localStorage and State
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setIsLoggedIn(true);
      
      alert("Login Successful!");
      // getPatients will automatically trigger via useEffect now
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    // 1. Send data to the registration route
    await axios.post('http://localhost:5000/api/auth/register', { email, password });
    
    // 2. Success!
    alert("Registration Successful! Please log in.");
    
    // 3. Clean up the UI: Switch back to Login mode and clear the password box
    setIsRegistering(false);
    setPassword(''); 
  } catch (err) {
    // Exact same error handling as login
    if (err.response) {
      alert("Server said: " + err.response.data.msg); 
    } else {
      alert("Network Error: Could not reach the server.");
    }
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsLoggedIn(false);
    setPatients([]); // Clear patient data from memory when logging out
  };

  // --- API FUNCTIONS ---
  const getPatients = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { 'x-auth-token': localStorage.getItem('token') } 
      });
      setPatients(res.data);
    } catch (err) {
      console.error("Auth Error");
      handleLogout(); // Boot them to login if token is bad
    }
  };

  const addPatient = async (e) => {
    e.preventDefault(); 
    try {
      await axios.post(API_URL, { name, age, condition }, {
        headers: { 'x-auth-token': token }
      });
      setName(''); setAge(''); setCondition('');
      getPatients();
    } catch (error) {
      alert("Error adding patient.");
    }
  };

  const deletePatient = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { 'x-auth-token': token }
      });
      getPatients(); 
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Admitted" ? "Recovered" : "Admitted";
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus }, {
        headers: { 'x-auth-token': token }
      });
      getPatients(); 
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // --- UI RENDER ---
  return (
    <div id="universe">
      <header className="glass-nav">
        <h2><Activity size={24} /> MediLog Clinical Portal</h2>
        {isLoggedIn && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
      </header>

{!isLoggedIn ? (
        <section className="login-screen">
          {/* Dynamically change title */}
          <h2>{isRegistering ? "📝 Clinical Registration" : "🔒 Clinical Login"}</h2>
          
          {/* Dynamically change which function runs on submit */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="email" placeholder="Doctor Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            
            {/* Dynamically change button text */}
            <button type="submit">{isRegistering ? "Create Account" : "Access Records"}</button>
          </form>

          {/* The Toggle Button */}
          <p 
            style={{ marginTop: '15px', color: '#0369a1', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' }} 
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Already have an account? Login here." : "Need an account? Register here."}
          </p>
        </section>
      ) : (

        // IF LOGGED IN -> SHOW DASHBOARD
        <main className="dashboard">
          <section className="form-container">
            <h3><UserPlus size={20} /> Patient Intake</h3>
            <form onSubmit={addPatient}>
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
              <input type="text" placeholder="Condition (e.g. Hypertension)" value={condition} onChange={(e) => setCondition(e.target.value)} required />
              <button type="submit" className="add-btn">Register Patient</button>
            </form>
          </section>

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
                      <span style={{marginLeft: "10px", color: "gray"}}>{patient.age} years old</span>
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
      )}
    </div>
  );
}

export default App;