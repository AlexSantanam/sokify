// Vercel Routing Middleware: <slug>.zokify.app → página del negocio (no la landing de Zokify)
export const config = { matcher: ['/', '/index.html'] };

const RESERVED = ['www', 'app', 'api', 'panel', 'admin', 'mail', 'demo', 'cocina', 'kds'];

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const m = host.match(/^([a-z0-9-]+)\.zokify\.app$/);
  if (!m || RESERVED.includes(m[1])) return;

  const url = new URL(request.url);
  url.pathname = '/bienvenida.html';
  return new Response(null, { headers: { 'x-middleware-rewrite': url.toString() } });
}
