import CryptoJS from 'crypto-js'; // Use crypto-js library for browser compatibility
import { Buffer } from 'buffer'; // Ensure the Buffer is imported from 'buffer'
import config from '../../public/config.json'; // Ensure the path is correct

// Synchronised time function
function synchronisedTime() {
  return Math.floor(Date.now() / 1000);
}

// Base32 Decode function
function base32Decode(input) {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (const char of input.toUpperCase()) {
    if (char === '=') break;
    const index = base32Chars.indexOf(char);
    if (index === -1) throw new Error('Invalid character found');

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output += String.fromCharCode((value >>> (bits - 8)) & 0xFF);
      bits -= 8;
    }
  }

  return Buffer.from(output, 'binary');
}

// HOTP generation function
function hotp(counter, key, digits) {
  const keyBuffer = Buffer.from(key, 'hex');
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0);
  counterBuffer.writeUInt32BE(counter % Math.pow(2, 32), 4);

  const hmac = CryptoJS.HmacSHA1(CryptoJS.lib.WordArray.create(counterBuffer), CryptoJS.lib.WordArray.create(keyBuffer));
  const hmacBytes = Buffer.from(hmac.toString(CryptoJS.enc.Hex), 'hex');
  const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
  const code = (hmacBytes.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, digits);

  return code.toString().padStart(digits, '0');
}

// TOTP generation function
function totp(time, key, step = 30, digits = 6) {
  const counter = Math.floor(time / step);
  const keyBuffer = base32Decode(key);
  const otp = hotp(counter, keyBuffer.toString('hex'), digits);

  const expiry = step - (time % step);
  return { password: otp, expiry };
}

export function generateOTP(serviceKey) {
  try {
    const service = config['service-config'][serviceKey];

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
