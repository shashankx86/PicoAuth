const crypto = require('crypto');

function leftRotate(n, b) {
    return ((n << b) | (n >>> (32 - b))) & 0xFFFFFFFF;
}

function expandChunk(chunk) {
    const w = new Array(80);
    for (let i = 0; i < 16; i++) {
        w[i] = chunk.readUInt32BE(i * 4);
    }
    for (let i = 16; i < 80; i++) {
        w[i] = leftRotate(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }
    return w;
}

function sha1(message) {
    const HASH_CONSTANTS = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
    const h = [...HASH_CONSTANTS];

    const paddedMessage = Buffer.concat([
        message,
        Buffer.from([0x80]),
        Buffer.alloc((56 - (message.length + 1) % 64) % 64, 0),
        Buffer.alloc(8)
    ]);
    paddedMessage.writeUInt32BE(message.length * 8, paddedMessage.length - 4);

    for (let i = 0; i < paddedMessage.length; i += 64) {
        const chunk = paddedMessage.slice(i, i + 64);
        const w = expandChunk(chunk);

        let [a, b, c, d, e] = h;
        for (let i = 0; i < 80; i++) {
            let f, k;
            if (i < 20) {
                f = (b & c) | (~b & d);
                k = 0x5A827999;
            } else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            } else if (i < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            } else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            const temp = (leftRotate(a, 5) + f + e + k + w[i]) & 0xFFFFFFFF;
            e = d;
            d = c;
            c = leftRotate(b, 30);
            b = a;
            a = temp;
        }
        h[0] = (h[0] + a) & 0xFFFFFFFF;
        h[1] = (h[1] + b) & 0xFFFFFFFF;
        h[2] = (h[2] + c) & 0xFFFFFFFF;
        h[3] = (h[3] + d) & 0xFFFFFFFF;
        h[4] = (h[4] + e) & 0xFFFFFFFF;
    }
    const buffer = Buffer.alloc(20);
    h.forEach((val, i) => buffer.writeUInt32BE(val, i * 4));
    return buffer;
}

module.exports = { sha1 };
