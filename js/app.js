/* =============================================================================
   Motor del menú digital — plantilla de pizzería
   Sin backend, sin dependencias: todo se lee de catalogo.js y vive en el
   navegador. El pedido se guarda en localStorage y sale por WhatsApp. Esto es
   genérico a propósito: para reusar la plantilla con otro negocio, lo único
   que hay que tocar es catalogo.js.
   ============================================================================= */
(() => {
'use strict';

const C = window.CATALOGO;
const { LOCAL, RESENAS, FAQ, MAX_GUSTOS, CARRITO_HORAS, PIZZAS, SABORES_EMP, MENU, ORDEN, COCCIONES, extrasFor, HORARIOS } = C;

/* ── utilidades ───────────────────────────────────────────────────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const plata = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const money = n => plata.format(n).replace(/\s/g, ' ');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** el puntito naranja de "precio a confirmar" */
const pc = p => p.ok ? '' : '<span class="pc" title="Precio estimado, se confirma con el local">•</span>';

/* saca tildes para que "champinon" encuentre "Champiñón" */
const plano = s => String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const guardar = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem('menu:' + k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('menu:' + k, JSON.stringify(v)); } catch {} }
};

/* lista plana de todo el catálogo, para buscar y para los fallbacks de foto */
const TODOS = Object.entries(MENU).flatMap(([cat, items]) => items.map(p => ({ ...p, cat })));

/* ── íconos ───────────────────────────────────────────────────────────────── */
const I = {
  mas:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  equis:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  tilde:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>',
  bolsa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  wa:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m4.52 12c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.88 2.35 1 2.51c.12.17 1.72 2.64 4.18 3.7.58.25 1.04.4 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29"/></svg>',
  sol:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  luna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  fuego:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1.6 2.7.5 4.3-1.1 5.9S9 11.3 10.6 13.4"/><path d="M6 13a6 6 0 0 0 12 0c0-2-1-3.6-2.4-5 .3 2-1 3.2-2.3 3.6C14 9 12.6 6.6 10 5c.4 3.3-4 4.6-4 8z"/></svg>'
};

/* ── ilustraciones de marca (para lo que no tiene foto) ───────────────────── */
const TONOS = {
  muzza:   { queso: '#F2C664', trozos: ['#C0392B', '#2F6B3D', '#F2C664'] },
  jamon:   { queso: '#F3CB74', trozos: ['#E8918C', '#E8918C', '#F3CB74'] },
  jymor:   { queso: '#F3CB74', trozos: ['#E8918C', '#D4462C', '#F0A93A'] },
  napo:    { queso: '#EFC469', trozos: ['#CE3A22', '#2F6B3D', '#CE3A22'] },
  fugaz:   { queso: '#F6DA9B', trozos: ['#EAD9BE', '#D9C3A0', '#F6DA9B'] },
  quesos:  { queso: '#F0C25F', trozos: ['#E8B44A', '#F7E3B0', '#D9A03C'] },
  roque:   { queso: '#F1D9A8', trozos: ['#98A6B5', '#5E6B7A', '#F1D9A8'] },
  choclo:  { queso: '#F5D77E', trozos: ['#F2C230', '#F7E9C6', '#F2C230'] },
  bravo:   { queso: '#EEBB5A', trozos: ['#A32B22', '#C0392B', '#7E2018'] },
  panceta: { queso: '#F0C468', trozos: ['#C4553C', '#8C3423', '#E9B085'] },
  verde:   { queso: '#EFC96F', trozos: ['#3B7A4A', '#2C5C39', '#6FA36B'] },
  crudo:   { queso: '#EEC46A', trozos: ['#3F7F4C', '#CE3A22', '#F5E7C0'] }
};

/* pseudo-aleatorio determinista: la cubierta no baila entre renders */
function semilla(txt) {
  let s = 0;
  for (const ch of String(txt)) s = (s * 31 + ch.charCodeAt(0)) % 100000;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

function svgPizza(tono, id) {
  const t = TONOS[tono] || TONOS.muzza;
  const r = semilla(id);
  let trozos = '';
  for (let i = 0; i < 17; i++) {
    const a = r() * Math.PI * 2, rad = 13 + r() * 47, s = 4.3 + r() * 3.6;
    trozos += `<ellipse cx="${(100 + Math.cos(a) * rad).toFixed(1)}" cy="${(100 + Math.sin(a) * rad).toFixed(1)}" rx="${s.toFixed(1)}" ry="${(s * .8).toFixed(1)}" fill="${t.trozos[i % t.trozos.length]}" opacity=".92"/>`;
  }
  let burbujas = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * .32;
    burbujas += `<circle cx="${(100 + Math.cos(a) * 80).toFixed(1)}" cy="${(100 + Math.sin(a) * 80).toFixed(1)}" r="${(2.3 + r() * 2.7).toFixed(1)}" fill="#7A3F17" opacity=".36"/>`;
  }
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <defs>
      <radialGradient id="ma-${id}" cx="42%" cy="34%"><stop offset="0" stop-color="#F0BC79"/><stop offset="1" stop-color="#C17C3D"/></radialGradient>
      <radialGradient id="qu-${id}" cx="40%" cy="34%"><stop offset="0" stop-color="${t.queso}"/><stop offset="1" stop-color="#DDA243"/></radialGradient>
    </defs>
    <circle cx="100" cy="104" r="90" fill="#000" opacity=".13"/>
    <circle cx="100" cy="100" r="90" fill="url(#ma-${id})"/>
    ${burbujas}
    <circle cx="100" cy="100" r="70" fill="#B93724"/>
    <circle cx="100" cy="100" r="67" fill="url(#qu-${id})"/>
    ${trozos}
    <g stroke="#B5762F" stroke-width="1.5" opacity=".26"><path d="M100 33v134"/><path d="M33 100h134"/><path d="m53 53 94 94"/><path d="M147 53 53 147"/></g>
  </svg>`;
}

function svgEmpanada(id, n = 1) {
  const una = (dx, dy, rot, sc) => `<g transform="translate(${dx} ${dy}) rotate(${rot} 100 100) scale(${sc})" transform-origin="100 100">
      <path d="M40 118a60 46 0 0 1 120 0z" fill="#000" opacity=".12" transform="translate(0 5)"/>
      <path d="M40 118a60 46 0 0 1 120 0z" fill="#E8B667"/>
      <path d="M46 118a54 40 0 0 1 108 0" fill="none" stroke="#D8A455" stroke-width="1.6" opacity=".8"/>
      <path d="M44 118c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0 8-4 12 0 8 4 12 0 8-4 12 0 8 4 12 0" fill="none" stroke="#B87F31" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="86" cy="98" rx="5" ry="3.4" fill="#C98A3A" opacity=".55"/>
      <ellipse cx="112" cy="104" rx="6" ry="3.8" fill="#C98A3A" opacity=".45"/>
    </g>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${
    n === 1 ? una(0, 6, 0, 1.05) : una(-38, 16, -14, .78) + una(38, 16, 14, .78) + una(0, -10, 0, .94)}</svg>`;
}

function svgMila(salsa) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="152" rx="72" ry="12" fill="#000" opacity=".13"/>
    <path d="M36 104c-4-26 16-46 44-48 30-2 56 8 72 26 12 14 10 32-6 42-22 14-56 20-82 12-16-5-26-16-28-32z" fill="#C07C3D"/>
    <path d="M40 102c-3-22 15-40 40-42 27-2 51 7 66 23 10 12 8 27-6 36-20 12-51 18-75 11-14-4-23-15-25-28z" fill="#E0A45B"/>
    <g fill="#B8792F" opacity=".5"><circle cx="70" cy="86" r="3"/><circle cx="96" cy="76" r="2.6"/><circle cx="124" cy="88" r="3.2"/><circle cx="82" cy="112" r="2.8"/><circle cx="112" cy="112" r="3"/><circle cx="142" cy="100" r="2.6"/></g>
    ${salsa ? `<path d="M60 92c14-12 34-16 52-10 14 5 24 14 26 24-16 10-40 14-60 10-14-3-22-12-18-24z" fill="#BE3624" opacity=".92"/>
    <path d="M66 96c12-9 30-12 45-7 11 4 19 11 21 19-13 8-33 11-49 8-11-2-19-10-17-20z" fill="#F1D08A"/>
    <g fill="#2F5D3A" opacity=".8"><circle cx="86" cy="104" r="2.4"/><circle cx="108" cy="98" r="2.2"/><circle cx="120" cy="110" r="2.4"/></g>` : ''}
  </svg>`;
}

