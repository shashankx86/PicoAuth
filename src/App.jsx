import React, { useState, useEffect } from 'react';
import { generateToken } from './auth';
import './App.css';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [config, setConfig] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [otpDetails, setOtpDetails] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        const data = await response.json();
        setConfig(data.config);

        // Automatically select the first service and generate OTP details
        const firstService = Object.keys(data.config)[0];
        if (firstService) {
          setSelectedService(firstService);
          const serviceConfig = data.config[firstService];
          const details = generateToken(serviceConfig);
          setOtpDetails({ name: firstService, ...details });
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  const handleServiceChange = (event) => {
    const service = event.target.value;
    setSelectedService(service);
    if (config && service) {
      const serviceConfig = config[service];
      const details = generateToken(serviceConfig);
      setOtpDetails({ name: service, ...details });
    }
  };

  return (
    <div>
      <div id="local-time">
        {time}
      </div>
      {config && (
        <div className="dropdown-container">
          <select value={selectedService} onChange={handleServiceChange}>
            {Object.keys(config).map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      )}
      {otpDetails && (
        <div id="otp-details">
          <h2>OTP Details:</h2>
          <p>Name: {otpDetails.name}</p>
          <p>Id: {otpDetails.id}</p>
          <p>OTP: {otpDetails.token}</p>
          <p>Type: {otpDetails.type}</p>
        </div>
      )}
    </div>
  );
}

export default App;
