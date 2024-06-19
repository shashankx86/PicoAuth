import { HOTP, TOTP, Authenticator } from '@otplib/core';
import { keyDecoder, keyEncoder } from '@otplib/plugin-thirty-two'; // use your chosen base32 plugin
import { createDigest, createRandomBytes } from '@otplib/plugin-crypto'; // use your chosen crypto plugin
import fetch from 'node-fetch';
import fs from 'fs/promises'; // For reading local files

// Setup an OTP instance which you need
const hotp = new HOTP({ createDigest });
const totp = new TOTP({ createDigest });
const authenticator = new Authenticator({
  createDigest,
  createRandomBytes,
  keyDecoder,
  keyEncoder
});

function generateToken(config, service) {
  const serviceConfig = config[service];
  if (!serviceConfig) {
    console.error(`Service ${service} not found in config.`);
    return;
  }

  const { id, type, key } = serviceConfig;
  let token;
  let otpInstance;

  switch (type.toLowerCase()) {
    case 'hotp':
      otpInstance = hotp;
      token = hotp.generate(key, 0);
      break;
    case 'totp':
      otpInstance = totp;
      token = totp.generate(key);
      break;
    default:
      otpInstance = authenticator;
      token = authenticator.generate(key);
  }

  console.log(`Name: ${service}`);
  console.log(`Id: ${id}`);
  console.log(`OTP: ${token}`);
  console.log(`Type: ${type.toUpperCase()}`);
}

// function logConfig(config) {
//   console.log('Config:', JSON.stringify(config, null, 2));
// }

async function main() {
  try {
    const data = await fs.readFile('/workspaces/PicoAuth/src/config.json', 'utf8'); // Adjust the path if needed
    const jsonData = JSON.parse(data);
    const config = jsonData.config;
    // logConfig(config);
    
    // Check for user selection
    const service = 'aws'; // Replace with the desired service name (e.g., 'github', 'aws', etc.)
    generateToken(config, service);
  } catch (error) {
    console.error('Error fetching config:', error);
  }
}

main();
