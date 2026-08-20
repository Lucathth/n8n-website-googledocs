const crypto = require('crypto');
const { isBrand, passwordHashFor, tokenFor, safeEqual, cors } = require('./brands');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors() };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors() };
  }

  let password, brand;
  try {
    ({ password, brand } = JSON.parse(event.body || '{}'));
  } catch {
    return { statusCode: 400, headers: cors() };
  }

  // Rückwärtskompatibel: ohne Marke = HR Services
  if (!brand) brand = 'hrservices';

  if (!password || !isBrand(brand)) {
    return { statusCode: 400, headers: cors() };
  }

  const expectedHash = passwordHashFor(brand);
  const token = tokenFor(brand);
  if (!expectedHash || !token) {
    return {
      statusCode: 500,
      headers: { ...cors(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Zugang für "${brand}" ist nicht konfiguriert` }),
    };
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (safeEqual(hash, expectedHash)) {
    return {
      statusCode: 200,
      headers: { ...cors(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, brand }),
    };
  }

  return {
    statusCode: 401,
    headers: { ...cors(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Ungültiges Passwort' }),
  };
};
