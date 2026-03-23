# Cloudflare pages
This repo is used for cloudflare pages project https://developers.cloudflare.com/pages.

## Functions
The `functions` folder contains js files that are executed as a cloudflare workers on fetch actions:
https://developers.cloudflare.com/pages/functions/

So `fetch("/hello")` from `src/App.tsx` when called from cloudflare pages actually calls `onRequest` form `functions/hello.js`. This method is run on cloudflare worker so it is server-side. Because of this `context.env` is not from client-side machine but a worker. That is why putting there credentials in env vars is safe.

# Local development

```
npm install
VITE_ACTIONS="a,b,c" VITE_TIME_VALUES="0,1,2,3" npm run dev 
```
