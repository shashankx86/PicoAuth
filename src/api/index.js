// api/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { totp } = require('../src/libotp');
const { synchronisedTime } = require('../src/synchronisedTime');

const app = express();

app.use(cors());

const codes = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/test_config.json'), 'utf8'));
let selectedIdx = 0;

function generateOTP() {
  const code = codes[selectedIdx];
  selectedIdx = (selectedIdx + 1) % codes.length;

  const { password, expiry } = totp(synchronisedTime(), code.key, code.step, code.digits);
  return { password, expiry, name: code.name };
}

app.get('/otp', (req, res) => {
  const otp = generateOTP();
  res.json(otp);
});

module.exports = app;
