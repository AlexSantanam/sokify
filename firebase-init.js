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

  window.RESTAURANT_ID =
    urlParamRest ||
    storedRest ||
    CFG.restaurantId ||
    (CFG.nombre || 'restaurante-demo')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Si se ingresó por URL o registro nuevo, actualizar el nombre del restaurante dinámicamente
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
    if (!cfgDia || cfgDia.cerrado || !cfgDia.abre || !cfgDia.cierra) return false;

    const [hA, mA] = cfgDia.abre.split(':').map(Number);
    const [hC, mC] = cfgDia.cierra.split(':').map(Number);
    const minutosAhora = now.getHours() * 60 + now.getMinutes();
    const minutosApertura = hA * 60 + mA;
    const minutosCierre = hC * 60 + mC;
    return minutosAhora >= minutosApertura && minutosAhora < minutosCierre;
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
