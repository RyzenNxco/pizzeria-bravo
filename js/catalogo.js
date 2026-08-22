/* =============================================================================
   CATÁLOGO · Pizzería Bravo — Lavalle 2139, José C. Paz
   -----------------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar la carta. app.js no
   sabe nada del negocio: lee de acá.

   `ok: true`  → precio confirmado por el local.
   `ok` ausente → precio estimado: sale con el punto naranja y la leyenda
                  "se confirma con el local". Nunca inventamos un precio como
                  si fuera firme.
   ============================================================================= */
window.CATALOGO = (() => {

  /* ═══════════════════════════════════════════════════════════════════════════
     LA FICHA DEL NEGOCIO
     Todo lo que identifica al local sale de acá: el nombre que se ve en la
     barra, el título de la pestaña, la dirección, el teléfono, el mensaje de
     WhatsApp y los datos que lee Google. El index.html no tiene ni un dato
     del negocio escrito a mano: para pasar esta página a otra pizzería
     alcanza con cambiar este bloque.
     ═══════════════════════════════════════════════════════════════════════ */
  const LOCAL = {
    nombre:      'Bravo',                       // el de la barra, en mayúsculas
    nombreLargo: 'Pizzería Bravo',              // el de la pestaña y Google
    bajada:      'pizza al corte · desde el barrio',
    rubro:       'Pizza al corte',

    whatsapp:   '5491176404401',                // con código de país, sin + ni espacios
    telVisible: '11 7640 4401',
    instagram:  'pizzabravo.jcp',               // sin la arroba

    calle:     'Lavalle 2139',
    ciudad:    'José C. Paz',
    provincia: 'Buenos Aires',
    pais:      'AR',

    pagos:    ['Efectivo', 'Transferencia', 'Débito'],
    demora:   '30 a 45 min',
    delivery: { hay: true, zona: 'José C. Paz y alrededores', costo: 2500, minimo: 15000, ok: false },

    /* lo que dice la ficha de Google. `ok: true` porque es dato verificable */
    google: { puntaje: '4,9', resenas: 27, ok: true },

    /* para la pestaña y para cuando alguien comparte el link */
    seo: {
      titulo:      'Pizzería Bravo · Pizza al corte en José C. Paz',
      descripcion: 'Pizzería de barrio en Lavalle 2139, José C. Paz. Pizza al horno hasta de 4 gustos, empanadas de carne a cuchillo, milanesas al plato y hamburguesas. Armá el pedido y mandalo por WhatsApp.',
      portada:     '/img/cuatro-gustos.webp'
    }
  };

  /* derivados: no tocar, se arman solos */
  LOCAL.direccion = `${LOCAL.calle}, ${LOCAL.ciudad}`;
  LOCAL.mapa = 'https://www.google.com/maps/search/?api=1&query=' +
               encodeURIComponent(`${LOCAL.calle}, ${LOCAL.ciudad}, ${LOCAL.provincia}`);
  LOCAL.buscarEnGoogle = 'https://www.google.com/search?q=' +
               encodeURIComponent(`${LOCAL.nombreLargo} ${LOCAL.ciudad} reseñas`);

  /* ── reseñas ──────────────────────────────────────────────────────────────
     ⚠️ ESTAS TRES SON DE EJEMPLO — para que la sección se vea completa en la
     demo. Antes de entregarle esto a un cliente real (y sobre todo antes de
     publicarlo para EL negocio real que le da nombre a esta plantilla),
     hay que reemplazarlas por reseñas reales copiadas de su ficha de Google,
     o vaciar el array. Nunca dejar reseñas inventadas atribuidas a un
     negocio real: eso es publicidad engañosa.

       { texto: '...', autor: 'Nombre A.', estrellas: 5 }

     Si el array queda vacío, la sección de reseñas no desaparece: muestra
     igual el puntaje de Google (que sí es un dato verificable) con un botón
     para leerlas ahí. */
  const RESENAS = [
    { texto: 'Pedimos la de cuatro gustos para no pelearnos y quedamos todos contentos. La masa no queda pesada ni aunque comas de más.', autor: 'Marcos R.', estrellas: 5 },
    { texto: 'La acelga con salsa blanca es un golazo, no la esperaba tan buena. Llegó todavía caliente en menos de 40 minutos.', autor: 'Julieta M.', estrellas: 5 },
    { texto: 'Pedimos por WhatsApp y fue clarísimo armar el pedido. La docena de empanadas no sobró ninguna.', autor: 'Sebastián D.', estrellas: 5 }
  ];

  /* ── preguntas frecuentes ─────────────────────────────────────────────────
     Se muestran en la página y además se publican como datos estructurados
     (FAQPage), que es lo que Google usa para mostrar el desplegable en los
     resultados de búsqueda. */
  const FAQ = [
    { q: '¿Hacen delivery?',
      a: 'Sí, en José C. Paz y alrededores. El envío cuesta $2.500 y el pedido mínimo es de $15.000. Si preferís, también podés pasar a retirarlo por el local.' },
    { q: '¿Cuánto tardan?',
      a: 'Entre 30 y 45 minutos. Los viernes y sábados a la noche puede estirarse un poco: te lo confirmamos por WhatsApp cuando nos llega el pedido.' },
    { q: '¿Cómo se paga?',
      a: 'Efectivo, transferencia o débito. Si pagás por transferencia te pasamos el alias cuando confirmamos el pedido.' },
    { q: '¿Puedo pedir la pizza con más de un gusto?',
      a: 'Sí, hasta cuatro gustos en la misma pizza y sin cargo por combinar. Vale el precio del gusto más caro de los que elijas.' },
    { q: '¿Se puede reservar mesa?',
      a: 'No tomamos reservas. El salón es por orden de llegada, y la mayoría de los pedidos son para llevar.' },
    { q: '¿Se puede pedir para un cumpleaños o un evento?',
      a: 'Sí. Para pedidos grandes escribinos por WhatsApp con un día de anticipación así organizamos el horno.' }
  ];

  const MAX_GUSTOS   = 4;      // "armá tu pizza hasta de 4 gustos"
  const CARRITO_HORAS = 24;    // pasado ese tiempo el pedido guardado se descarta

  /* ── pizzas ───────────────────────────────────────────────────────────────
     Las 22 de la pizarra. Cada una es producto y a la vez gusto elegible para
     combinar. Se venden enteras, a un solo precio. */
  const PIZZAS = [
    { id: 'muzzarella',   name: 'Muzzarella',                 price: 15000, ok: true, img: 'muzzarella',       tone: 'muzza',   badge: 'La clásica',        desc: 'Salsa de tomate, muzzarella, aceitunas y orégano.' },
    { id: 'jamon',        name: 'Jamón',                      price: 17000, ok: true, tone: 'jamon',                                desc: 'Muzzarella y jamón cocido.' },
    { id: 'jamon-morron', name: 'Jamón con morrones',         price: 18000, ok: true, img: 'jamon-morron',     tone: 'jymor',   badge: 'La más pedida',     desc: 'Muzzarella, jamón cocido y morrones asados.' },
    { id: 'jamon-napo',   name: 'Jamón a la napolitana',      price: 18000, ok: true, tone: 'napo',                                 desc: 'Jamón, rodajas de tomate, ajo y orégano.' },
    { id: 'napolitana',   name: 'Napolitana',                 price: 17000, ok: true, img: 'napolitana',       tone: 'napo',                                 desc: 'Muzzarella, rodajas de tomate, ajo y perejil.' },
    { id: 'fugazzeta',    name: 'Fugazzeta',                  price: 17000, ok: true, tone: 'fugaz',                                desc: 'Doble muzzarella, mucha cebolla y orégano.' },
    { id: 'provolone',    name: 'Provolone',                  price: 17000, ok: true, img: 'provolone',        tone: 'quesos',                               desc: 'Provolone fundido y orégano.' },
    { id: 'roquefort',    name: 'Roquefort',                  price: 17000, ok: true, tone: 'roque',                                desc: 'Muzzarella y roquefort, con aceitunas.' },
    /* Sumada a partir de fotos reales del local: se ve seguido combinada con
       roquefort o morrones en pedidos de dos gustos. Precio estimado — el
       local todavía no lo pasó. */
    { id: 'jamon-crudo',  name: 'Jamón crudo',                price: 19000,           tone: 'jamon',                                desc: 'Muzzarella, jamón crudo y aceitunas.' },
    { id: 'choclo',       name: 'Choclo',                     price: 17000, ok: true, img: 'choclo',           tone: 'choclo',                               desc: 'Muzzarella, choclo y salsa blanca.' },
    { id: 'calabresa',    name: 'Calabresa',                  price: 18000, ok: true, img: 'calabresa',        tone: 'bravo',                                desc: 'Muzzarella y longaniza calabresa.' },
    { id: 'bondiola',     name: 'Bondiola',                   price: 18000, ok: true, img: 'bondiola',         tone: 'panceta',                              desc: 'Muzzarella y bondiola desmenuzada.' },
    { id: 'cuatro-q',     name: 'Cuatro quesos',              price: 18000, ok: true, img: 'cuatro-q',         tone: 'quesos',                               desc: 'Muzzarella, provolone, roquefort y parmesano.' },
    { id: 'jamon-provo',  name: 'Jamón con provolone',        price: 18000,           img: 'jamon-provo',      tone: 'quesos',                               desc: 'Jamón cocido y provolone fundido arriba.' },
    { id: 'jamon-anana',  name: 'Jamón con ananá',            price: 18000,           img: 'jamon-anana',      tone: 'jamon',                                desc: 'Jamón cocido y ananá. La discusión eterna del barrio.' },
    { id: 'acelga',       name: 'Acelga con salsa blanca',    price: 17000,           img: 'acelga',           tone: 'verde',   badge: 'La que recomiendan', desc: 'Acelga salteada y salsa blanca. La más elogiada en las reseñas.' },
    { id: 'pto',          name: 'Panceta, tomate y omelette', price: 18000,           img: 'pto',              tone: 'panceta',                              desc: 'Panceta crocante, tomate y un omelette arriba de todo.' },
    { id: 'panceta',      name: 'Panceta',                    price: 18000,           img: 'panceta',          tone: 'panceta',                              desc: 'Muzzarella y panceta bien crocante.' },
    { id: 'salchicha',    name: 'Salchicha',                  price: 17000,           img: 'salchicha',        tone: 'panceta',                              desc: 'Muzzarella y rodajas de salchicha.' },
    { id: 'champinon',    name: 'Champiñón',                  price: 17000,           img: 'champinon',        tone: 'verde',                                desc: 'Muzzarella y champiñones salteados.' },
    { id: 'cochina',      name: 'Cochina',                    price: 18000,           img: 'cochina',          tone: 'bravo',   badge: 'De la casa',        desc: 'La que lleva de todo un poco. Preguntá qué le pusimos hoy.' },
    { id: 'anchoas',      name: 'Anchoas',                    price: 18000,           img: 'anchoas',          tone: 'napo',                                 desc: 'Muzzarella y filetes de anchoa.' },
    { id: 'rucula-parm',  name: 'Rúcula y parmesano',         price: 18000,           img: 'rucula-parmesano', tone: 'crudo',                                desc: 'Muzzarella, rúcula fresca, tomate y láminas de parmesano.' }
  ];

  /* ── empanadas ───────────────────────────────────────────────────────── */
  const SABORES_EMP = [
    'Carne a cuchillo', 'Pollo', 'Bondiola y barbacoa', 'Jamón y queso',
    'Choclo, cebolla y queso', 'Acelga y salsa blanca', 'Cheeseburger'
  ];

  /* ── el menú, por categorías ─────────────────────────────────────────── */
  const MENU = {

    'Promos': [
      { id: 'promo-barrio', name: 'Promo Barrio', price: 30000, art: 'promo', kind: 'promo', badge: 'Ahorrás $2.500', destacada: true,
        incluye: ['1 pizza muzzarella', '½ docena de empanadas', 'Gaseosa 1,5 L'],
        desc: 'La de todos los martes: muzzarella, media docena de empanadas y una gaseosa grande.' },
      { id: 'promo-familia', name: 'Promo Familia', price: 33000, art: 'promo', kind: 'promo', badge: 'Para 4', destacada: true,
        incluye: ['2 pizzas a elección', 'Gaseosa 1,5 L'],
        desc: 'Dos pizzas de la carta —armalas con los gustos que quieras— y una gaseosa de litro y medio.' },
      { id: 'promo-mila', name: 'Noche de Milanesa', price: 42000, art: 'promo', kind: 'promo',
        incluye: ['2 milanesas napolitanas', 'Papas para compartir', 'Gaseosa 1,5 L'],
        desc: 'Dos napolitanas al plato con papas y una gaseosa. Sale de jueves a domingo.' },
      { id: 'promo-amigos', name: 'Promo Amigos', price: 33000, art: 'promo', kind: 'promo',
        incluye: ['Docena de empanadas surtidas', '2 cervezas de litro'],
        desc: 'Docena surtida a elección y dos litros bien fríos. Para caer de sorpresa.' }
    ],

    'Pizzas': PIZZAS.map(p => ({ ...p, kind: 'pizza', art: 'pizza' })),

    'Empanadas': [
      { id: 'emp-docena', name: 'Docena surtida',       price: 27000, art: 'docena', kind: 'docena', cant: 12, badge: 'Combo',
        desc: 'Doce empanadas a elección entre los siete sabores de la casa.' },
      { id: 'emp-media',  name: 'Media docena surtida', price: 14000, art: 'docena', kind: 'docena', cant: 6,
        desc: 'Seis empanadas a elección entre los siete sabores de la casa.' },
      { id: 'emp-suelta', name: 'Empanada suelta',      price: 2500,  art: 'empanada', kind: 'empanada',
        desc: 'Una empanada del sabor que quieras, al horno.' }
    ],

    'Milanesas': [
      { id: 'mila-napo',    name: 'Milanesa napolitana',       price: 20000, art: 'mila', kind: 'plato', badge: 'Al plato',
        desc: 'Con salsa, muzzarella y orégano. Va con papas.' },
      { id: 'mila-caballo', name: 'Milanesa a caballo',        price: 21000, art: 'mila', kind: 'plato', badge: 'Al plato',
        desc: 'Con dos huevos fritos arriba. Va con papas.' },
      { id: 'mila-sola',    name: 'Milanesa sola',             price: 17000, art: 'mila', kind: 'plato', badge: 'Al plato',
        desc: 'La milanesa sola, bien crocante. Va con papas.' },
      { id: 'mila-fugaz',   name: 'Milanesa fugazzeta',        price: 20000, art: 'mila', kind: 'plato', badge: 'Al plato',
        desc: 'Con muzzarella y cebolla gratinada. Va con papas.' },
      { id: 'mila-4q',      name: 'Milanesa cuatro quesos',    price: 22000, art: 'mila', kind: 'plato', badge: 'Al plato',
        desc: 'Con los cuatro quesos fundidos. Va con papas.' },
      { id: 'mila-cheddar', name: 'Milanesa cheddar y bacon',  price: 23000, art: 'mila', kind: 'plato', badge: 'Al plato',
        desc: 'Con cheddar derretido y panceta crocante. Va con papas.' },
      { id: 'sand-jyq',     name: 'Sándwich de milanesa J&Q',  price: 13000, art: 'sandwich', kind: 'simple', badge: 'Sándwich',
        desc: 'En pan casero, con jamón y queso.' },
      { id: 'sand-tyl',     name: 'Sándwich de milanesa T&L',  price: 12000, art: 'sandwich', kind: 'simple', badge: 'Sándwich',
        desc: 'En pan casero, con tomate y lechuga.' },
      { id: 'sand-completo',name: 'Sándwich completo',         price: 15000, art: 'sandwich', kind: 'simple', badge: 'Sándwich',
        desc: 'Jamón, queso, tomate y lechuga. El que pide todo el mundo.' }
    ],

    'Hamburguesas': [
      { id: 'ham-jyq',      name: 'Hamburguesa jamón y queso',    price: 12000, art: 'burger', kind: 'simple',
        desc: 'Medallón a la plancha con jamón y queso.' },
      { id: 'ham-tyl',      name: 'Hamburguesa tomate y lechuga', price: 11000, art: 'burger', kind: 'simple',
        desc: 'Medallón a la plancha con tomate y lechuga.' },
      { id: 'ham-completa', name: 'Hamburguesa completa',         price: 14000, art: 'burger', kind: 'simple', badge: 'La más pedida',
        desc: 'Jamón, queso, lechuga y tomate.' },
      { id: 'ham-cheddar',  name: 'Hamburguesa cheddar y bacon',  price: 15000, art: 'burger', kind: 'simple',
        desc: 'Doble cheddar fundido y panceta crocante.' }
    ],

    'Para picar': [
      { id: 'faina',        name: 'Fainá',                 price: 3500, art: 'faina', kind: 'picar', badge: 'Clásico',
        desc: 'La porción de fainá para poner arriba de la muzza. Como corresponde.' },
      { id: 'papas',        name: 'Papas fritas',          price: 8000, art: 'papas', kind: 'simple',
        desc: 'Porción grande, para compartir entre dos.' },
      { id: 'papas-cheddar',name: 'Papas cheddar y bacon', price: 11000, art: 'papas', kind: 'simple', badge: 'De la casa',
        desc: 'Con cheddar fundido y panceta crocante por arriba.' },
      { id: 'provoleta',    name: 'Provoleta al horno',    price: 9000, art: 'provoleta', kind: 'picar',
        desc: 'Provolone al horno con orégano y aceite de oliva.' }
    ],

    'Bebidas': [
      { id: 'gaseosa-15',  name: 'Gaseosa 1,5 L',        price: 3500, art: 'botella', kind: 'bebida', badge: 'Para la mesa',
        opciones: ['Coca-Cola', 'Coca-Cola Zero', 'Sprite', 'Fanta', 'Pepsi'],
        desc: 'La grande, para toda la mesa. Elegí cuál.' },
      { id: 'gaseosa-500', name: 'Gaseosa 500 ml',       price: 2200, art: 'botella', kind: 'bebida',
        opciones: ['Coca-Cola', 'Coca-Cola Zero', 'Sprite', 'Fanta', 'Pepsi'],
        desc: 'Botellita individual, bien fría.' },
      { id: 'agua',        name: 'Agua 500 ml',          price: 1800, art: 'botella', kind: 'bebida',
        opciones: ['Sin gas', 'Con gas'],
        desc: 'Mineral, con o sin gas.' },
      { id: 'cerveza-473', name: 'Cerveza lata 473 ml',  price: 3800, art: 'lata', kind: 'bebida',
        opciones: ['Quilmes', 'Brahma', 'Stella Artois'],
        desc: 'La lata fría de siempre.' },
      { id: 'cerveza-litro', name: 'Cerveza 1 L',        price: 5500, art: 'botella', kind: 'bebida', badge: 'Para compartir',
        opciones: ['Quilmes', 'Brahma'],
        desc: 'El litro clásico para acompañar la pizza.' },
      { id: 'vino-casa',   name: 'Vino de la casa 750 ml', price: 8000, art: 'botella', kind: 'bebida',
        opciones: ['Malbec', 'Cabernet'],
        desc: 'Tinto simple y honesto, de los que van con muzzarella.' }
    ],

    'Postres': [
      { id: 'flan',      name: 'Flan casero',        price: 5000, art: 'postre', kind: 'postre', badge: 'Casero',
        desc: 'Flan de la casa con dulce de leche y crema.' },
      { id: 'tiramisu',  name: 'Tiramisú',           price: 6500, art: 'postre', kind: 'postre',
        desc: 'Porción individual, bien fría.' },
      { id: 'helado',    name: 'Helado ¼ kg',        price: 7000, art: 'postre', kind: 'postre',
        opciones: ['Dulce de leche', 'Chocolate', 'Frutilla', 'Sambayón', 'Limón'],
        desc: 'Cuarto kilo, hasta dos gustos a elección.' },
      { id: 'postre-vigilante', name: 'Queso y dulce', price: 4500, art: 'postre', kind: 'postre',
        desc: 'El vigilante de toda la vida: queso fresco y dulce de membrillo.' }
    ]
  };

  /* orden en que aparecen las pastillas de categoría */
  const ORDEN = ['Pizzas', 'Empanadas', 'Milanesas', 'Hamburguesas', 'Para picar', 'Bebidas', 'Postres'];

  const COCCIONES = [
    { id: 'punto', label: 'A punto' },
    { id: 'bien',  label: 'Bien cocida' }
  ];

  /* ── extras, según lo que estés pidiendo ─────────────────────────────── */
  const EXTRAS = {
    pizza:  [
      { label: 'Extra muzzarella', price: 2000 },
      { label: 'Doble aceitunas',  price: 1000 },
      { label: 'Huevo frito',      price: 1500 },
      { label: 'Panceta',          price: 2500 },
      { label: 'Porción de fainá', price: 3500 }
    ],
    plato:  [
      { label: 'Papas extra',   price: 5000 },
      { label: 'Huevo frito',   price: 1500 },
      { label: 'Cheddar extra', price: 2000 },
      { label: 'Panceta',       price: 2500 }
    ],
    simple: [
      { label: 'Cheddar extra', price: 2000 },
      { label: 'Panceta',       price: 2500 },
      { label: 'Huevo frito',   price: 1500 }
    ],
    postre: [
      { label: 'Crema extra',          price: 1500 },
      { label: 'Dulce de leche extra', price: 1500 }
    ],
    picar:  [],
    promo:  [],
    bebida: []
  };
  const extrasFor = kind => EXTRAS[kind] || EXTRAS.simple;

  /* ── horarios ─────────────────────────────────────────────────────────────
     `confirmado: false` los muestra con el mismo punto naranja que los precios
     estimados: de la ficha de Google solo sabemos que abre 19:30; el resto es
     lo habitual del rubro y lo tiene que confirmar el local.
     Si `cierra` <= `abre`, se entiende que cierra pasada la medianoche. */
  const HORARIOS = {
    confirmado: false,
    dias: [
      { id: 'lun', nombre: 'Lunes',     cerrado: true },
      { id: 'mar', nombre: 'Martes',    abre: '19:30', cierra: '00:30' },
      { id: 'mie', nombre: 'Miércoles', abre: '19:30', cierra: '00:30' },
      { id: 'jue', nombre: 'Jueves',    abre: '19:30', cierra: '00:30' },
      { id: 'vie', nombre: 'Viernes',   abre: '19:30', cierra: '01:30' },
      { id: 'sab', nombre: 'Sábado',    abre: '19:30', cierra: '01:30' },
      { id: 'dom', nombre: 'Domingo',   abre: '19:30', cierra: '00:00' }
    ]
  };

  return { LOCAL, RESENAS, FAQ, MAX_GUSTOS, CARRITO_HORAS, PIZZAS, SABORES_EMP, MENU, ORDEN, COCCIONES, EXTRAS, extrasFor, HORARIOS };
})();