function svgSandwich() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="162" rx="64" ry="10" fill="#000" opacity=".12"/>
    <path d="M34 104c0-26 30-40 66-40s66 14 66 40z" fill="#E0A45B"/>
    <path d="M40 100c2-20 28-32 60-32s58 12 60 32z" fill="#EDBB74"/>
    <path d="M32 106h136a5 5 0 0 1 0 10H32a5 5 0 0 1 0-10z" fill="#3E7A46"/>
    <path d="M36 116h128v10H36z" fill="#E8B4A6"/>
    <path d="M34 126h132a6 6 0 0 1 0 12H34a6 6 0 0 1 0-12z" fill="#C08640"/>
    <path d="M38 138h124c0 12-16 20-62 20s-62-8-62-20z" fill="#E0A45B"/>
  </svg>`;
}

function svgBurger() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="166" rx="62" ry="10" fill="#000" opacity=".13"/>
    <path d="M40 92c0-30 27-48 60-48s60 18 60 48z" fill="#E0A45B"/>
    <path d="M46 88c2-24 25-38 54-38s52 14 54 38z" fill="#EDBB74"/>
    <g fill="#FBEAC8" opacity=".85"><circle cx="76" cy="70" r="3"/><circle cx="100" cy="62" r="3"/><circle cx="124" cy="70" r="3"/><circle cx="88" cy="82" r="2.6"/><circle cx="112" cy="82" r="2.6"/></g>
    <path d="M38 94h124a6 6 0 0 1 0 12H38a6 6 0 0 1 0-12z" fill="#3E7A46"/>
    <path d="M42 106h116v14H42z" fill="#F2B233"/>
    <path d="M40 118h120a10 10 0 0 1 0 20H40a10 10 0 0 1 0-20z" fill="#7A4326"/>
    <path d="M44 140h112c0 12-14 20-56 20s-56-8-56-20z" fill="#E0A45B"/>
  </svg>`;
}

function svgBotella(lata) {
  if (lata) return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="176" rx="40" ry="8" fill="#000" opacity=".13"/>
    <rect x="66" y="42" width="68" height="130" rx="12" fill="#C0392B"/>
    <rect x="66" y="42" width="26" height="130" rx="12" fill="#FFF" opacity=".16"/>
    <rect x="62" y="36" width="76" height="14" rx="7" fill="#B9BFC6"/>
    <rect x="66" y="88" width="68" height="34" fill="#F2E4C6" opacity=".9"/>
    <circle cx="100" cy="105" r="11" fill="#C0392B"/>
  </svg>`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="180" rx="38" ry="8" fill="#000" opacity=".13"/>
    <path d="M84 24h32v26c0 8 22 20 22 44v78a12 12 0 0 1-12 12H74a12 12 0 0 1-12-12V94c0-24 22-36 22-44z" fill="#7A4326"/>
    <path d="M84 24h14v26c0 10-22 20-22 44v82h-14V94c0-24 22-34 22-44z" fill="#FFF" opacity=".14"/>
    <rect x="80" y="16" width="40" height="14" rx="4" fill="#E9A426"/>
    <rect x="62" y="108" width="76" height="40" fill="#F2E4C6"/>
    <circle cx="100" cy="128" r="13" fill="#C0392B"/>
  </svg>`;
}

function svgPapas() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="176" rx="54" ry="9" fill="#000" opacity=".13"/>
    <g fill="#F0C25F" stroke="#D6A03C" stroke-width="2">
      <rect x="72" y="52" width="15" height="76" rx="5" transform="rotate(-13 79 90)"/>
      <rect x="94" y="42" width="15" height="86" rx="5"/>
      <rect x="114" y="54" width="15" height="76" rx="5" transform="rotate(12 121 92)"/>
      <rect x="82" y="62" width="15" height="70" rx="5" transform="rotate(6 89 97)"/>
      <rect x="106" y="60" width="15" height="72" rx="5" transform="rotate(-7 113 96)"/>
    </g>
    <path d="M62 120h76l-8 52a10 10 0 0 1-10 8H80a10 10 0 0 1-10-8z" fill="#C0392B"/>
    <path d="M62 120h30l-6 60h-6a10 10 0 0 1-10-8z" fill="#FFF" opacity=".15"/>
  </svg>`;
}

function svgFaina() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="150" rx="70" ry="12" fill="#000" opacity=".12"/>
    <path d="M100 40 30 132a86 86 0 0 0 140 0z" fill="#DFA645"/>
    <path d="M100 52 44 126a74 74 0 0 0 112 0z" fill="#F0C468"/>
    <g fill="#C98A3A" opacity=".5"><circle cx="90" cy="96" r="3.4"/><circle cx="112" cy="106" r="3"/><circle cx="100" cy="120" r="2.6"/><circle cx="78" cy="116" r="2.4"/></g>
    <path d="M30 132h140" stroke="#B87F31" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  </svg>`;
}

