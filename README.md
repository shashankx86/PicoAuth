## PicoAuth

![authpico_logo](https://github.com/shashankx86/PicoAuth/assets/64682801/2501df5e-3237-4553-94ec-6b156702fcf1)

Get your TOTP/HOTP from your browser using pico! 

### pico-webserver

Webserver that came with TinyUSB slightly modified to run on a Raspberry Pi Pico. Lets the Pico pretend to be a USB Ethernet device. Runs a webinterface at http://192.168.7.1/
Build dependencies

On Debian:
```bash
sudo apt install git build-essential cmake gcc-arm-none-eabi
```

Your Linux distribution does need to provide a recent CMake (3.13+). If not, compile CMake from source first.
Build instructions

```bash
git clone --depth 1 https://github.com/shashankx86/PicoAuth
cd PicoAuth
git submodule update --init
mkdir -p build
cd build
cmake ..
make
```

Copy the resulting pico_webserver.uf2 file to the Pico mass storage device manually. Webserver will be available at http://192.168.7.1/

Content it is serving is in /fs If you change any files there, run ./regen-fsdata.sh

By default it shows a webpage that led you toggle the Pico's led, and allows you to switch to BOOTSEL mode.
