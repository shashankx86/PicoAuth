import React, { useState, useEffect } from 'react';
import data from './config/opt.json'; // Import JSON data
import './App.css';

function App() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchJson = () => {
    fetch('./config/opt.json')
    .then(response => {
      return response.json();
    }).then(data => {
      setData(data);
    }).catch((e) => {
      console.log(e.message);
    });
  }

  return (
    <div>
      <div id="local-time">
        {time}, {data?.config}
      </div>
    </div>
  );
}

export default App;
