/**
 * UNIVERSO693 · Starter Restaurante QR — Inicialización de Firebase
 * Compartido por index.html, panel.html y cocina.html.
 * Expone window.db, window.auth y helpers de colección comunes.
 */
(function () {
  firebase.initializeApp(window.FIREBASE_CONFIG);

  window.db = firebase.firestore();
  window.auth = firebase.auth();

  // Identificador único del local. Soporta multi-tenant dinámico vía URL (?r=...) o localStorage
  const CFG = window.RESTAURANTE_CONFIG || {};
  const urlParamRest = new URLSearchParams(window.location.search).get('r');
  const storedRest = localStorage.getItem('sokify_restaurant_id');

  // Subdominio automático: <slug>.zokify.app → restaurante <slug>
  const RESERVED_SUBS = ['www', 'app', 'api', 'panel', 'admin', 'mail', 'demo', 'cocina', 'kds'];
  const hostMatch = window.location.hostname.toLowerCase().match(/^([a-z0-9-]+)\.zokify\.app$/);
  const subdomainRest = hostMatch && !RESERVED_SUBS.includes(hostMatch[1]) ? hostMatch[1] : null;
  window.SUBDOMAIN_RESTAURANT = subdomainRest;

  window.RESTAURANT_ID =
    subdomainRest ||
    urlParamRest ||
    storedRest ||
    CFG.restaurantId ||
    (CFG.nombre || 'restaurante-demo')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Si se ingresó por URL o registro nuevo, actualizar el nombre del restaurante dinámicamente
  window.MENU_URL = subdomainRest ? '/products' : 'menu.html?r=' + encodeURIComponent(window.RESTAURANT_ID);
  const storedName = localStorage.getItem('sokify_restaurant_name');
  if (storedName && (urlParamRest || storedRest)) {
    CFG.nombre = storedName;
  }

  function restRef() {
    return window.db.collection('restaurantes').doc(window.RESTAURANT_ID);
  }
  window.restRef = restRef;
  window.platosRef = () => restRef().collection('platos');
  window.categoriasRef = () => restRef().collection('categorias');
  window.pedidosRef = () => restRef().collection('pedidos');
  window.clientesRef = () => restRef().collection('clientes');
  window.descuentosRef = () => restRef().collection('descuentos');

  // Normaliza un teléfono a solo dígitos, para usarlo como ID de documento estable.
  window.normalizarTelefono = function normalizarTelefono(tel) {
    return (tel || '').replace(/\D/g, '');
  };

  // Días de la semana en el mismo orden que Date.getDay() (0 = domingo).
  window.DIAS_SEMANA = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  window.DIAS_SEMANA_LABEL = { dom: 'Domingo', lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado' };

  /**
   * Determina si el local está abierto AHORA MISMO, combinando la pausa
   * manual (prioridad, para emergencias) con el horario semanal configurado
   * en panel.html. Si todavía no se configuró ningún horario, se mantiene
   * el comportamiento anterior (abierto por defecto) para no romper demos.
   */
  window.calcularAbiertoAhora = function calcularAbiertoAhora(data) {
    if (data.pausaManual) return false;
    const horario = data.horario;
    if (!horario) return true;

    const now = new Date();
    const diaKey = window.DIAS_SEMANA[now.getDay()];
    const cfgDia = horario[diaKey];
    const minutosAhora = now.getHours() * 60 + now.getMinutes();
    const toMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
    const enRango = (abre, cierra, min) => {
      const a = toMin(abre), c = toMin(cierra);
      if (a === c) return true;          // 24 horas
      if (c > a) return min >= a && min < c;
      return min >= a || min < c;        // cruza medianoche (ej. 20:00 - 02:00)
    };

    // Turno de hoy
    if (cfgDia && !cfgDia.cerrado) {
      const turnos = window.obtenerTurnosDia(cfgDia);
      if (turnos.some(t => enRango(t.abre, t.cierra, minutosAhora))) return true;
    }

    // Turnos de ayer que cruzan medianoche y siguen vigentes
    const ayerKey = window.DIAS_SEMANA[(now.getDay() + 6) % 7];
    const cfgAyer = horario[ayerKey];
    if (cfgAyer && !cfgAyer.cerrado) {
      const turnosAyer = window.obtenerTurnosDia(cfgAyer);
      if (turnosAyer.some(t => toMin(t.cierra) < toMin(t.abre) && minutosAhora < toMin(t.cierra))) return true;
    }
    return false;
  };

  // Normaliza un día del horario a una lista de turnos [{abre, cierra}].
  // Compatible con el formato antiguo { abre, cierra, cerrado }.
  window.obtenerTurnosDia = function obtenerTurnosDia(cfgDia) {
    if (!cfgDia) return [];
    let turnos = Array.isArray(cfgDia.turnos) && cfgDia.turnos.length
      ? cfgDia.turnos
      : [{ abre: cfgDia.abre, cierra: cfgDia.cierra }];
    return turnos.filter(t => t && t.abre && t.cierra);
  };

  /**
   * Catálogo oficial base para Botillerías & Licorerías
   * Contiene 14 productos estrella con códigos EAN-13 oficiales y stock real.
   */
  const BOTILLERIA_SEED = {
    categorias: [
      { id: 'cervezas', nombre: '🍺 Cervezas & Schops', orden: 1 },
      { id: 'piscos', nombre: '🍇 Piscos Chilenos', orden: 2 },
      { id: 'destilados', nombre: '🥃 Whiskies & Destilados', orden: 3 },
      { id: 'vinos', nombre: '🍷 Vinos & Espumantes', orden: 4 },
      { id: 'bebidas-hielo', nombre: '🧊 Bebidas, Energéticas & Hielo', orden: 5 },
      { id: 'snacks', nombre: '🥜 Snacks & Piqueos', orden: 6 }
    ],
    platos: [
      { id: 1, name: 'Pack Corona Extra 355cc (6 Unidades)', cat: 'cervezas', price: 7990, badge: 'PROMO PACK', barcode: '7501064191307', desc: 'Pack de 6 botellas 355cc heladas. Cerveza clara tipo Pilsner de origen mexicano.', img: 'https://images.unsplash.com/photo-1608270116666-3d233479b18f?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 24 },
      { id: 2, name: 'Cerveza Heineken Long Neck 330cc', cat: 'cervezas', price: 1500, barcode: '8712000025345', desc: 'Cerveza rubia Premium Lager 5.0°, servida bien helada.', img: 'https://images.unsplash.com/photo-1618886614638-80e3c15cd819?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 48 },
      { id: 3, name: 'Cerveza Austral Calafate 330cc', cat: 'cervezas', price: 2100, badge: 'PATAGONIA', barcode: '7802110001083', desc: 'Cerveza artesanal de la Patagonia chilena con toques de fruto calafate silvestre.', img: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 36 },
      { id: 4, name: 'Pisco Mistral 35° Especial 750cc', cat: 'piscos', price: 8990, badge: 'TOP VENTAS', barcode: '7804300000049', desc: 'Pisco chileno añejado en barricas de roble americano.', img: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 20 },
      { id: 5, name: 'Pisco Alto del Carmen 35° Especial 750cc', cat: 'piscos', price: 8490, barcode: '7804332000031', desc: 'Pisco elaborado 100% con uvas Moscatel del Valle del Huasco.', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 18 },
      { id: 6, name: 'Pisco Mistral Nobel 40° Gran Reserva 750cc', cat: 'piscos', price: 14990, badge: 'PREMIUM', barcode: '7804300000308', desc: 'Pisco de guarda prolongada en barricas de roble virgen, notas a vainilla y caramelo.', img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 10 },
      { id: 7, name: 'Whisky Johnnie Walker Red Label 750cc', cat: 'destilados', price: 16990, barcode: '5000267014005', desc: 'Blended Scotch Whisky con carácter especiado y ahumado.', img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 12 },
      { id: 8, name: 'Gin Tanqueray London Dry 750cc', cat: 'destilados', price: 19990, barcode: '5000281005409', desc: 'Gin británico cuatro veces destilado con enebro, cilantro y regaliz.', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 8 },
      { id: 9, name: 'Casillero del Diablo Cabernet Sauvignon 750cc', cat: 'vinos', price: 5990, barcode: '7804320142019', desc: 'Vino tinto chileno Reserva del Valle Central, notas a ciruelas y cassis.', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 24 },
      { id: 10, name: 'Bebida Coca-Cola Original 1.5 Litros', cat: 'bebidas-hielo', price: 1800, barcode: '7801610001011', desc: 'Botella 1.5L bien helada, el acompañamiento ideal.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 30 },
      { id: 11, name: 'Bebida Energética Red Bull Original 250cc', cat: 'bebidas-hielo', price: 1900, barcode: '9002490100070', desc: 'Lata 250cc helada con taurina y cafeína.', img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 40 },
      { id: 12, name: 'Bolsa de Hielo Purificado en Cubos 2.5 Kg', cat: 'bebidas-hielo', price: 2000, badge: 'ESENCIAL', barcode: '7804612340015', desc: 'Cubos de hielo purificado y filtrado en bolsa de 2.5 kilos.', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', destacado: true, controlStock: true, stock: 50 },
      { id: 13, name: 'Papas Fritas Lay\'s Corte Americano 220g', cat: 'snacks', price: 2290, barcode: '7802800001227', desc: 'Papas fritas crujientes con sal, formato familiar para compartir.', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 25 },
      { id: 14, name: 'Maní Salado Tostado Marco Polo 150g', cat: 'snacks', price: 1290, barcode: '7802800005416', desc: 'Maní seleccionado tostado y con sal de mar.', img: 'https://images.unsplash.com/photo-1525253086316-d0c936c8146c?auto=format&fit=crop&w=800&q=80', destacado: false, controlStock: true, stock: 30 }
    ]
  };

  /**
   * Siembra Firestore con el catálogo adecuado según el rubro SOLO la primera vez
   * (si las colecciones están vacías). Si el rubro es botillería, siembra alcohol y stock real.
   */
  window.seedIfEmpty = async function seedIfEmpty() {
    try {
      const [platosSnap, catsSnap] = await Promise.all([
        window.platosRef().limit(1).get(),
        window.categoriasRef().limit(1).get()
      ]);

      // Determinar rubro del local
      let rubro = localStorage.getItem('sokify_rubro');
      if (!rubro) {
        try {
          const rDoc = await restRef().get();
          if (rDoc.exists) rubro = rDoc.data().rubroNegocio;
        } catch (_) {}
      }
      rubro = (rubro || '').toLowerCase().trim();
      const esBotilleria = (rubro === 'botilleria' || rubro === 'licoreria');

      const targetCats = esBotilleria ? BOTILLERIA_SEED.categorias : CFG.categorias;
      const targetPlatos = esBotilleria ? BOTILLERIA_SEED.platos : CFG.platos;

      if (catsSnap.empty && Array.isArray(targetCats)) {
        const batch = window.db.batch();
        targetCats.forEach((cat, idx) => {
          if (cat.id === 'todos') return; // "Toda la carta" se genera en el cliente, no se guarda
          batch.set(window.categoriasRef().doc(cat.id), { ...cat, orden: idx });
        });
        await batch.commit();
      }

      if (platosSnap.empty && Array.isArray(targetPlatos)) {
        const batch = window.db.batch();
        targetPlatos.forEach((plato, idx) => {
          batch.set(window.platosRef().doc('plato-' + (esBotilleria ? 'botilleria-' : '') + plato.id), {
            ...plato,
            disponible: true,
            controlStock: plato.controlStock !== undefined ? plato.controlStock : esBotilleria,
            stock: plato.stock !== undefined ? plato.stock : (esBotilleria ? 24 : 0),
            barcode: plato.barcode || '',
            orden: idx
          });
        });
        await batch.commit();
      }

      // Documento raíz del local: estado abierto/pausado + promo en vivo.
      const rootSnap = await restRef().get();
      if (!rootSnap.exists) {
        await restRef().set({
          abierto: true,
          promo: '',
          rubroNegocio: esBotilleria ? 'botilleria' : (rubro || 'restaurante'),
          actualizado: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error sembrando datos iniciales en Firestore:', err);
    }
  };

  /**
   * Sincronización dinámica de Favicon y Apple Touch Icon con el logo del restaurante
   * Permite que la pestaña del navegador muestre el logo real del local en vez del de Zokify.
   */
  window.actualizarFaviconRestaurante = function (logoUrl, nombreRestaurante) {
    try {
      let faviconUrl = logoUrl;

      if (!faviconUrl) {
        // Generar un favicon SVG con la inicial del restaurante y degradado moderno
        const name = nombreRestaurante || (CFG && CFG.nombre) || window.RESTAURANT_ID || 'Z';
        const inicial = (name.trim().charAt(0) || 'Z').toUpperCase();
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7C3AED"/>
              <stop offset="100%" stop-color="#4F46E5"/>
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="18" fill="url(#g)"/>
          <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${inicial}</text>
        </svg>`;
        faviconUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      }

      // 1. Reemplazar o insertar favicon
      let linkIcon = document.querySelector("link[rel*='icon']");
      if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.rel = 'icon';
        document.head.appendChild(linkIcon);
      }
      linkIcon.type = faviconUrl.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/png';
      linkIcon.href = faviconUrl;

      // 2. Reemplazar o insertar apple-touch-icon
      let linkApple = document.querySelector("link[rel='apple-touch-icon']");
      if (!linkApple) {
        linkApple = document.createElement('link');
        linkApple.rel = 'apple-touch-icon';
        document.head.appendChild(linkApple);
      }
      linkApple.href = faviconUrl;
    } catch (e) {
      console.warn('Error actualizando favicon dinámico:', e);
    }
  };

  // Inicialización inmediata al cargar el archivo (desde caché local o inicial)
  try {
    const cachedLogo = localStorage.getItem('sokify_logo_' + window.RESTAURANT_ID);
    window.actualizarFaviconRestaurante(cachedLogo, (CFG && CFG.nombre) || window.RESTAURANT_ID);
  } catch (e) {}

  // Sincronización en tiempo real desde Firestore si está disponible
  try {
    if (typeof restRef === 'function') {
      restRef().onSnapshot(snap => {
        if (!snap || !snap.exists) return;
        const data = snap.data() || {};
        const logo = data.logoUrl || data.logo || null;
        const nombre = data.nombreNegocio || data.nombre || (CFG && CFG.nombre);
        if (logo) {
          try {
            localStorage.setItem('sokify_logo_' + window.RESTAURANT_ID, logo);
          } catch (e) {}
        }
        window.actualizarFaviconRestaurante(logo, nombre);
      }, () => {});
    }
  } catch (err) {}
})();

