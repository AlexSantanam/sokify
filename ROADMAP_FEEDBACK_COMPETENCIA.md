# 📌 Sokify · Feedback de Clientes de la Competencia (OlaClick) & Roadmap de Apps Nativas (Google Play & Apple App Store)

> **Documento de Memoria Estratégica · UNIVERSO693 SpA**  
> Fecha de registro: Noviembre 2026  
> Objetivo: Resolver las quejas y vacíos funcionales de OlaClick para superarlos categóricamente en la versión Web PWA y en las futuras Apps Nativas de Android e iOS.

---

## 1. Feedback Real Capturado de Usuarios de OlaClick

### Caso #1: Notificaciones Push en Barra de Notificaciones y Segundo Plano
* **Fecha reseña:** 18/11/2024 · Gui.trindade (4/5 estrellas)
* **Texto exacto:**
  > *"Llevo usando Olá Click unos meses y me encantan sus funciones. Sin embargo, sería muy útil que incluyera una función para recibir notificaciones de nuevos pedidos directamente en la barra de notificaciones del móvil. Actualmente, solo me entero de los pedidos cuando el cliente me envía un mensaje por WhatsApp o cuando abro la app. Como solo la uso para organizar el inventario, esta función de notificaciones me vendría de maravilla."*

* **Diagnóstico del problema de OlaClick:**
  * OlaClick depende excesivamente de que el restaurante tenga la pantalla abierta todo el día o de que el cliente final le envíe un texto por WhatsApp.
  * Si el dueño bloquea el celular o está en otra app, **pierde ventas o se atrasa la comanda** porque no hay Push Notifications con sonido persistente.

* **Solución y Ventaja Competitiva de Sokify:**
  1. **En Web / PWA (Inmediato):**
     * Integrar **Web Push API + Service Worker (Firebase Cloud Messaging - FCM)** para que lleguen notificaciones en la barra de Android y iPhone (iOS 16.4+).
     * Mantener el **Aviso Sonoro de Cocina (Web Audio API)** que ya tenemos en `cocina.html` y `panel.html`.
  2. **En Apps Nativas de Google Play & App Store:**
     * Notificaciones Push de alta prioridad (`priority: high`, `channelId: orders_alarm`) que suenen como una alarma de pedidos incluso en modo silencio / pantalla bloqueada (tipo Uber Eats / PedidosYa partner).
  3. **Canal de Backup Redundante:**
     * Envío automático de alerta por WhatsApp/Telegram al garzón o dueño en cuanto entra el pedido.

---

### Caso #2: Fallas de compatibilidad en apertura de App móvil vs Mac/Escritorio
* **Problema detectado:**
  * Clientes reportan que la app móvil se congela o no carga correctamente en ciertos dispositivos móviles mientras que en escritorio funciona, generando desconfianza en horas de alta demanda (almuerzo/cena).
* **Solución Sokify:**
  * Arquitectura ultra-liviana con carga diferida, soporte offline en IndexedDB / localStorage y sincronización continua en Firestore.

---

## 2. Matriz de Requerimientos para el Lanzamiento en Google Play & Apple App Store

| Módulo | Requerimiento Técnico | Impacto en el Restaurante |
| :--- | :--- | :--- |
| **Push Notifications** | Alerta en barra de estado + sonido timbrado fuerte configurable (chime de cocina). | No se pasa ningún pedido aunque el celular esté en el bolsillo o bloqueado. |
| **Impresión Directa** | Bluetooth ESC/POS y USB nativo sin necesidad de drivers adicionales. | Comanda impresa automáticamente en cocina al presionar "Aceptar". |
| **Sincronización KDS** | WebSocket / Firestore real-time listener con reconexión automática en micro-cortes de WiFi. | Cocina y barra sincronizadas al milisegundo sin desfase. |
| **Modo Offline** | Registro de comanda en caché local si se cae el internet, sincronizando al volver la señal. | El local sigue vendiendo mesas aunque se corte la conexión. |

---

*Memoria guardada para el empaquetado de producción con Capacitor / React Native / Flutter de Sokify.*
