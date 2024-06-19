import React, { useState, useEffect } from 'react';

import './App.css';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/config.json')
      .then(response => response.json())
      .then(data => setConfig(data.config))
      .catch(error => console.error('Error fetching config:', error));
  }, []);

  return (
    <div>
      <div id="local-time">
        {time}
      </div>
      {config && (
        <div id="config">
          <h2>Config Data:</h2>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
