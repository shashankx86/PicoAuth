const { hmacSha1 } = require('./sha1');
const { base32Decode } = require('./base32');

function hotp(counter, key, digits = 6) {
    const decodedKey = base32Decode(key);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeUInt32BE(Math.floor(counter / Math.pow(2, 32)), 0);
    counterBuffer.writeUInt32BE(counter % Math.pow(2, 32), 4);

    const hmac = hmacSha1(decodedKey, counterBuffer);
    const offset = hmac[hmac.length - 1] & 0xF;
    const code = ((hmac[offset] & 0x7F) << 24 |
        (hmac[offset + 1] & 0xFF) << 16 |
        (hmac[offset + 2] & 0xFF) << 8 |
        (hmac[offset + 3] & 0xFF)) % (10 ** digits);

    return code.toString().padStart(digits, '0');
}

function totp(time, key, stepSecs = 30, digits = 6) {
    const counter = Math.floor(time / stepSecs);
    return {
        password: hotp(counter, key, digits),
        expiry: stepSecs - (time % stepSecs)
    };
}

module.exports = { hotp, totp };
