install:
	yarn install --frozen-lockfile

	sed -i -E 's|npm:@sveltejs/kit@[^/"]+|@sveltejs/kit|g' ./node_modules/@hearchco/sveltekit-adapter-aws/handler/index.js

update:
	yarn update

dev:
	yarn run dev -- --host 0.0.0.0 --port 5173

compile:
	yarn run build

preview:
	yarn run preview -- --host 0.0.0.0

check:
	yarn run check

test:
	yarn run test:unit

lint:
	yarn run lint

format:
	yarn run format

adapter-aws:
	cp svelte.config.aws.js svelte.config.js

adapter-node:
	cp svelte.config.node.js svelte.config.js

adapter-auto:
	cp svelte.config.auto.js svelte.config.js
