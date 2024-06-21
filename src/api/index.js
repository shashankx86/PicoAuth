const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { totp } = require('../libotp');
const { synchronisedTime } = require('../synchronisedTime');

const app = express();
const port = 9006;

app.use(cors());

let config = {};
let firstServiceKey;

try {
  const rawConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../../public/config.json'), 'utf8'))['service-config'];

  // Normalize service keys to lowercase
  for (const key in rawConfig) {
    if (rawConfig.hasOwnProperty(key)) {
      config[key.toLowerCase()] = rawConfig[key];
    }
  }

  firstServiceKey = Object.keys(config)[0];

  if (!firstServiceKey) {
    throw new Error('No services found in configuration');
  }
} catch (error) {
  console.error('Error reading or parsing config.json:', error);
}

function generateOTP(serviceKey) {
  try {
    const service = config[serviceKey];

    if (!service) {
      return { password: '404!', expiry: '404!', name: '404!' };
    }

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
  // Normalize service name from query parameter to lowercase and remove quotes if present
  const serviceName = req.query.service ? req.query.service.toLowerCase().replace(/['"]/g, '') : firstServiceKey;
  const otp = generateOTP(serviceName);
  res.json(otp);
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

module.exports = app;
