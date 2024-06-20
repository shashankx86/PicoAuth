import React, { useState } from 'react';
import axios from 'axios';
import { encode, decode } from 'cbor-x';
import './App.css';

function App() {
  const [text, setText] = useState('');

  const handleSaveAndRetrieve = async () => {
    try {
      // Encode the data
      const encoded = encode({ data: text });

      // Save the data to the server
      await axios.post('https://firefox.theaddicts.hackclub.app:6968/save', encoded, {
        headers: { 'Content-Type': 'application/cbor' },
      });

      // Retrieve the data from the server
      const response = await axios.get('https://firefox.theaddicts.hackclub.app/retrieve', {
        responseType: 'arraybuffer',
      });

      const decoded = decode(new Uint8Array(response.data));

      // Print to console and show popup
      console.log('Retrieved data:', decoded.data);
      alert('Check console');
    } catch (error) {
      console.error('Error during save and retrieve:', error);
    }
  };

  return (
    <div className="App">
      <h1>Save and Retrieve Data</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter some text here..."
      />
      <button onClick={handleSaveAndRetrieve}>Save and Retrieve</button>
    </div>
  );
}

export default App;
