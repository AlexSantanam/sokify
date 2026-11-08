/**
 * UNIVERSO693 · Starter Restaurante QR — Credenciales de Firebase
 * -----------------------------------------------------------------
 * Este archivo apunta al proyecto compartido "Zoco" (universo693-zoco),
 * que aloja a TODOS los restaurantes clientes en una misma base de datos,
 * separados por `restaurantId` (ver config.js). NO crees un proyecto
 * Firebase nuevo por cada cliente — solo copia esta carpeta y cambia el
 * restaurantId.
 *
 * Checklist para dar de alta un cliente nuevo (sin tocar la consola de
 * Firebase casi nada, ~2 minutos):
 * 1. Copia esta carpeta completa a `templates/<nombre-cliente>/`.
 * 2. En su `config.js`, cambia `restaurantId` a un slug único para ese
 *    local (ej. "sushi-house"). Este archivo (firebase-config.js) se deja
 *    IGUAL, no se toca — todos los clientes comparten estas credenciales.
 * 3. Crea su usuario en Authentication -> Usuarios -> Agregar usuario
 *    (https://console.firebase.google.com/project/universo693-zoco/authentication/users).
 *    Copia el UID que te muestra.
 * 4. En Firestore Database -> Datos, crea (o edita) el documento
 *    restaurantes/<restaurantId> y agrégale el campo `ownerUids` (array)
 *    con ese UID. Sin este paso, ese usuario no podrá editar la carta ni
 *    ver pedidos — las reglas de seguridad son por restaurante, no
 *    globales (así el dueño de un local nunca puede tocar los datos de
 *    otro que comparte el mismo proyecto).
 * 5. Abre su index.html una vez: la primera carga siembra Firestore con
 *    la carta de su config.js (solo pasa una vez, si ese restaurantId
 *    está vacío).
 *
 * Este objeto NO es secreto: Firebase está diseñado para que la
 * configuración web viaje en el navegador del cliente. La seguridad real
 * la dan las Reglas de Firestore (firestore.rules) + el campo ownerUids
 * de cada restaurante, no esto.
 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyC-8D0AZ5y_M8D9Fru9JbmaOrbUhZy5L-k",
  authDomain: "universo693-zoco.firebaseapp.com",
  projectId: "universo693-zoco",
  storageBucket: "universo693-zoco.firebasestorage.app",
  messagingSenderId: "66340498773",
  appId: "1:66340498773:web:e273eacaaa5b6d0db513dc"
};
