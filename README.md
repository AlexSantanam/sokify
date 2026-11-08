# 🦉 Sokify (Sokify) · Sistema Operativo Gastronómico y Punto de Venta Inteligente

**Dominio Oficial:** [https://sokify.app](https://sokify.app)

Sokify es una plataforma integral de gestión para restaurantes, cafeterías, dark kitchens y cadenas gastronómicas. Proporciona control total de pedidos, cocina multi-pantalla, menú digital QR, gestión de caja, inventario con alertas de stock, marketing automatizado y analítica de ventas en tiempo real sin comisiones por transacción.

---

## 🚀 Arquitectura y Módulos del Sistema

| Módulo | Archivo Principal | Descripción |
| :--- | :--- | :--- |
| 📋 **Punto de Venta (PDV) Hub** | `panel.html` (Tab PDV) | Bandeja unificada de pedidos por canal (Mostrador, Mesas, Delivery, Apps). Apertura/cierre de turnos y arqueo de caja con desglose de medios de pago. |
| 👨‍🍳 **Cocina KDS Multi-Estación** | `cocina.html` y `panel.html` | Pantalla de cocina interactiva en tiempo real con temporizadores de alerta (verde/amarillo/rojo), filtrado por estaciones (Plancha, Freidora, Ensaladas, Bebidas) y sonido de aviso sonoro. |
| 📱 **Menú Digital QR para Clientes** | `index.html` | Carta digital responsive con carrito dinámico, cálculo de delivery por km/polígono, selector de propina (10%, 15%, otra), personalizador de modificadores y envío directo a WhatsApp. |
| 🌟 **Página de Bienvenida** | `bienvenida.html` | Landing de bienvenida al escanear el QR con llamado a la acción para pedir en mesa o a domicilio. |
| 🏷️ **Generador de Códigos QR** | `generador-qrs.html` | Herramienta para generar y descargar códigos QR imprimibles por cada mesa o área del local. |
| 📊 **Ventas, Caja y Reportes** | `panel.html` (Tab Ventas) | Métricas operativas, gráfico de ventas diarias, ticket promedio, historial de turnos y exportación de datos. |
| 💳 **Módulo Financiero** | `panel.html` (Tab Finanzas) | Registro de gastos e ingresos, cuentas bancarias, pasarelas de pago y comisiones. |
| 📦 **Inventario & Stock** | `panel.html` (Tab Inventario) | Control de existencias, cálculo de recetas, alertas de agotado y reabastecimiento rápido en 1 clic. |
| 🤖 **Chatbot WhatsApp con IA** | `panel.html` (Tab Chatbot) | Asistente inteligente 24/7 conectado a la carta para toma de pedidos y resolución de dudas frecuentes. |
| 👥 **Clientes CRM & Fidelidad** | `panel.html` (Tab Clientes) | Segmentación de clientes (VIP, Frecuente, En riesgo), historial de consumo y programa de puntos/cashback. |
| 📢 **Marketing Gastronómico** | `panel.html` (Tab Marketing) | Códigos de descuento por porcentaje o monto fijo, envío masivo con IA y conexión a Google My Business. |
| 🔌 **Integraciones & API Scopes** | `panel.html` (Tab Integraciones) | Conexión con MCP de IA (ChatGPT, Claude), apps de delivery (PedidosYa, Rappi, Uber Eats) y generación granular de API Keys con 20 scopes oficiales. |
| 💎 **Planes de Suscripción Sokify** | `panel.html` (Checkout) | Flujo completo de upgrade en 3 pasos con cálculo de periodos (Anual/Semestral/Mensual) y cupones de bienvenida. |

---

## ⚡ Despliegue Rápido (1 Clic)

### En Vercel:
```bash
npx vercel
```
O conectando el repositorio directamente desde el dashboard de Vercel. Las rutas `/panel`, `/cocina`, `/kds` y `/menu` ya están configuradas en `vercel.json`.

### En Local:
```bash
npm start
# Abre http://localhost:3000
```
O simplemente haciendo doble clic en cualquiera de los archivos `.html` en cualquier navegador moderno.

---

## 🛠️ Configuración de Firebase
Edita `firebase-config.js` con las credenciales de tu proyecto de Google Firebase para sincronización en tiempo real:
```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

---

## 📄 Licencia
Desarrollado por [UNIVERSO693](https://universo693.com). Todos los derechos reservados.
