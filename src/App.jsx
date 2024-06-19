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
      setTime(new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/config.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched config:', data); // Debug log
        setConfig(data.config);

        // Automatically select the first service and generate OTP details
        const firstService = Object.keys(data.config)[0];
        if (firstService) {
          setSelectedService(firstService);
          const serviceConfig = data.config[firstService];
          const details = generateToken(serviceConfig);
          console.log('Generated OTP details for first service:', details); // Debug log
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
      console.log('Changed service OTP details:', details); // Debug log
      setOtpDetails({ name: service, ...details });
    }
  };

  return (
    <div>
      <div id="local-time">
        {time}
      </div>
      {config ? (
        <div className="dropdown-container">
          <select value={selectedService} onChange={handleServiceChange}>
            {Object.keys(config).map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      ) : (
        <p>Loading configuration...</p>
      )}
      {otpDetails ? (
        <div id="otp-details">
          <h2>OTP Details:</h2>
          <p>Service: {otpDetails.name}</p>
          <p>Id: {otpDetails.id}</p>
          <p>OTP: {otpDetails.token}</p>
          <p>Type: {otpDetails.type}</p>
        </div>
      ) : (
        <p>Loading OTP details...</p>
      )}
    </div>
  );
}

export default App;
