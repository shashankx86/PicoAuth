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

module.exports = { base32Decode };
