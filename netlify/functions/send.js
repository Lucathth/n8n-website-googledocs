const { isBrand, webhookFor, tokenFor, safeEqual, cors } = require('./brands');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors() };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors() };
  }

  let type, brand, message, token;
  try {
    ({ type, brand, message, token } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: cors() };
  }

  // Rückwärtskompatibel: ohne Marke = HR Services
  if (!brand) brand = 'hrservices';

  if (!isBrand(brand)) {
    return { statusCode: 400, headers: cors() };
  }

  // Token muss zur Marke passen (HMAC über den Markennamen)
  if (!safeEqual(token, tokenFor(brand))) {
    return { statusCode: 401, headers: cors() };
  }

  if (type !== 'create') {
    return { statusCode: 400, headers: cors() };
  }

  const url = webhookFor(brand);
  if (!url) {
    return { statusCode: 500, body: `Webhook URL für "${brand}" nicht konfiguriert`, headers: cors() };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, brand }),
    });
    return { statusCode: res.ok ? 200 : 502, headers: cors() };
  } catch {
    return { statusCode: 503, headers: cors() };
  }
};
