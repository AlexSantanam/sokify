/**
 * UNIVERSO693 · Plantilla Estándar: Starter Restaurante QR (Zokify)
 * Archivo de configuración central. Para personalizar un nuevo cliente,
 * solo debes editar este archivo sin tocar el código fuente.
 */

window.RESTAURANTE_CONFIG = {
  // Identificador único del local en la base de datos (sin espacios ni tildes).
  // Cambialo por cliente para que cada restaurante tenga su propia carta y pedidos.
  restaurantId: "la-brasa-y-lena",

  // Información de la Marca
  nombre: "La Brasa & Leña",
  slogan: "Fuego & Tradición Porteña",
  rubro: "Restaurante & Parrilladas",
  direccion: "Av. San Martín 693, Viña del Mar",
  horario: "Mar a Dom · 12:30 a 23:30 hrs",

  // Datos Comerciales y Despacho
  whatsapp: "56990387414", // Sin el +, con código de país
  telefonoContacto: "+56 9 9038 7414",
  instagram: "@labrasaylena",
  moneda: "CLP",
  propinaSugeridaPct: 10, // Propina voluntaria chilena estándar 10%
  mesaDefault: "Mesa 07 · Terraza",
  totalMesasImprimibles: 20,

  // Información de Despacho mostrada al cliente (estilo panel "Información" de Zokify)
  tiempoEntregaMin: 25,
  tiempoEntregaMax: 50,
  pedidoMinimoDelivery: 6000,
  envioGratis: false,

  // WiFi del local, mostrado en bienvenida.html (déjalo vacío "" para ocultar esa tarjeta)
  wifiNombre: "LaBrasaYLena_Clientes",
  wifiClave: "parrilla2026",

  // Métodos de Pago Permitidos
  metodosPago: [
    { id: "tarjeta", nombre: "💳 Tarjeta Débito/Crédito (Llevar POS a la mesa)", requiereVuelto: false },
    { id: "efectivo", nombre: "💵 Efectivo (Pago en caja / garzón)", requiereVuelto: true },
    { id: "transferencia", nombre: "📱 Transferencia Electrónica Directa", requiereVuelto: false }
  ],

  // Identidad Visual
  colores: {
    primario: "#C85A32",       // Color brasas / acento
    primarioHover: "#B04B25",
    fondo: "#181310",          // Darkwood
    tarjeta: "#221C18",        // Warmcard
    dorado: "#E9C46A"          // Detalles y precios
  },

  // Categorías de la Carta
  categorias: [
    { id: "todos", nombre: "🔥 Toda la Carta", icono: "🔥" },
    { id: "cortes", nombre: "🥩 Cortes a la Leña", icono: "🥩" },
    { id: "hamburguesas", nombre: "🍔 Burgers Ahumadas", icono: "🍔" },
    { id: "para_compartir", nombre: "🍟 Para Compartir", icono: "🍟" },
    { id: "tragos", nombre: "🍸 Coctelería & Schops", icono: "🍸" },
    { id: "postres", nombre: "🍨 Postres Porteños", icono: "🍨" }
  ],

  // Catálogo de Platos con Modificadores estilo Zokify
  platos: [
    {
      id: 1,
      cat: "cortes",
      name: "Bife de Chorizo Angus (400g)",
      desc: "Corte grueso de angus marmoleado sellado a fuego vivo con sal de Cáhuil y mantequilla de romero.",
      price: 18900,
      badge: "Corte Estrella",
      img: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=700&q=80",
      modificadores: [
        {
          id: "coccion",
          titulo: "Punto de Cocción",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "A la Inglesa (Vuelta y vuelta - centro rojo)", precio: 0 },
            { nombre: "Término Medio (Centro rosado y jugoso)", precio: 0, default: true },
            { nombre: "Tres Cuartos (Poco rosado)", precio: 0 },
            { nombre: "Bien Cocido", precio: 0 }
          ]
        },
        {
          id: "guarnicion",
          titulo: "Acompañamiento Incluido",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Papas Rústicas al Romero", precio: 0, default: true },
            { nombre: "Ensalada Mixta Chilena (Tomate, cebolla, cilantro)", precio: 0 },
            { nombre: "Puré Rústico al Merkén Ahumado", precio: 0 },
            { nombre: "Verduras Grilladas a la Parrilla", precio: 0 }
          ]
        },
        {
          id: "agregados",
          titulo: "¿Deseas agregar extras?",
          requerido: false,
          tipo: "checkbox",
          opciones: [
            { nombre: "Chimichurri Casero Porteño", precio: 1000 },
            { nombre: "Huevos de Campo Fritos (A lo Pobre)", precio: 1500 },
            { nombre: "Salsa de Queso Chanco Fundido", precio: 1800 }
          ]
        }
      ]
    },
    {
      id: 2,
      cat: "cortes",
      name: "Entraña Fina Angus (350g)",
      desc: "Tierna, jugosa y de cocción rápida, acompañada con chimichurri casero ahumado en brasas de espino.",
      price: 19900,
      badge: "Favorito de la Casa",
      img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80",
      modificadores: [
        {
          id: "coccion",
          titulo: "Punto de Cocción",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Término Medio (Recomendado)", precio: 0, default: true },
            { nombre: "Tres Cuartos", precio: 0 },
            { nombre: "Bien Cocido", precio: 0 }
          ]
        },
        {
          id: "guarnicion",
          titulo: "Acompañamiento",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Papas Rústicas al Romero", precio: 0, default: true },
            { nombre: "Puré al Merkén", precio: 0 },
            { nombre: "Ensalada Verde de la Estación", precio: 0 }
          ]
        },
        {
          id: "agregados",
          titulo: "Salsas y Extras",
          requerido: false,
          tipo: "checkbox",
          opciones: [
            { nombre: "Porción de Cebolla Caramelizada", precio: 1200 },
            { nombre: "Pote Extra de Chimichurri", precio: 1000 }
          ]
        }
      ]
    },
    {
      id: 3,
      cat: "hamburguesas",
      name: "Burger Doble Smoked Bacon",
      desc: "200g blend vacuno artesanal, doble queso cheddar fundido, panceta laqueada en miel y salsa BBQ casera en pan brioche tostado.",
      price: 10900,
      badge: "Incluye Papas",
      img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
      modificadores: [
        {
          id: "papas",
          titulo: "Tipo de Papas Fritas",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Papas Fritas Tradicionales", precio: 0, default: true },
            { nombre: "Papas Rústicas en Gajos con Piel", precio: 0 },
            { nombre: "Cambiar por Aros de Cebolla Crocantes", precio: 1000 }
          ]
        },
        {
          id: "extras_burger",
          titulo: "Personaliza tu Burger",
          requerido: false,
          tipo: "checkbox",
          opciones: [
            { nombre: "Extra Queso Cheddar Fundido", precio: 1500 },
            { nombre: "Doble Porción de Tocino Crocante", precio: 1800 },
            { nombre: "Pepinillos Agridulces Extra", precio: 800 },
            { nombre: "Salsa Secreta Ahumada de la Casa", precio: 900 }
          ]
        }
      ]
    },
    {
      id: 4,
      cat: "para_compartir",
      name: "Tabla Porteña de Picoteo Parrillero",
      desc: "Papas rústicas con salsa de queso chanco derretido, mini empanadas de pino al horno, prietas grilladas y chorizo parrillero artesanal.",
      price: 13900,
      badge: "Para 2-3 Personas",
      img: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=700&q=80",
      modificadores: [
        {
          id: "salsa_tabla",
          titulo: "Salsa para Acompañar",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Mayo Ajo Casera + Pebre Porteño", precio: 0, default: true },
            { nombre: "Salsa BBQ Ahumada + Mostaza Antigua", precio: 0 }
          ]
        },
        {
          id: "agregados_tabla",
          titulo: "Extras para la Tabla",
          requerido: false,
          tipo: "checkbox",
          opciones: [
            { nombre: "Porción de Tostadas al Ajo (6 un)", precio: 1500 },
            { nombre: "Extra Queso Chanco Fundido sobre papas", precio: 2000 }
          ]
        }
      ]
    },
    {
      id: 5,
      cat: "para_compartir",
      name: "Provoleta a la Parrilla con Tomates Asados",
      desc: "Queso provolone hilado en paila de greda con orégano fresco, oliva extra virgen y tostadas crocantes con mantequilla de ajo.",
      price: 8900,
      badge: "Vegetariano",
      img: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=700&q=80",
      modificadores: [
        {
          id: "picante",
          titulo: "Nivel de Picante",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Sin picante (Suave)", precio: 0, default: true },
            { nombre: "Con Ají Cacho de Cabra Ahumado", precio: 0 }
          ]
        }
      ]
    },
    {
      id: 6,
      cat: "tragos",
      name: "Pisco Sour Tabernero Huasco",
      desc: "Pisco doble destilado 40° del Valle del Huasco, jugo de limón sutil de Pica y jarabe de goma artesanal con amargo de angostura.",
      price: 6500,
      badge: "Coctel Clásico",
      img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=700&q=80",
      modificadores: [
        {
          id: "tamano_sour",
          titulo: "Tamaño",
          requerido: true,
          tipo: "radio",
          opciones: [
            { nombre: "Copa Tradicional (200cc)", precio: 0, default: true },
            { nombre: "Catedral Doble (350cc)", precio: 3000 }
          ]
        }
      ]
    },
    {
      id: 7,
      cat: "tragos",
      name: "Schop Cerveza Artesanal IPA (500cc)",
      desc: "Cervecería de la V Región, aromas cítricos a maracuyá y amargor balanceado servida en vaso helado.",
      price: 4900,
      badge: "Schop del Día",
      img: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=700&q=80",
      modificadores: []
    },
    {
      id: 8,
      cat: "postres",
      name: "Volcán de Manjar Casero con Helado de Vainilla",
      desc: "Bizcocho tibio de chocolate relleno con manjar de campo líquido, acompañado de helado artesanal de vainilla y nueces picadas.",
      price: 5500,
      badge: "Recomendado",
      img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
      modificadores: []
    }
  ]
};
