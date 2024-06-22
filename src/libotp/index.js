// src/api/otpUtils.js
import crypto from 'crypto';
import { totp } from '../libotp'; // Adjust path as necessary
import config from '../../public/config.json'; // Ensure the path is correct

// Synchronised time function
function synchronisedTime() {
  return Math.floor(Date.now() / 1000);
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