function svgProvoleta() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="150" rx="66" ry="14" fill="#000" opacity=".13"/>
    <ellipse cx="100" cy="120" rx="70" ry="34" fill="#3B2A20"/>
    <ellipse cx="100" cy="112" rx="70" ry="34" fill="#4A3427"/>
    <ellipse cx="100" cy="106" rx="52" ry="26" fill="#E8B44A"/>
    <ellipse cx="100" cy="102" rx="52" ry="26" fill="#F6D882"/>
    <g fill="#3F7F4C" opacity=".75"><circle cx="86" cy="98" r="3"/><circle cx="108" cy="94" r="2.6"/><circle cx="118" cy="108" r="2.8"/><circle cx="92" cy="110" r="2.4"/></g>
  </svg>`;
}

function svgPostre() {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="100" cy="164" rx="62" ry="11" fill="#000" opacity=".13"/>
    <ellipse cx="100" cy="150" rx="72" ry="16" fill="#E4D6BE"/>
    <path d="M56 92c0-16 20-26 44-26s44 10 44 26v34c0 14-20 24-44 24s-44-10-44-24z" fill="#F0C468"/>
    <ellipse cx="100" cy="92" rx="44" ry="18" fill="#F6DFA4"/>
    <path d="M60 96c8 20 26 30 40 30s32-10 40-30c-6 16-22 26-40 26s-34-10-40-26z" fill="#8B4513" opacity=".55"/>
    <path d="M100 44c8 6 12 12 12 18h-24c0-6 4-12 12-18z" fill="#C0392B"/>
  </svg>`;
}

function svgPromo() {
  return `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 5c2.6 4.4.9 7-1.8 9.6S15 21 17.6 24.4"/>
    <path d="M8 21a12 12 0 0 0 24 0c0-4-2-7.2-4.8-10 .6 4-2 6.4-4.6 7.2 1.4-5.2-1.4-9.9-6.6-13 .8 6.6-8 9.2-8 15.8z"/>
  </svg>`;
}

function svgDe(p) {
  switch (p.art) {
    case 'pizza':     return svgPizza(p.tone, p.id);
    case 'empanada':  return svgEmpanada(p.id, 1);
    case 'docena':    return svgEmpanada(p.id, 3);
    case 'mila':      return svgMila(true);
    case 'sandwich':  return svgSandwich();
    case 'burger':    return svgBurger();
    case 'botella':   return svgBotella(false);
    case 'lata':      return svgBotella(true);
    case 'papas':     return svgPapas();
    case 'faina':     return svgFaina();
    case 'provoleta': return svgProvoleta();
    case 'postre':    return svgPostre();
    default:          return svgMila(false);
  }
}

const rutaFoto = img => img.startsWith('/') ? img : `/img/${img}.webp`;

function arteDe(p, urgente) {
  if (!p.img) return `<div class="arte">${svgDe(p)}</div>`;
  return `<img data-foto="${esc(p.id)}" src="${rutaFoto(p.img)}" alt="${esc(p.name)}" width="1000" height="750" loading="${urgente ? 'eager' : 'lazy'}" decoding="async">`;
}

/* Una foto que no está no puede dejar el ícono de imagen rota en la carta:
   se cae en la ilustración. El evento 'error' de <img> no burbujea. */
document.addEventListener('error', ev => {
  const img = ev.target;
  if (!(img instanceof HTMLImageElement) || !img.dataset.foto) return;
  const p = TODOS.find(x => x.id === img.dataset.foto);
  if (!p) return;
  const caja = document.createElement('div');
  caja.className = 'arte';
  caja.innerHTML = svgDe(p);
  img.replaceWith(caja);
}, true);

/* ── estado ───────────────────────────────────────────────────────────────── */
const estado = {
  tema:      guardar.get('tema', null),
  categoria: ORDEN[0],
  busqueda:  '',
  carrito:   cargarCarrito(),
  entrega:   guardar.get('entrega', 'retiro'),
  nombre:    guardar.get('nombre', ''),
  pago:      guardar.get('pago', LOCAL.pagos[0]),
  modal:     null,
  ultimoFoco:null
};

function cargarCarrito() {
  const g = guardar.get('carrito', null);
  if (!g || !Array.isArray(g.lineas)) return [];
  const horas = (Date.now() - (g.fecha || 0)) / 36e5;
  return horas > CARRITO_HORAS ? [] : g.lineas;
}
const guardarCarrito = () => guardar.set('carrito', { fecha: Date.now(), lineas: estado.carrito });

/* ── tema ─────────────────────────────────────────────────────────────────── */
function aplicarTema() {
  const oscuro = estado.tema === 'oscuro';
  document.documentElement.dataset.theme = oscuro ? 'dark' : 'light';
  $('#temaIco').innerHTML = oscuro ? I.sol : I.luna;
  $('#temaTxt').textContent = oscuro ? 'Día' : 'Noche';
  $('meta[name="theme-color"]')?.setAttribute('content', oscuro ? '#0D0705' : '#17100C');
}

/* ── identidad del negocio ────────────────────────────────────────────────────
   Todo lo que en el HTML es texto de marca (nombre, bajada, dirección) lleva
   un atributo data-campo y se pisa acá con lo que diga LOCAL en catalogo.js.
   El texto que quedó escrito en el HTML es sólo un respaldo — por si alguien
   mira el archivo fuente — y por eso coincide con los datos por defecto: no
   hay parpadeo, y si mañana esto se reusa para otra pizzería, alcanza con
   cambiar catalogo.js y listo, no hace falta tocar una palabra del HTML. */
function pintarCampos() {
  const CAMPOS = {
    nombre:    LOCAL.nombre,
    bajada:    LOCAL.bajada,
    direccion: LOCAL.direccion
  };
  $$('[data-campo]').forEach(el => {
    const v = CAMPOS[el.dataset.campo];
    if (v != null) el.textContent = v;
  });

  $('#marcaLink').setAttribute('aria-label', `${LOCAL.nombreLargo}, ir al inicio`);
  $('#localTitulo').innerHTML = `${esc(LOCAL.calle)},<br><em>${esc(LOCAL.ciudad)}</em>.`;
  $('#fotoHero').alt = `Pizza de cuatro gustos recién salida del horno en ${LOCAL.nombreLargo}`;
  $('#fotoFachada').alt = `Frente de ${LOCAL.nombreLargo} sobre ${LOCAL.calle}`;
  $('#fotoInterior').alt = `Salón de ${LOCAL.nombreLargo} por dentro`;

  const g = LOCAL.google;
  $('#datoGoogle').textContent = `${g.puntaje} · ${g.resenas} reseñas`;
  $('#puntajeGoogle').textContent = g.puntaje;
  $('#cantidadGoogle').textContent = `${g.resenas} reseñas en Google`;
  $('#linkGoogle').href = LOCAL.buscarEnGoogle;
}

