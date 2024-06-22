const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
const { totp } = require('../libotp');
const { synchronisedTime } = require('../synchronisedTime');

const port = 9006;

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

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(config));
  } else if (pathname === '/api/otp') {
    const serviceName = url.searchParams.get('service') ? url.searchParams.get('service').toLowerCase().replace(/['"]/g, '') : firstServiceKey;
    const otp = generateOTP(serviceName);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(otp));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
