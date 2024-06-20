const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { encode, decode } = require('cbor-x');

const app = express();
const port = 6968;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// File path where data will be saved
const filePath = 'data.cbor';

// Function to save data to a file
function saveDataToFile(filename, data) {
    const cborData = encode(data);
    fs.writeFileSync(filename, cborData);
    console.log('Data saved to file:', filename);
}

// Function to retrieve data from a file
function retrieveDataFromFile(filename) {
    const cborData = fs.readFileSync(filename);
    const decodedData = decode(cborData);
    return decodedData;
}

// POST endpoint to save data
app.post('/data', (req, res) => {
    const data = req.body;
    saveDataToFile(filePath, data);
    res.send({ message: 'Data saved successfully' });
});

// GET endpoint to retrieve data
app.get('/data', (req, res) => {
    try {
        const data = retrieveDataFromFile(filePath);
        res.send(data);
    } catch (err) {
        res.status(500).send({ error: 'Failed to retrieve data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