/* ── SEO: título, meta tags y datos estructurados ─────────────────────────────
   Igual que arriba: una sola fuente de verdad. Esto corre antes que nada más,
   así el título de la pestaña cambia apenas carga el script, sin esperar al
   resto del render. */
function pintarSEO() {
  document.title = LOCAL.seo.titulo;
  $('meta[name="description"]')?.setAttribute('content', LOCAL.seo.descripcion);
  $('meta[property="og:site_name"]')?.setAttribute('content', LOCAL.nombreLargo);
  $('meta[property="og:title"]')?.setAttribute('content', LOCAL.seo.titulo);
  $('meta[property="og:description"]')?.setAttribute('content', LOCAL.seo.descripcion);
  $('meta[property="og:image"]')?.setAttribute('content', LOCAL.seo.portada);

  /* schema.org Restaurant: los mismos horarios que se ven en "El local",
     convertidos al inglés que pide la especificación. */
  const DIA_EN = { lun: 'Monday', mar: 'Tuesday', mie: 'Wednesday', jue: 'Thursday', vie: 'Friday', sab: 'Saturday', dom: 'Sunday' };
  const horarios = HORARIOS.dias
    .filter(d => !d.cerrado && d.abre)
    .map(d => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DIA_EN[d.id], opens: d.abre, closes: d.cierra }));

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: LOCAL.nombreLargo,
    servesCuisine: ['Pizza', 'Argentina'],
    priceRange: '$$',
    image: LOCAL.seo.portada,
    telephone: '+' + LOCAL.whatsapp,
    address: {
      '@type': 'PostalAddress',
      streetAddress: LOCAL.calle,
      addressLocality: LOCAL.ciudad,
      addressRegion: LOCAL.provincia,
      addressCountry: LOCAL.pais
    },
    openingHoursSpecification: horarios,
    sameAs: [`https://instagram.com/${LOCAL.instagram}`]
  };
  if (LOCAL.google.ok) {
    ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: LOCAL.google.puntaje.replace(',', '.'), reviewCount: String(LOCAL.google.resenas) };
  }
  const nodoLd = document.getElementById('ldNegocio');
  if (nodoLd) nodoLd.textContent = JSON.stringify(ld);

  /* FAQPage: lo mismo que se ve en la sección de preguntas frecuentes, para
     que Google pueda mostrar el desplegable en los resultados de búsqueda. */
  const ldFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
  const nodoFaq = document.getElementById('ldFaq');
  if (nodoFaq) nodoFaq.textContent = JSON.stringify(ldFaq);
}

/* ── horarios ─────────────────────────────────────────────────────────────── */
const aMin = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const dia = i => HORARIOS.dias[((i % 7) + 7) % 7];

function turno(d) {
  if (!d || d.cerrado || !d.abre) return null;
  const abre = aMin(d.abre);
  let cierra = aMin(d.cierra);
  const cruzaMedianoche = cierra <= abre;
  if (cruzaMedianoche) cierra += 24 * 60;
  return { abre, cierra, cruzaMedianoche, txtAbre: d.abre, txtCierra: d.cierra };
}

function estadoHorario(ahora = new Date()) {
  const idx = (ahora.getDay() + 6) % 7;             // 0 = lunes
  const min = ahora.getHours() * 60 + ahora.getMinutes();

  // ¿sigue abierto el turno de ayer, que cruzó la medianoche?
  const ayer = turno(dia(idx - 1));
  if (ayer && ayer.cruzaMedianoche && min < ayer.cierra - 24 * 60) {
    return { abierto: true, cierra: ayer.txtCierra };
  }
  // ¿estamos dentro del turno de hoy?
  const hoy = turno(dia(idx));
  if (hoy && min >= hoy.abre && min < hoy.cierra) {
    return { abierto: true, cierra: hoy.txtCierra };
  }
  // si no, cuándo abre
  if (hoy && min < hoy.abre) return { abierto: false, cuando: 'hoy', abre: hoy.txtAbre };
  for (let i = 1; i <= 7; i++) {
    const d = dia(idx + i), t = turno(d);
    if (t) return { abierto: false, cuando: i === 1 ? 'mañana' : d.nombre.toLowerCase(), abre: t.txtAbre };
  }
  return { abierto: false };
}

function pintarHorarios() {
  const e = estadoHorario();
  const txt = e.abierto
    ? `Abierto ahora · cierra ${e.cierra}`
    : e.abre ? `Cerrado · abre ${e.cuando} ${e.abre}` : 'Cerrado';

  const cinta = $('#estadoCinta');
  cinta.className = 'estado ' + (e.abierto ? 'abierto' : 'cerrado');
  $('#estadoTxt').textContent = txt;

  $('#horarioHoy').innerHTML = `<i class="punto-mini ${e.abierto ? 'abierto' : 'cerrado'}"></i> ${esc(txt)}`;

  const idxHoy = (new Date().getDay() + 6) % 7;
  $('#horarioSemana').innerHTML = HORARIOS.dias.map((d, i) => `
    <tr class="${i === idxHoy ? 'hoy' : ''}">
      <td>${esc(d.nombre)}</td>
      <td>${d.cerrado ? 'Cerrado' : `${esc(d.abre)} – ${esc(d.cierra)}`}${HORARIOS.confirmado ? '' : ' <span class="pc">•</span>'}</td>
    </tr>`).join('');
}

/* ── promos ───────────────────────────────────────────────────────────────── */
function pintarPromos() {
  const promos = MENU['Promos'] || [];
  $('#promosGrilla').innerHTML = promos.map(p => `
    <article class="promo${p.destacada ? ' destacada' : ''}">
      ${p.badge ? `<span class="promo-cinta">${esc(p.badge)}</span>` : ''}
      <span class="promo-ico">${svgPromo()}</span>
      <h3>${esc(p.name)}</h3>
      <ul class="promo-lista">${(p.incluye || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="promo-desc">${esc(p.desc)}</p>
      <div class="promo-pie">
        <span class="precio">${money(p.price)}${pc(p)}</span>
        <button class="btn-sumar" data-abrir="${esc(p.id)}">${I.mas}<span>Sumar</span></button>
      </div>
    </article>`).join('');
}

/* ── reseñas ──────────────────────────────────────────────────────────────── */
const INICIAL = nombre => (nombre.trim()[0] || '?').toUpperCase();

