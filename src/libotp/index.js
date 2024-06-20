const { hmacSha1 } = require('./sha1');
const { base32Decode } = require('./base32');

function totp(time, key, stepSecs = 30, digits = 6) {
    const decodedKey = base32Decode(key);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(Math.floor(time / stepSecs), 4);

    const hmac = hmacSha1(decodedKey, timeBuffer);
    const offset = hmac[hmac.length - 1] & 0xF;
    const code = ((hmac[offset] & 0x7F) << 24 |
        (hmac[offset + 1] & 0xFF) << 16 |
        (hmac[offset + 2] & 0xFF) << 8 |
        (hmac[offset + 3] & 0xFF)) % (10 ** digits);

    return {
        password: code.toString().padStart(digits, '0'),
        expiry: stepSecs - (time % stepSecs)
    };
}

module.exports = { totp };
