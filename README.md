## SearxNG frontend built using SvelteKit & TailwindCSS
Adopted from [Hearchco/frontend](https://github.com/hearchco/frontend)

## FAQ
POC POC POC


## Install
```
cd /opt
git clone https://github.com/allendema/searxng-svelte.git
cd searxng-svelte
make install
```

## Setup

## Edit `.env` file with your domain.
## Add HTTP Headers for your frontend domain to searxNG settings.yml and restart it.
In 'server' -> 'default\_http\_headers' section:
```yaml
        Access-Control-Allow-Origin: "https://*.pi.local"
        Access-Control-Allow-Methods: "GET, POST"
        Access-Control-Allow-Headers: "Content-Type, Authorization"
```

`make dev`

then visit your domain/webui to search!

## TODO
  - fix image previews
  - copy search url
  - systemd service
  - use [bunJS](https://bun.sh/) instead of yarn/pnpm.