function pintarResenas() {
  /* Sin reseñas cargadas, la sección no desaparece: sigue mostrando el
     puntaje de Google (arriba, en la cabecera) con su link para leerlas ahí.
     Lo que se oculta es sólo la grilla de tarjetas, que quedaría vacía. */
  $('#resenasGrilla').hidden = RESENAS.length === 0;
  if (!RESENAS.length) return;

  $('#resenasGrilla').innerHTML = RESENAS.map(r => `
    <article class="resena">
      <div class="resena-cabeza">
        <span class="resena-avatar" aria-hidden="true">${esc(INICIAL(r.autor))}</span>
        <div class="resena-quien">
          <span class="resena-autor">${esc(r.autor)}</span>
          <span class="resena-estrellas" aria-label="${r.estrellas} de 5 estrellas">${'★'.repeat(r.estrellas)}${'☆'.repeat(5 - r.estrellas)}</span>
        </div>
      </div>
      <p class="resena-texto">“${esc(r.texto)}”</p>
    </article>`).join('');
}

/* ── preguntas frecuentes ─────────────────────────────────────────────────── */
function pintarFAQ() {
  $('#faqLista').innerHTML = FAQ.map((f, i) => `
    <details class="faq-item" ${i === 0 ? 'open' : ''}>
      <summary><span>${esc(f.q)}</span><span class="faq-mas" aria-hidden="true">+</span></summary>
      <p>${esc(f.a)}</p>
    </details>`).join('');
}

/* ── carta ────────────────────────────────────────────────────────────────── */
function categorias() { return ORDEN.filter(c => MENU[c]?.length); }

function pintarPastillas() {
  $('#pastillas').innerHTML = categorias().map(c => `
    <button class="pastilla" role="tab" aria-selected="${c === estado.categoria && !estado.busqueda}" data-cat="${esc(c)}">
      ${esc(c)} <span class="n">${MENU[c].length}</span>
    </button>`).join('');
}

function visibles() {
  if (estado.busqueda) {
    const q = plano(estado.busqueda);
    return TODOS.filter(p => plano(`${p.name} ${p.desc} ${p.cat} ${(p.incluye || []).join(' ')} ${(p.opciones || []).join(' ')}`).includes(q));
  }
  return (MENU[estado.categoria] || []).map(p => ({ ...p, cat: estado.categoria }));
}

function pintarGrilla() {
  const items = visibles();
  const grilla = $('#grilla');

  $('#contador').textContent = estado.busqueda
    ? `${items.length} ${items.length === 1 ? 'resultado' : 'resultados'} para “${estado.busqueda}”`
    : `${items.length} productos · ${estado.categoria}`;

  $('#vacio').hidden = items.length > 0;

  grilla.innerHTML = items.map((p, i) => `
    <article class="tarjeta${p.off ? ' agotada' : ''}" style="animation-delay:${Math.min(i, 9) * 42}ms">
      <div class="tarjeta-arte">
        ${p.off ? '<span class="chapita sin">Hoy no hay</span>' : p.badge ? `<span class="chapita">${esc(p.badge)}</span>` : ''}
        ${arteDe(p, i < 4)}
      </div>
      <div class="tarjeta-cuerpo">
        <h3>${esc(p.name)}</h3>
        <p class="tarjeta-desc">${esc(p.desc)}</p>
        <div class="tarjeta-pie">
          <span class="precio">${money(p.price)}${pc(p)}</span>
          ${p.off
            ? '<span class="btn-sumar off" aria-disabled="true">Sin stock</span>'
            : `<button class="btn-sumar" data-abrir="${esc(p.id)}">${I.mas}<span>Agregar</span></button>`}
        </div>
      </div>
    </article>`).join('');
}

const buscarProducto = id => TODOS.find(p => p.id === id) || null;

/* ── configurador ─────────────────────────────────────────────────────────── */
function abrirModal(id) {
  const p = buscarProducto(id);
  if (!p || p.off) return;
  estado.ultimoFoco = document.activeElement;
  estado.modal = {
    p, kind: p.kind,
    coccion: 'punto',
    gustos: p.kind === 'pizza' ? [p.id] : [],
    sabor:  p.kind === 'empanada' ? SABORES_EMP[0] : null,
    opcion: p.opciones ? p.opciones[0] : null,
    extras: [],
    cuentas: {},
    nota: '',
    cant: 1
  };
  $('#velo').hidden = false;
  $('#modal').hidden = false;
  document.body.classList.add('trabado');
  pintarModal();
  requestAnimationFrame(() => $('#modalCard .cerrar')?.focus());
}

function cerrarModal() {
  if (!estado.modal) return;
  estado.modal = null;
  $('#modal').hidden = true;
  $('#modalCard').innerHTML = '';
  if ($('#pedido').hidden) { $('#velo').hidden = true; document.body.classList.remove('trabado'); }
  estado.ultimoFoco?.focus();
}

/* Decir "mitad" y no "2 gustos: A · B" es la diferencia entre que el pizzero
   entienda el pedido y que salga otra pizza. */
const PORCION = { 2: 'mitad', 3: '1/3', 4: '1/4' };

function calcular() {
  const m = estado.modal, p = m.p;
  const detalle = [];
  let unidad = p.price;
  let titulo = p.name;

  if (m.kind === 'pizza') {
    const elegidas = m.gustos.map(id => PIZZAS.find(x => x.id === id)).filter(Boolean);
    unidad = Math.max(...elegidas.map(g => g.price), p.price);   // combinada, manda el más caro
    if (elegidas.length > 1) {
      const parte = PORCION[elegidas.length] || `1/${elegidas.length}`;
      titulo = `Pizza de ${elegidas.length} gustos`;
      for (const g of elegidas) detalle.push(`${parte}: ${g.name}`);
    } else {
      titulo = `Pizza de ${elegidas[0]?.name || p.name}`;
    }
    detalle.push(COCCIONES.find(c => c.id === m.coccion).label);
  }

  if (m.kind === 'empanada') detalle.push(m.sabor);
  if (m.opcion) detalle.push(m.opcion);

  const cant = p.cant || 0;
  const puestas = SABORES_EMP.reduce((s, f) => s + (m.cuentas[f] || 0), 0);
  const faltan = m.kind === 'docena' ? Math.max(0, cant - puestas) : 0;
  if (m.kind === 'docena') {
    const elegidas = SABORES_EMP.filter(f => m.cuentas[f]).map(f => `${m.cuentas[f]}× ${f}`);
    if (elegidas.length) detalle.push(elegidas.join(', '));
  }

  if (m.kind === 'promo' && p.incluye) detalle.push(...p.incluye);

  const ex = extrasFor(m.kind).filter(e => m.extras.includes(e.label));
  unidad += ex.reduce((s, e) => s + e.price, 0);
  if (ex.length) detalle.push('Extras: ' + ex.map(e => e.label).join(', '));

  // El total sólo está confirmado si lo está el producto que manda y no hay extras.
  const manda = m.kind === 'pizza'
    ? m.gustos.map(id => PIZZAS.find(x => x.id === id)).filter(Boolean).every(g => g.ok)
    : !!p.ok;

  return { unidad, total: unidad * m.cant, titulo, detalle, faltan, trabado: faltan > 0, ok: manda && ex.length === 0 };
}

