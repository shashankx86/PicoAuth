const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { expressjwt: expressjwt } = require("express-jwt");
const { totp } = require('../libotp');
const { synchronisedTime } = require('../synchronisedTime');

const app = express();
const port = 9006;
const JWT_SECRET = 'your_jwt_secret'; // Store this securely

app.use(cors());
app.use(express.json()); // for parsing application/json

// Middleware to protect the /api/config route
const jwtMiddleware = expressjwt({ secret: JWT_SECRET, algorithms: ['HS256'] });

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

// Public route for logging in and receiving a token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Implement your own authentication logic here
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Protected route to get the config
app.get('/api/config', jwtMiddleware, (req, res) => {
  res.json(config);
});

app.get('/api/otp', (req, res) => {
  const serviceName = req.query.service ? req.query.service.toLowerCase().replace(/['"]/g, '') : firstServiceKey;
  const otp = generateOTP(serviceName);
  res.json(otp);
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

module.exports = app;
