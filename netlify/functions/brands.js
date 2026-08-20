const crypto = require('crypto');

// Gemeinsame Marken-Konfiguration für auth.js und send.js.
// Jede Marke hat ein eigenes Passwort (als SHA-256-Hash) und einen eigenen n8n-Webhook.
// Für "hrservices" bleiben die alten Variablennamen (PASSWORD_HASH, WEBHOOK_CREATE)
// als Fallback gültig, damit bestehende Deployments weiterlaufen.
const BRANDS = {
  hrservices: {
    passwordHashEnv: ['PASSWORD_HASH_HRSERVICES', 'PASSWORD_HASH'],
    webhookEnv:      ['WEBHOOK_CREATE_HRSERVICES', 'WEBHOOK_CREATE'],
  },
  umantis: {
    passwordHashEnv: ['PASSWORD_HASH_UMANTIS'],
    webhookEnv:      ['WEBHOOK_CREATE_UMANTIS'],
  },
};

function isBrand(brand) {
  return typeof brand === 'string' && Object.prototype.hasOwnProperty.call(BRANDS, brand);
}

function firstEnv(names) {
  for (const name of names) {
    if (process.env[name]) return process.env[name];
  }
  return null;
}

function passwordHashFor(brand) {
  return firstEnv(BRANDS[brand].passwordHashEnv);
}

function webhookFor(brand) {
  return firstEnv(BRANDS[brand].webhookEnv);
}

// Das Session-Token ist an die Marke gebunden: HMAC(API_TOKEN, brand).
// Ein HR-Services-Login kann damit keinen Umantis-Blog auslösen und umgekehrt.
function tokenFor(brand) {
  const secret = process.env.API_TOKEN;
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(brand).digest('hex');
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

module.exports = { BRANDS, isBrand, passwordHashFor, webhookFor, tokenFor, safeEqual, cors };
