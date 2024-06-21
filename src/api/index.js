const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { totp } = require('../libotp');
const { synchronisedTime } = require('../synchronisedTime');

const app = express();
const port = 9006; 

app.use(cors());

let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/config.json'), 'utf8'))['service-config'];
} catch (error) {
  console.error('Error reading or parsing config.json:', error);
}

let selectedIdx = 0;

function generateOTP() {
  try {
    const keys = Object.keys(config);
    const serviceKey = keys[selectedIdx];
    const service = config[serviceKey];
    selectedIdx = (selectedIdx + 1) % keys.length;

    console.log(`Generating OTP for service: ${serviceKey}`);
    console.log(`Service details:`, service);

    const { password, expiry } = totp(synchronisedTime(), service.key, service.step, service.digits);

    console.log(`Generated OTP: ${password}, Expiry: ${expiry}`);

    return { password, expiry, name: serviceKey };
  } catch (error) {
    console.error('Error generating OTP:', error);
    return { password: null, expiry: 0, name: 'error' };
  }
}

app.get('/api/otp', (req, res) => {
  const otp = generateOTP();
  res.json(otp);
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

module.exports = app;
