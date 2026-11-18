// Inicia el flujo OAuth para que UN restaurante conecte SU PROPIO Google Business Profile.
// Zokify (esta app) nunca ve la contraseña del restaurante: Google redirige a su propia
// pantalla de login/consentimiento y solo nos entrega un código de autorización.
function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export default function handler(req, res) {
  const { restaurantId } = req.query;
  if (!restaurantId || typeof restaurantId !== 'string') {
    res.status(400).send('Falta el parámetro restaurantId.');
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GOOGLE_CLIENT_ID no está configurado.');
    return;
  }

  const redirectUri = `${getBaseUrl(req)}/api/oauth/google-business-callback`;
  const state = Buffer.from(JSON.stringify({ restaurantId })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/business.manage',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  res.end();
}
