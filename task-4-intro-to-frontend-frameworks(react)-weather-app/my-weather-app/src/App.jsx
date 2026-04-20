import { useState } from 'react'
import './App.css'

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");


  const fetchWeather = async () => {
    
    const API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      alert("City not found. Please check the spelling!");
    }
  };

  const getHealthAdvice = (temp) => {
    if (temp > 30) return "High Heat: Risk of dehydration. Stay indoors.";
    if (temp < 15) return "Cold Alert: Potential for respiratory irritation. Wear a mask.";
    return "Stable Conditions: Low environmental health risk.";
  };

  return (
    <div id="universe">
      <div className="blob-teal"></div>
      <div className="blob-purple"></div>

      <header className="glass">
        
        <h2 style={{fontFamily: 'var(--font-heading)', fontSize: '1.5rem'}}>AeroHealth Monitor</h2>
      </header>

      <main className="section-wrapper">
        <div className="glass-card weather-container">
          <h1>Environmental Health Check</h1>
          <p className="tagline">Monitor weather conditions for respiratory wellness.</p>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search City (e.g., Accra)..." 
              onChange={(e) => setCity(e.target.value)} 
            />
            <button className="btn" onClick={fetchWeather}>Analyze</button>
          </div>

          {weather && (
            <div className="result-area is-visible">
              <div className="weather-info">
                <h3>{weather.name}, {weather.sys.country}</h3>
                <div className="temp-display">{Math.round(weather.main.temp)}°C</div>
                <p className="condition">{weather.weather[0].description}</p>
              </div>

              <div className="health-badge">
                <h4>🩺 Health Advisory</h4>
                <p>{getHealthAdvice(weather.main.temp)}</p>
              </div>
            </div>
          )}
          
        </div>
        <footer> 2026 by Mohammed</footer>
      </main>
    </div>
  );
}

export default App;