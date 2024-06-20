import { HOTP, TOTP, Authenticator } from '@otplib/core';
import { keyDecoder, keyEncoder } from '@otplib/plugin-thirty-two';
import { createDigest, createRandomBytes } from '@otplib/plugin-crypto';

// Setup OTP instances
const hotp = new HOTP({ createDigest });
const totp = new TOTP({ createDigest });
// const authenticator = new Authenticator({
//   createDigest,
//   createRandomBytes,
//   keyDecoder,
//   keyEncoder
// });

// Function to generate OTP based on service configuration
function generateToken(serviceConfig) {
  const { id, type, key } = serviceConfig;
  let token;

  switch (type.toLowerCase()) {
    case 'hotp':
      token = hotp.generate(key, 0);
      break;
    case 'totp':
      token = totp.generate(key);
      break;
    default:
      token = totp.generate(key);
  }

  return { id, token, type: type.toUpperCase() };
}

export { generateToken };
