![authpico_logo](https://github.com/shashankx86/PicoAuth/assets/64682801/b3e5984a-fdae-4fbe-9467-ebd5b06b6356)

# AuthPico - WebUI
Frontend for AuthPico

# Build

```bash
bun install
bun run build
```

The built file are to moved to fs folder of firmware (ref main branch), then
```
chmod +x regen-fsdata.sh
./regen-fsdata.sh
```
to update fsdata

The build be automated with `build.sh` present in firmware source (ref main branch)
