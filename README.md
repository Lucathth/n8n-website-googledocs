# Blog Generator — Abacus HR Services & Abacus Umantis

Statische Website (Netlify) mit zwei Bereichen. Jede Marke hat ein eigenes Passwort
und einen eigenen n8n-Webhook. Nach dem Login wird das Formular im jeweiligen
Branding angezeigt; der Auftrag geht an den Webhook der gewählten Marke.

```
index.html                 Frontend (Auswahl HR Services / Umantis, Login, Formular)
netlify/functions/auth.js  Passwort prüfen → markengebundenes Token
netlify/functions/send.js  Token prüfen → Nachricht an den n8n-Webhook der Marke
netlify/functions/brands.js gemeinsame Marken-/Env-Konfiguration
media/                     Logos
```

## Netlify-Umgebungsvariablen

Site configuration → Environment variables

| Variable | Marke | Beschreibung |
| --- | --- | --- |
| `PASSWORD_HASH_HRSERVICES` | HR Services | SHA-256-Hash des HR-Services-Passworts (ersetzt das alte `PASSWORD_HASH`, das weiterhin als Fallback funktioniert) |
| `WEBHOOK_CREATE_HRSERVICES` | HR Services | n8n-Webhook-URL für HR-Services-Blogs (ersetzt das alte `WEBHOOK_CREATE`, das weiterhin als Fallback funktioniert) |
| `PASSWORD_HASH_UMANTIS` | Umantis | SHA-256-Hash des Umantis-Passworts |
| `WEBHOOK_CREATE_UMANTIS` | Umantis | n8n-Webhook-URL für Umantis-Blogs |
| `API_TOKEN` | beide | Geheimer Zufallsstring; daraus werden die markengebundenen Session-Tokens abgeleitet (`HMAC-SHA256(API_TOKEN, marke)`) |

Hash erzeugen:

```
node -e "console.log(require('crypto').createHash('sha256').update('DEIN-PASSWORT').digest('hex'))"
```

Nach dem Ändern von Umgebungsvariablen muss die Site neu deployed werden
(Deploys → Trigger deploy), da Functions die Werte erst beim Build übernehmen.

## Webhook-Payload

`send.js` sendet an den n8n-Webhook:

```json
{ "message": "BLOG-THEMA: ...\nFOKUS-KEYWORD: ...", "brand": "hrservices" | "umantis" }
```

`message` ist unverändert zum bisherigen Format; `brand` ist neu und kann im
Workflow genutzt werden, falls beide Marken denselben Workflow verwenden.

## Lokal entwickeln

```
cp .env.example .env   # Werte eintragen
npm install
npx netlify dev
```
