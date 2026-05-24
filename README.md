# Stacklink Frontend

Frontend ini dibangun dengan React + Vite dan bisa di-deploy ke Netlify.

## Environment variable

Untuk local development atau deploy production, set:

```env
VITE_API_BASE_URL=https://be-stacklink-app-production.up.railway.app
```

Frontend akan mengirim request API langsung ke backend tersebut, termasuk endpoint WebSocket analytics.

## Deploy ke Netlify

Gunakan setting berikut di Netlify:

```txt
Build command: npm run build
Publish directory: dist
```

Tambahkan environment variable ini di Netlify Site Settings:

```txt
VITE_API_BASE_URL = https://be-stacklink-app-production.up.railway.app
```

File `netlify.toml` sudah dikonfigurasi untuk SPA redirect ke `index.html`, jadi route React tetap jalan saat page di-refresh langsung di Netlify.
