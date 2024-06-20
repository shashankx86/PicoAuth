#!/bin/bash

WEBUI_REPO="https://github.com/shashankx86/PicoAuth"
WEBUI_REPO_BRANCH="webui"
WEBUI_REPO_CLONE_LOC="tmp"
WEBUI_DIST="dist"
AUTHPICO_FS="fs"
AUTHPICO_BUILD_FOLDER="build"
JS_B="bun"

echo "webui: cloning"
git clone $WEBUI_REPO -b $WEBUI_REPO_BRANCH $WEBUI_REPO_CLONE_LOC
cd $WEBUI_REPO_CLONE_LOC
echo "webui: installing deps"
$JS_B install
echo "webui: building"
$JS_B run build 

echo "webui: copying $WEBUI_DIST/* to ../$AUTHPICO_FS"
cp -r $WEBUI_DIST/* ../$AUTHPICO_FS
echo "webui: done"

cd ..

if [ -d "$AUTHPICO_BUILD_FOLDER" ]; then
    rm -rf "$AUTHPICO_BUILD_FOLDER"
    mkdir $AUTHPICO_BUILD_FOLDER
else
    mkdir $AUTHPICO_BUILD_FOLDER
fi

echo "authpico: clonig deps"
git submodule update --init
echo "authpico: building fs"
bash regen-fsdata.sh
echo "authpico: fs build done"

echo "authpico: building"
cd $AUTHPICO_BUILD_FOLDER
cmake ..
make
echo "authpico: Done!"
