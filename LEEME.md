# Plantilla de pizzería premium — menú digital

Nació como una copia rehecha de `pizza-bravo-menu.nicoguanuco18.workers.dev`
(la pizzería real "Bravo" de José C. Paz), pero ahora está armada como
**plantilla**: se puede reskinear para cualquier pizzería tocando un solo
archivo. Sirve tanto para mostrarle a un cliente lo que se le puede vender
como para dejarla lista para un negocio real.

**Sitio 100% estático.** No hay backend, ni build, ni dependencias. Se sube tal cual.

```
pizzeria-bravo/
├── index.html          ← la página entera (sin datos del negocio escritos a mano)
├── css/estilos.css     ← todo el diseño (tokens de color arriba de todo)
├── js/catalogo.js      ← EL NEGOCIO. Nombre, dirección, carta, reseñas, FAQ. Todo.
├── js/app.js           ← motor: carta, configurador, carrito, horarios, SEO, WhatsApp
└── img/                ← 16 fotos de pizzas + 2 del local + la de portada
```

## Para verlo local

```bash
python -m http.server 5173 --directory pizzeria-bravo
```

Y abrir `http://localhost:5173`. (Tiene que ser por servidor, no abriendo el
`index.html` a mano: las rutas son absolutas.)

## Para reusarla con otra pizzería

Todo lo que identifica al negocio vive en el objeto `LOCAL`, arriba de
`js/catalogo.js`: nombre, dirección, teléfono, Instagram, horarios, formas de
pago, delivery. El `index.html` no tiene ni un dato del negocio escrito a
mano — todo lo trae `app.js` desde ahí (título de la pestaña, meta tags,
datos estructurados para Google, el nombre en la barra y el pie, la
dirección en tres lugares distintos, todo). Cambiás `LOCAL` y `MENU`, y es
otra pizzería.

Lo único que index.html sigue \"sabiendo\" del negocio por defecto es el texto
de respaldo dentro de los `data-campo="..."` (para que el archivo se lea bien
si alguien lo abre a mano) — coincide con los datos actuales a propósito, así
no hay parpadeo. Si reskineás, no hace falta tocarlo, pero si querés
prolijidad total podés actualizarlo también.

## Cómo cambiar la carta

- `LOCAL` → identidad del negocio, teléfono, dirección, redes, delivery, SEO.
- `PIZZAS` → las 22. Cada una es producto y a la vez gusto elegible para combinar.
- `MENU` → las categorías (Promos, Pizzas, Empanadas, Milanesas, Hamburguesas,
  Para picar, Bebidas, Postres). El orden de las pastillas lo define `ORDEN`.
- `HORARIOS` → los días. Si `cierra` es menor que `abre`, se entiende que cierra
  pasada la medianoche.
- `RESENAS` → reseñas de clientes (ver advertencia abajo).
- `FAQ` → preguntas frecuentes; se publican también como datos estructurados
  `FAQPage` para que Google las pueda mostrar en los resultados de búsqueda.

**Convención de precios:** `ok: true` = precio confirmado por el local. Sin `ok`,
sale con un punto naranja y la leyenda "precio estimado, se confirma con el
local". Nunca mostrar como firme un precio que el local no pasó.

Un producto sin `img:` no queda con la foto rota: dibuja una ilustración SVG
generada (pizza, empanada, milanesa, hamburguesa, botella, papas, fainá, postre).

### ⚠️ Sobre `RESENAS`

Las tres que trae por defecto son **de ejemplo**, para que la sección se vea
completa en la demo. Antes de entregarle esto a un cliente real hay que:

- reemplazarlas por reseñas reales, copiadas de la ficha de Google del
  negocio, o
- vaciar el array (`const RESENAS = []`) — la sección no desaparece, sigue
  mostrando el puntaje de Google con un link para leerlas ahí.

Nunca dejar reseñas inventadas atribuidas a un negocio real: además de ser
publicidad engañosa, en algunos países es directamente ilegal.

---

## Qué tiene, de punta a punta

**Contenido:** portada, 3 sellos de confianza, 4 promos, carta completa (8
categorías, 52 productos) con buscador y configurador por producto (gustos
combinables, cocción, sabores, extras, cantidades), sección "El local" con
fotos, dirección y horarios, **reseñas de clientes**, **preguntas
frecuentes**, pie de página. Carrito lateral con retiro/delivery, nombre,
forma de pago y envío a WhatsApp.

**SEO:** título, meta description y OpenGraph dinámicos; datos estructurados
`Restaurant` (dirección, teléfono, horarios, puntaje) y `FAQPage`, armados en
vivo desde `catalogo.js` — nunca desincronizados de lo que se ve en pantalla.