function pintarModal() {
  const m = estado.modal;
  if (!m) return;
  const p = m.p, { total, faltan, trabado, ok } = calcular();
  const S = [];

  /* pizzas: gustos + cocción */
  if (m.kind === 'pizza') {
    const n = m.gustos.length, lleno = n >= MAX_GUSTOS;
    S.push(`
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Gustos</span><span class="grupo-val">${n} de ${MAX_GUSTOS}</span></div>
        <p class="grupo-ayuda">Combiná hasta ${MAX_GUSTOS} gustos sin cargo. Tocá para sumar o sacar: vale el gusto más caro de los elegidos.</p>
        <div class="gustos">
          ${PIZZAS.map(f => {
            const on = m.gustos.includes(f.id);
            const bloq = f.off || (!on && lleno);
            return `<button class="gusto" aria-pressed="${on}" ${bloq ? 'disabled' : ''} data-gusto="${esc(f.id)}">
              <span>${esc(f.name)}</span><span class="x">${f.off ? 'hoy no hay' : money(f.price) + pc(f)}</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Cocción</span></div>
        <div class="opciones">
          ${COCCIONES.map(c => `<button class="opcion" aria-pressed="${m.coccion === c.id}" data-coccion="${esc(c.id)}">${esc(c.label)}</button>`).join('')}
        </div>
      </div>`);
  }

  /* empanada suelta: sabor */
  if (m.kind === 'empanada') {
    S.push(`
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Sabor</span></div>
        <div class="opciones">
          ${SABORES_EMP.map(f => `<button class="opcion" aria-pressed="${m.sabor === f}" data-sabor="${esc(f)}">${esc(f)}</button>`).join('')}
        </div>
      </div>`);
  }

  /* docena / media docena: repartir cantidades */
  if (m.kind === 'docena') {
    const puestas = (p.cant || 0) - faltan;
    S.push(`
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Armá la ${p.cant === 12 ? 'docena' : 'media docena'}</span><span class="grupo-val">${puestas} de ${p.cant}</span></div>
        <p class="grupo-ayuda">${faltan ? `Te ${faltan === 1 ? 'falta' : 'faltan'} ${faltan} para completar.` : 'Listo, ya está completa.'}</p>
        <div class="contadores">
          ${SABORES_EMP.map(f => {
            const n = m.cuentas[f] || 0;
            return `<div class="cont-fila${n ? ' activa' : ''}">
              <span>${esc(f)}</span>
              <div class="pasos">
                <button class="paso" data-menos="${esc(f)}" ${n ? '' : 'disabled'} aria-label="Sacar una de ${esc(f)}">–</button>
                <span class="paso-n">${n}</span>
                <button class="paso" data-mas="${esc(f)}" ${faltan ? '' : 'disabled'} aria-label="Sumar una de ${esc(f)}">+</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`);
  }

  /* bebidas, helado y demás: variante única */
  if (p.opciones) {
    S.push(`
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Elegí cuál</span></div>
        <div class="opciones">
          ${p.opciones.map(o => `<button class="opcion" aria-pressed="${m.opcion === o}" data-opcion="${esc(o)}">${esc(o)}</button>`).join('')}
        </div>
      </div>`);
  }

  /* promo: qué incluye */
  if (m.kind === 'promo') {
    S.push(`
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Incluye</span></div>
        <ul class="promo-lista">${(p.incluye || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <p class="grupo-ayuda grupo-ayuda-fin">Los gustos y sabores de la promo los coordinamos por WhatsApp cuando confirmamos el pedido.</p>
      </div>`);
  }

  /* extras */
  const exs = extrasFor(m.kind);
  if (exs.length) {
    S.push(`
      <div class="grupo">
        <div class="grupo-cabeza"><span class="grupo-rot">Extras</span><span class="grupo-val">opcional</span></div>
        <div class="opciones">
          ${exs.map(e => `<button class="opcion" aria-pressed="${m.extras.includes(e.label)}" data-extra="${esc(e.label)}">${esc(e.label)} · ${money(e.price)}</button>`).join('')}
        </div>
      </div>`);
  }

  /* nota */
  S.push(`
    <div class="grupo">
      <div class="grupo-cabeza"><span class="grupo-rot">Aclaraciones</span><span class="grupo-val">opcional</span></div>
      <textarea class="nota-txt" id="nota" placeholder="Sin aceitunas, cortada en 8, tocar timbre…" maxlength="180">${esc(m.nota)}</textarea>
    </div>`);

  $('#modalCard').innerHTML = `
    <div class="modal-arte">
      ${arteDe(p, true)}
      <button class="cerrar" data-cerrar-modal aria-label="Cerrar">${I.equis}</button>
      <div class="modal-titulo">
        <h2 id="modalTitulo">${esc(p.name)}</h2>
        <p>${esc(p.desc)}</p>
      </div>
    </div>
    <div class="modal-cuerpo">${S.join('')}</div>
    <div class="modal-pie">
      <div class="pie-fila">
        <div class="cantidad">
          <button class="paso" data-cant="-1" ${m.cant <= 1 ? 'disabled' : ''} aria-label="Menos cantidad">–</button>
          <span class="paso-n">${m.cant}</span>
          <button class="paso" data-cant="1" ${m.cant >= 20 ? 'disabled' : ''} aria-label="Más cantidad">+</button>
        </div>
        <button class="btn-agregar" data-agregar ${trabado ? 'disabled' : ''}>
          <span>${trabado ? `Faltan ${faltan}` : 'Agregar al pedido'}</span>
          ${trabado ? '' : `<span>·</span><span>${money(total)}</span>`}
        </button>
      </div>
      <p class="aclaracion">${ok
        ? `<span class="confirmado">${I.tilde}</span><span>Precio confirmado por el local.</span>`
        : '<span class="pc">•</span><span>Precio estimado: lo confirmamos por WhatsApp antes de cocinar.</span>'}</p>
    </div>`;
}

/* ── pedido ───────────────────────────────────────────────────────────────── */
function agregarAlPedido() {
  const m = estado.modal;
  const { unidad, titulo, detalle, trabado } = calcular();
  if (trabado) return;
  estado.carrito.push({
    id: Math.random().toString(36).slice(2),
    nombre: titulo, unidad, cant: m.cant, detalle, nota: m.nota.trim()
  });
  guardarCarrito();
  pintarPedido();
  const b = $('#pedidoBtn');
  b.classList.remove('salta'); void b.offsetWidth; b.classList.add('salta');
  avisar(`${m.p.name} al pedido`);
  cerrarModal();
}

const subtotal = () => estado.carrito.reduce((s, l) => s + l.unidad * l.cant, 0);
const envio = () => (estado.entrega === 'delivery' && estado.carrito.length && LOCAL.delivery.hay) ? LOCAL.delivery.costo : 0;
const totalPedido = () => subtotal() + envio();

function pintarPedido() {
  const n = estado.carrito.reduce((s, l) => s + l.cant, 0);
  const chapa = $('#pedidoN');
  chapa.textContent = n;
  chapa.hidden = n === 0;

  const sub = subtotal(), env = envio();
  const cortoDeMinimo = estado.entrega === 'delivery' && sub > 0 && sub < LOCAL.delivery.minimo;

  $('#pedido').innerHTML = `
    <div class="pedido-cabeza">
      <h2>Tu pedido</h2>
      <button class="cerrar" data-cerrar-pedido aria-label="Cerrar el pedido">${I.equis}</button>
    </div>

    <div class="pedido-cuerpo">
      ${estado.carrito.length === 0
        ? `<div class="pedido-vacio">${I.bolsa}<span>Todavía no agregaste nada.<br>Elegí algo del menú y armalo a tu gusto.</span></div>`
        : estado.carrito.map(l => `
          <div class="linea">
            <span class="linea-nombre">${l.cant}× ${esc(l.nombre)}</span>
            ${l.detalle.length ? `<span class="linea-detalle">${esc(l.detalle.join(' · '))}</span>` : ''}
            ${l.nota ? `<span class="linea-nota">“${esc(l.nota)}”</span>` : ''}
            <div class="linea-pie">
              <span class="linea-precio">${money(l.unidad * l.cant)}</span>
              <button class="linea-quitar" data-quitar="${esc(l.id)}">Quitar</button>
            </div>
          </div>`).join('')}

      ${estado.carrito.length ? `
        <div class="entrega">
          <span class="entrega-rot">¿Cómo lo querés?</span>
          <div class="entrega-ops">
            <button class="opcion" aria-pressed="${estado.entrega === 'retiro'}" data-entrega="retiro">Lo retiro</button>
            <button class="opcion" aria-pressed="${estado.entrega === 'delivery'}" data-entrega="delivery">Delivery</button>
          </div>
          ${estado.entrega === 'delivery'
            ? `<p class="pedido-nota nota-envio">Envío ${money(LOCAL.delivery.costo)}<span class="pc">•</span> en ${esc(LOCAL.delivery.zona)}. Pedido mínimo ${money(LOCAL.delivery.minimo)}.${cortoDeMinimo ? ' <b class="alerta">Todavía no llegás al mínimo.</b>' : ''}</p>`
            : ''}
        </div>

        <div class="entrega">
          <span class="entrega-rot">A nombre de</span>
          <input class="campo" id="campoNombre" type="text" placeholder="Tu nombre" value="${esc(estado.nombre)}" maxlength="40" autocomplete="name">
        </div>

        <div class="entrega">
          <span class="entrega-rot">Forma de pago</span>
          <select class="campo" id="campoPago">
            ${LOCAL.pagos.map(p => `<option ${estado.pago === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}
          </select>
        </div>
      ` : ''}
    </div>

    <div class="pedido-pie">
      <div class="suma"><span>Subtotal</span><span>${money(sub)}</span></div>
      ${env ? `<div class="suma"><span>Envío</span><span>${money(env)}</span></div>` : ''}
      <div class="suma total"><span>Total</span><span>${money(sub + env)}</span></div>
      <button class="btn-wa" data-enviar ${estado.carrito.length ? '' : 'disabled'}>${I.wa}<span>Mandar el pedido por WhatsApp</span></button>
      ${estado.carrito.length ? '<button class="vaciar" data-vaciar>Vaciar el pedido</button>' : ''}
      <p class="pedido-nota">Te contestamos al toque para confirmar la demora y el total final. Demora habitual: ${esc(LOCAL.demora)}.</p>
    </div>`;
}

function abrirPedido() {
  pintarPedido();
  $('#pedido').hidden = false;
  $('#velo').hidden = false;
  document.body.classList.add('trabado');
  requestAnimationFrame(() => $('#pedido .cerrar')?.focus());
}

function cerrarPedido() {
  $('#pedido').hidden = true;
  if ($('#modal').hidden) { $('#velo').hidden = true; document.body.classList.remove('trabado'); }
}

function mandarWhatsApp() {
  if (!estado.carrito.length) return;
  /* Cada dato en su renglón: amontonar "mitad: A · mitad: B · a punto" en una
     sola línea es justo lo que hace que salga otra pizza. */
  const lineas = estado.carrito.map(l => {
    const partes = [`• ${l.cant}× ${l.nombre} — ${money(l.unidad * l.cant)}`];
    for (const d of l.detalle) partes.push(`   ${d}`);
    if (l.nota) partes.push(`   Nota: ${l.nota}`);
    return partes.join('\n');
  });

  const cab = [`¡Hola ${LOCAL.nombre}! Quiero hacer este pedido:`];
  const pie = [
    '',
    `Subtotal: ${money(subtotal())}`,
    envio() ? `Envío: ${money(envio())}` : null,
    `Total: ${money(totalPedido())}`,
    '',
    estado.entrega === 'delivery' ? 'Entrega: delivery' : 'Entrega: paso a retirar',
    estado.nombre ? `A nombre de: ${estado.nombre}` : null,
    `Pago: ${estado.pago}`
  ].filter(x => x !== null);   // ojo: los '' son los renglones en blanco, no se filtran

  const txt = `${cab.join('\n')}\n\n${lineas.join('\n\n')}\n${pie.join('\n')}`;
  window.open(`https://wa.me/${LOCAL.whatsapp}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
}

/* ── aviso ────────────────────────────────────────────────────────────────── */
let avisoT;
function avisar(msg) {
  const el = $('#aviso');
  el.innerHTML = `${I.tilde}<span>${esc(msg)}</span>`;
  el.classList.add('ver');
  clearTimeout(avisoT);
  avisoT = setTimeout(() => el.classList.remove('ver'), 2400);
}

/* ── eventos ──────────────────────────────────────────────────────────────── */
document.addEventListener('click', ev => {
  const en = sel => ev.target.closest(sel);
  const m = estado.modal;

  /* categorías y búsqueda */
  const past = en('[data-cat]');
  if (past) {
    estado.categoria = past.dataset.cat;
    estado.busqueda = '';
    $('#buscar').value = ''; $('#buscarX').hidden = true;
    pintarPastillas(); pintarGrilla();
    return;
  }

  /* abrir configurador */
  const abrir = en('[data-abrir]');
  if (abrir) { abrirModal(abrir.dataset.abrir); return; }

  /* cerrar capas */
  if (en('[data-cerrar-modal]')) { cerrarModal(); return; }
  if (en('[data-cerrar-pedido]')) { cerrarPedido(); return; }
  if (ev.target.id === 'velo') { cerrarModal(); cerrarPedido(); return; }

  /* abrir pedido */
  if (en('#pedidoBtn') || en('#heroPedidoBtn')) { abrirPedido(); return; }

  /* tema */
  if (en('#temaBtn')) {
    estado.tema = estado.tema === 'oscuro' ? 'claro' : 'oscuro';
    guardar.set('tema', estado.tema);
    aplicarTema();
    return;
  }

  /* --- dentro del configurador --- */
  if (m) {
    const recordarNota = () => { m.nota = $('#nota')?.value ?? m.nota; };

    const g = en('[data-gusto]');
    if (g) {
      recordarNota();
      const id = g.dataset.gusto;
      if (m.gustos.includes(id)) {
        if (m.gustos.length > 1) m.gustos = m.gustos.filter(x => x !== id);
      } else if (m.gustos.length < MAX_GUSTOS) {
        m.gustos.push(id);
      }
      pintarModal(); return;
    }

    const co = en('[data-coccion]');
    if (co) { recordarNota(); m.coccion = co.dataset.coccion; pintarModal(); return; }

    const sa = en('[data-sabor]');
    if (sa) { recordarNota(); m.sabor = sa.dataset.sabor; pintarModal(); return; }

    const op = en('[data-opcion]');
    if (op) { recordarNota(); m.opcion = op.dataset.opcion; pintarModal(); return; }

    const ex = en('[data-extra]');
    if (ex) {
      recordarNota();
      const l = ex.dataset.extra;
      m.extras = m.extras.includes(l) ? m.extras.filter(x => x !== l) : m.extras.concat(l);
      pintarModal(); return;
    }

    const mas = en('[data-mas]');
    if (mas) {
      recordarNota();
      const f = mas.dataset.mas;
      const puestas = SABORES_EMP.reduce((s, x) => s + (m.cuentas[x] || 0), 0);
      if (puestas < (m.p.cant || 0)) m.cuentas[f] = (m.cuentas[f] || 0) + 1;
      pintarModal(); return;
    }
    const menos = en('[data-menos]');
    if (menos) {
      recordarNota();
      const f = menos.dataset.menos;
      if (m.cuentas[f]) m.cuentas[f]--;
      pintarModal(); return;
    }

    const ca = en('[data-cant]');
    if (ca) {
      recordarNota();
      m.cant = Math.min(20, Math.max(1, m.cant + Number(ca.dataset.cant)));
      pintarModal(); return;
    }

    if (en('[data-agregar]')) { recordarNota(); agregarAlPedido(); return; }
  }

  /* --- dentro del pedido --- */
  const q = en('[data-quitar]');
  if (q) {
    estado.carrito = estado.carrito.filter(l => l.id !== q.dataset.quitar);
    guardarCarrito(); pintarPedido(); return;
  }
  const entrega = en('[data-entrega]');
  if (entrega) {
    estado.entrega = entrega.dataset.entrega;
    guardar.set('entrega', estado.entrega);
    pintarPedido(); return;
  }
  if (en('[data-vaciar]')) { estado.carrito = []; guardarCarrito(); pintarPedido(); avisar('Pedido vaciado'); return; }
  if (en('[data-enviar]')) { mandarWhatsApp(); return; }
});

/* búsqueda */
$('#buscar').addEventListener('input', ev => {
  estado.busqueda = ev.target.value.trim();
  $('#buscarX').hidden = !estado.busqueda;
  pintarPastillas();
  pintarGrilla();
});
$('#buscarX').addEventListener('click', () => {
  estado.busqueda = '';
  $('#buscar').value = ''; $('#buscarX').hidden = true;
  $('#buscar').focus();
  pintarPastillas(); pintarGrilla();
});

/* campos del pedido */
document.addEventListener('input', ev => {
  if (ev.target.id === 'campoNombre') { estado.nombre = ev.target.value; guardar.set('nombre', estado.nombre); }
});
document.addEventListener('change', ev => {
  if (ev.target.id === 'campoPago') { estado.pago = ev.target.value; guardar.set('pago', estado.pago); }
});

/* teclado: Escape cierra, Tab queda atrapado en la capa abierta */
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') {
    if (!$('#modal').hidden) return cerrarModal();
    if (!$('#pedido').hidden) return cerrarPedido();
    return;
  }
  if (ev.key !== 'Tab') return;
  const capa = !$('#modal').hidden ? $('#modal') : (!$('#pedido').hidden ? $('#pedido') : null);
  if (!capa) return;
  const foco = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', capa)
    .filter(el => el.offsetParent !== null);
  if (!foco.length) return;
  const primero = foco[0], ultimo = foco[foco.length - 1];
  if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
  else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
});

/* la barra se despega al hacer scroll */
addEventListener('scroll', () => {
  $('#nav').classList.toggle('pegado', scrollY > 8);
}, { passive: true });

/* ── arranque ─────────────────────────────────────────────────────────────── */
pintarSEO();      // primero: que el título de la pestaña cambie ya mismo
pintarCampos();

/* data-wa-link: todos apuntan al WhatsApp del local. data-wa-numero, además,
   muestra el teléfono como texto (los otros ya traen su propio texto: "Escribinos
   por WhatsApp", "por WhatsApp", o son sólo el ícono flotante). */
$$('[data-wa-link]').forEach(a => { a.href = `https://wa.me/${LOCAL.whatsapp}`; });
$$('[data-wa-numero]').forEach(a => { a.textContent = LOCAL.telVisible; });
$$('[data-ig-link]').forEach(a => { a.href = `https://instagram.com/${LOCAL.instagram}`; a.textContent = '@' + LOCAL.instagram; });
$('#mapaBtn').href = LOCAL.mapa;
$('#mapaCinta').href = LOCAL.mapa;
$('#datoGustos').textContent = PIZZAS.length;
$('#datoPagos').textContent = LOCAL.pagos.join(', ');
$('#datoDemora').textContent = LOCAL.demora;
$('#anio').textContent = new Date().getFullYear();

aplicarTema();
pintarHorarios();
pintarPromos();
pintarResenas();
pintarFAQ();
pintarPastillas();
pintarGrilla();
pintarPedido();

/* el cartel de abierto/cerrado se refresca solo cada minuto */
setInterval(pintarHorarios, 60000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pintarHorarios(); });

})();
