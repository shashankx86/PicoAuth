rm -rf build
git submodule update --init
bash regen-fsdata.sh
mkdir -p build
cd build
cmake ..
make
