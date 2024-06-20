const fs = require('fs');
const path = require('path');
const { totp } = require('./otplib');
const { synchronisedTime } = require('./synchronisedTime');

const codes = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
let selectedIdx = 0;

function main() {
    setInterval(() => {
        const code = codes[selectedIdx];
        selectedIdx = (selectedIdx + 1) % codes.length;

        const { password, expiry } = totp(synchronisedTime(), code.key, code.step, code.digits);

        console.log(`\nCode Name: ${code.name}`);
        console.log(`Password: ${password}`);
        console.log(`${expiry} seconds remaining`);

        setTimeout(() => {}, expiry * 1000);
    }, 1000);
}

main();
