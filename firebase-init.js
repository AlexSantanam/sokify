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
   * Siembra Firestore con el catálogo de config.js SOLO la primera vez
   * (si las colecciones están vacías). Así cualquier demo nuevo funciona
   * de inmediato sin tener que cargar datos a mano, y una vez que el
   * dueño edita algo desde el panel, Firestore pasa a ser la fuente real.
   */
  window.seedIfEmpty = async function seedIfEmpty() {
    try {
      const [platosSnap, catsSnap] = await Promise.all([
        window.platosRef().limit(1).get(),
        window.categoriasRef().limit(1).get()
      ]);

      if (catsSnap.empty && Array.isArray(CFG.categorias)) {
        const batch = window.db.batch();
        CFG.categorias.forEach((cat, idx) => {
          if (cat.id === 'todos') return; // "Toda la carta" se genera en el cliente, no se guarda
          batch.set(window.categoriasRef().doc(cat.id), { ...cat, orden: idx });
        });
        await batch.commit();
      }

      if (platosSnap.empty && Array.isArray(CFG.platos)) {
        const batch = window.db.batch();
        CFG.platos.forEach((plato, idx) => {
          batch.set(window.platosRef().doc('plato-' + plato.id), {
            ...plato,
            disponible: true,
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
          actualizado: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error sembrando datos iniciales en Firestore:', err);
    }
  };
})();
