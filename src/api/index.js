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
let firstServiceKey;

try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/config.json'), 'utf8'))['service-config'];
  firstServiceKey = Object.keys(config)[0];

  if (!firstServiceKey) {
    throw new Error('No services found in configuration');
  }

  // console.log(`First service key: ${firstServiceKey}`);
} catch (error) {
  console.error('Error reading or parsing config.json:', error);
}

function generateOTP() {
  try {
    const service = config[firstServiceKey];

    if (!service) {
      throw new Error(`Service not found for key: ${firstServiceKey}`);
    }

    // console.log(`Generating OTP for service: ${firstServiceKey}`);
    // console.log(`Service details:`, service);

    const { password, expiry } = totp(synchronisedTime(), service.key, service.step, service.digits);

    console.log(`Generated OTP: ${password}, Expiry: ${expiry}`);

    return { password, expiry, name: firstServiceKey };
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