**Accesibilidad:** foco atrapado dentro del configurador y del carrito
mientras están abiertos, `Escape` cierra la capa de arriba, anillo de foco
visible en todo lo clickeable, contador de resultados con `aria-live`,
`prefers-reduced-motion` apaga las animaciones. Todos los colores de texto
sobre fondo pasan WCAG AA (4,5:1), en los dos temas.

**Rendimiento:** 3 familias tipográficas (antes eran 9), cero llamadas de red
después de cargar, imágenes con `lazy`/`eager` según si están sobre el pliegue.

---

## Historial de cambios

### v1 — duplicado y rediseño
Copia de la original con diseño nuevo de pizzería de barrio (paleta masa
cruda + carbón de horno + tomate + queso fundido, tipografía Fraunces +
Plus Jakarta Sans + Caveat). Se agregó lo que la original no tenía: Promos,
Bebidas, Postres, Para picar, buscador, estado abierto/cerrado visible,
retiro/delivery + forma de pago en el pedido, costo de envío, link a Maps,
botón flotante de WhatsApp, SEO básico. Se corrigió contraste bajo WCAG AA,
seis fotos que daban 404, y extras que no correspondían al producto (el flan
ofrecía "extra panceta").

### v2 — plantilla reusable + revisión completa
Segunda pasada de arriba a abajo pidiendo cero errores de tipografía y de
código, y nivel "vendible a cualquier pizzería":

- **Se sacó el negocio del HTML.** Nombre, dirección y teléfono estaban
  escritos a mano en 20 lugares distintos (nav, pie, cinta superior, sección
  local, título de pestaña, meta tags, JSON-LD, mensaje de WhatsApp). Ahora
  todo sale de `LOCAL` en `catalogo.js` y se pinta en tiempo de carga —
  incluido el saludo de WhatsApp, que decía literalmente "¡Hola Bravo!" sin
  importar qué negocio fuera.
- **Título, meta tags y datos estructurados dinámicos.** Antes eran texto
  fijo que sólo describía a Bravo; ahora se arman desde `LOCAL` y `HORARIOS`
  en cada carga.
- **Sección de reseñas**, con el puntaje de Google arriba (siempre visible,
  aunque no haya reseñas cargadas) y tarjetas de clientes debajo.
- **Sección de preguntas frecuentes**, en acordeón, publicada también como
  `FAQPage` para Google.
- Un bug de código: `${p.kind === 'pizza' ? '' : ''}` en la carta — una
  rama muerta que no hacía nada, quedó de un cambio anterior.
- Cuatro estilos en línea (`style="..."`) sueltos en el JS se pasaron a
  clases CSS (`.pc`, `.confirmado`, `.alerta`, `.punto-mini`, `.nota-envio`),
  más consistente con el resto del código y más fácil de retocar.
- El namespace de `localStorage` (`bravo:tema`, `bravo:carrito`) también
  estaba atado al nombre: pasó a `menu:` para que dos instancias de la
  plantilla en el mismo dominio no se pisen.
- Revisión completa de ortografía y gramática en las ~230 cadenas de texto
  del sitio (catálogo, textos de interfaz, mensajes de estado): sin errores.

---

## Lo que falta y depende del local

Nada de esto se puede inventar, hay que preguntárselo al dueño real (si esto
se termina usando para la Bravo de José C. Paz) o completarlo con los datos
del cliente al que se le venda:

1. **Reseñas reales** — ver la advertencia de `RESENAS` más arriba.
2. **Confirmar 10 precios de pizza.** Los 12 primeros son los que el local
   pasó; el resto son estimados y se muestran con el punto naranja.
3. **Confirmar precios de bebidas, postres, para picar y promos.** Todos
   están como estimados a propósito.
4. **Confirmar horarios.** De la ficha de Google sólo se sabe que abre
   19:30. El resto es lo habitual del rubro. Cuando estén confirmados, poner
   `HORARIOS.confirmado = true` y desaparecen los puntitos.
5. **Delivery**: si hace, cuánto cobra y cuál es el mínimo. Está puesto
   $2.500 / mínimo $15.000 como estimación.
6. **Seis fotos** de pizzas que faltan (muzzarella, jamón, jamón con
   morrones, jamón a la napolitana, fugazzeta, roquefort). Se ponen en
   `img/` con el nombre del `id` y se agrega `img: 'muzzarella'` al producto.
7. **Pizza al corte por porción.** El local se llama "pizza al corte" pero
   la carta dice que las pizzas van enteras. Si vende porciones, es una
   categoría nueva y probablemente lo más pedido del mediodía.
