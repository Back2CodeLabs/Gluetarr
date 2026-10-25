# Deployment notes

- `compose.example.yml` and `gluetun-auth.config.toml.example` show a minimal
  setup. Replace every placeholder; real keys and tokens belong in an
  untracked `.env` / `config.toml` (`chmod 600`).
- The web UI has **no authentication**: bind it to a LAN address (or put it
  behind an authenticated reverse proxy), never expose it to the Internet.
- Changing the country sends `PUT /v1/vpn/settings` to Gluetun. The tunnel
  restarts inside the same container, so containers using
  `network_mode: service:gluetun` keep their network. The change is runtime
  only: after Gluetun is recreated it falls back to `SERVER_COUNTRIES`.
- Containers built from this repository are not published anywhere: build
  locally with `docker build -t gluetun-webui-local .`.
