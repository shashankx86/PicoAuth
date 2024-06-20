const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { encode, decode } = require('cbor-x');

const app = express();
const PORT = 6968;

app.use(bodyParser.raw({ type: 'application/cbor' }));

app.post('/save', (req, res) => {
  const filePath = path.join(__dirname, 'data.cbor');
  fs.writeFileSync(filePath, req.body);
  res.sendStatus(200);
});

app.get('/retrieve', (req, res) => {
  const filePath = path.join(__dirname, 'data.cbor');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.type('application/cbor');
    res.send(data);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
