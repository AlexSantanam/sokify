import admin from 'firebase-admin';

// Reutiliza la misma instancia de Admin SDK entre invocaciones (Vercel reusa el proceso).
function getFirestore() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

// Recibe el código de autorización de Google, lo cambia por tokens de acceso/refresco,
// y los guarda en el documento de ESE restaurante — nunca en uno compartido por Zokify.
export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    res.status(400).send(`No se pudo conectar con Google Business: ${error}`);
    return;
  }
  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    res.status(400).send('Faltan parámetros de autorización.');
    return;
  }

  let restaurantId;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    restaurantId = decoded.restaurantId;
  } catch {
    res.status(400).send('Estado de autorización inválido.');
    return;
  }
  if (!restaurantId) {
    res.status(400).send('Falta el restaurante asociado a esta conexión.');
    return;
  }

  const redirectUri = `${getBaseUrl(req)}/api/oauth/google-business-callback`;

  try {
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok) {
      console.error('Error intercambiando código por token de Google Business:', tokenData);
      res.status(400).send('No se pudo completar la conexión con Google Business Profile.');
      return;
    }

    const { access_token, refresh_token, expires_in, scope } = tokenData;

    await getFirestore().collection('restaurantes').doc(restaurantId).set({
      integraciones: {
        googleBusiness: {
          connected: true,
          accessToken: access_token,
          refreshToken: refresh_token || null,
          expiryDate: Date.now() + (expires_in || 0) * 1000,
          scope,
          connectedAt: new Date().toISOString(),
        },
      },
    }, { merge: true });

    res.writeHead(302, { Location: '/panel?google_business=conectado' });
    res.end();
  } catch (err) {
    console.error('Error en callback de Google Business:', err);
    res.status(500).send('Error interno al conectar con Google Business Profile.');
  }
}
