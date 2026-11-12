import type { VercelRequest, VercelResponse } from '@vercel/node';

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch(e) {}
  }

  const targetUrl = body?.url || req.query?.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'URL requerida' });
  }

  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  try {
    // 1. Fetch initial URL
    let fetchUrl = cleanUrl;
    let response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    let html = await response.text();

    // If it's a root welcome page (like fravioli.ola.click), check if /products exists
    if (!html.includes('products-ld-json-schema') && !html.includes('hasMenuSection')) {
      const parsedUrl = new URL(cleanUrl);
      if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') {
        const productsUrl = `${parsedUrl.origin}/products`;
        try {
          const pRes = await fetch(productsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          if (pRes.status === 200) {
            const pHtml = await pRes.text();
            if (pHtml.includes('products-ld-json-schema') || pHtml.includes('hasMenuSection')) {
              html = pHtml;
              fetchUrl = productsUrl;
            }
          }
        } catch (e) {
          // fallback to original html
        }
      }
    }

    const categories: MenuCategory[] = [];
    const products: MenuItem[] = [];
    let restaurantName = 'Restaurante';

    // 2. Parse Schema.org JSON-LD (Standard in OlaClick and modern food apps)
    const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*data-hid="products-ld-json-schema"[^>]*>([\s\S]*?)<\/script>/)
      || html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);

    if (ldMatch) {
      try {
        const schema = JSON.parse(ldMatch[1]);
        if (schema.name) {
          restaurantName = schema.name.replace(/ - Menú.*$/i, '').trim();
        }

        const sections = schema.hasMenuSection || (schema['@type'] === 'Menu' ? schema.hasMenuItem : []);
        if (Array.isArray(sections)) {
          sections.forEach((sec: any, sIdx: number) => {
            const catName = sec.name || `Categoría ${sIdx + 1}`;
            const catId = `cat_${Date.now()}_${sIdx}`;
            categories.push({ id: catId, name: catName });

            const items = sec.hasMenuItem || [];
            if (Array.isArray(items)) {
              items.forEach((it: any) => {
                let price = 0;
                if (it.offers) {
                  const rawP = it.offers.price || it.offers.lowPrice || it.offers.highPrice;
                  price = typeof rawP === 'number' ? rawP : parseFloat(String(rawP || 0).replace(/[^0-9.]/g, '')) || 0;
                }
                products.push({
                  name: it.name || 'Sin nombre',
                  description: it.description || '',
                  price: price,
                  image: it.image || '',
                  category: catName,
                  available: true
                });
              });
            }
          });
        }
      } catch (err) {
        console.warn('Error parsing JSON-LD:', err);
      }
    }

    if (products.length === 0) {
      return res.status(422).json({
        success: false,
        error: 'No se encontraron productos estructurados en este enlace. Puedes solicitar migración asistida por WhatsApp.'
      });
    }

    return res.status(200).json({
      success: true,
      restaurantName,
      totalCategories: categories.length,
      totalProducts: products.length,
      categories,
      products
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el enlace'
    });
  }
}
