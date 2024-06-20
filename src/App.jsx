import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [config, setConfig] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).replace(/am|pm/i, (match) => match.toUpperCase()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`HTTP error status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched config:', data); // Debug log
        setConfig(data.config);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleServiceChange = (event) => {
    const service = event.target.value;
    setSelectedService(service);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  return (
    <div>
      <div className="navbar">
        <div id="local-time">
          {time}
        </div>
        {config ? (
          <div className="navbar-center">
            <div className="dropdown-container">
              <select value={selectedService} onChange={handleServiceChange}>
                {Object.keys(config).map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <p>Loading configuration...</p>
        )}
        <div className="settings" onClick={toggleSettings}>
          <i className="settings-icon">⚙️</i> Settings
        </div>
      </div>
      {showSettings && (
        <div className="settings-popup">
          <button className="close-button" onClick={closeSettings}>✖</button>
          <div className="popup-content">
            WIP
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
