rm -rf build
bash regen-fsdata.sh
git submodule update --init
mkdir -p build
cd build
cmake ..
make
