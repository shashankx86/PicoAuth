const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { expressjwt: expressjwt } = require("express-jwt");
const { totp } = require('../libotp');
const { synchronisedTime } = require('../synchronisedTime');
const crypto = require('crypto');

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

// HOTP generation function
function hotp(counter, key, digits) {
  const keyBuffer = Buffer.from(key, 'hex');
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0);
  counterBuffer.writeUInt32BE(counter % Math.pow(2, 32), 4);

  const hmac = crypto.createHmac('sha1', keyBuffer).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, digits);

  return code.toString().padStart(digits, '0');
}

function generateOTP(serviceKey) {
  try {
    const service = config[serviceKey];

    if (!service) {
      return { password: '404!', expiry: '404!', name: '404!' };
    }

    console.log(`Generating OTP for service: ${serviceKey}`);
    console.log(`Service details:`, service);

    let password, expiry;
    if (service.type === 'totp') {
      ({ password, expiry } = totp(synchronisedTime(), service.key, service.step, service.digits));
    } else if (service.type === 'hotp') {
      const counter = service.counter || 0; // Use a stored counter or default to 0
      password = hotp(counter, service.key, service.digits);
      expiry = null; // HOTP does not expire
      service.counter = counter + 1; // Increment the counter
    }

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
