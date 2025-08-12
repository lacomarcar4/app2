const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));

const routes = {
  '/': homePage,
  '/menu': menuPage,
  '/juegos': juegosPage,
  '/puntos': puntosPage,
  '/eventos': eventosPage,
  '/contacto': contactoPage,
  '/tienda': tiendaPage,
};

async function navigate() {
  const path = location.hash.replace('#','') || '/';
  const page = routes[path] || notFound;
  const app = $('#app');
  app.innerHTML = '';
  app.append(await page());
}
window.addEventListener('hashchange', navigate);
window.addEventListener('load', async () => {
  // Drawer
  $('#menuBtn').addEventListener('click', ()=> $('#drawer').classList.toggle('open'));
  $('#drawer').addEventListener('click', (e)=>{
    if(e.target.matches('a[data-link]')) $('#drawer').classList.remove('open');
  });
  // PWA
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
  navigate();
});

function el(html){
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

async function homePage(){
  const wrap = el(`<section class="grid cols-2"></section>`);
  wrap.append(el(`<div class="card hero">
    <span class="badge">Demo</span>
    <h2>Bienvenid@s a La Comarca</h2>
    <p>Casa de juegos de mesa, especialidad en café y buenas historias.</p>
    <div class="tabs">
      <a class="tab active" href="#/menu">Menú</a>
      <a class="tab" href="#/juegos">Explicar juegos</a>
      <a class="tab" href="#/eventos">Agenda</a>
    </div>
  </div>`));

  wrap.append(el(`<div class="card">
    <h3>Promos & Packs</h3>
    <ul>
      <li>Pack Amigos · 2 bebidas + juego sugerido</li>
      <li>Pack Familiar · Merienda + mesa reservada</li>
      <li>Pack Nocturno · Café + dulce + estrategia</li>
    </ul>
    <a class="btn" href="#/puntos">Sumá puntos</a>
  </div>`));
  return wrap;
}

async function menuPage(){
  const res = await fetch('/data/menu.json');
  const menu = await res.json();
  const sec = el(`<section class="grid"></section>`);
  for(const cat of menu.categories){
    const card = el(`<div class="card"><h3>${cat.name}</h3><div class="grid cols-2"></div></div>`);
    for(const item of cat.items){
      const node = el(`<div class="card">
        <h4>${item.name} <span class="badge">$${item.price}</span></h4>
        <p>${item.desc||''}</p>
        <div class="kv">
          <b>Notas</b><span>${item.tags?.join(', ')||'-'}</span>
          <b></b><span><a class="btn" href="${item.link||'#'}" target="_blank" rel="noopener">Pedir</a></span>
        </div>
      </div>`);
      card.querySelector('.grid').append(node);
    }
    sec.append(card);
  }
  sec.append(el(`<div class="notice">Para sincronización real con Kyte: reemplazar <code>data/menu.json</code> vía script que lea el catálogo o usar deeplinks al checkout de Kyte.</div>`));
  return sec;
}

async function juegosPage(){
  const res = await fetch('/data/juegos.json'); const data = await res.json();
  const sec = el(`<section class="grid"></section>`);
  for(const g of data){
    const card = el(`<div class="card">
      <h3>${g.title}</h3>
      <p>${g.pitch}</p>
      <table class="table">
        <tr><th>Jugadores</th><td>${g.players}</td></tr>
        <tr><th>Tiempo</th><td>${g.time}</td></tr>
        <tr><th>Mecánicas</th><td>${g.mechanics.join(', ')}</td></tr>
        <tr><th>Explicación rápida</th><td>${g.teach}</td></tr>
      </table>
      <a class="btn secondary" href="${g.ref||'#'}" target="_blank" rel="noopener">Guía completa</a>
    </div>`);
    sec.append(card);
  }
  return sec;
}

async function puntosPage(){
  const sec = el(`<section class="grid"></section>`);
  sec.append(el(`<div class="card">
    <h3>Puntos de Lealtad</h3>
    <p>Mostrá tu QR en caja para sumar. 1 ARS = 1 punto (configurable). Canjeá por premios.</p>
    <label>Tu teléfono (ID): <input id="phone" placeholder="+54 9 ..." /></label>
    <button class="btn" id="saveId">Guardar</button>
    <div id="qrWrap" style="margin-top:1rem"></div>
    <div class="notice"><b>Demo:</b> QR offline. En producción, validar en backend y registrar transacciones.</div>
  </div>`));

  sec.append(el(`<div class="card">
    <h3>Premios</h3>
    <ul>
      <li>5000 pts · Café de la casa</li>
      <li>15000 pts · 2x1 en bebidas</li>
      <li>40000 pts · Merch sorpresa</li>
    </ul>
  </div>`));

  // Simple QR (no lib): show ID as big block code
  setTimeout(()=>{
    const phone = localStorage.getItem('lc_id')||'';
    $('#phone').value = phone;
    $('#saveId').onclick = ()=>{
      localStorage.setItem('lc_id',$('#phone').value.trim());
      renderQR($('#phone').value.trim());
    };
    renderQR(phone);
  },0);

  function renderQR(text){
    const wrap = $('#qrWrap');
    if(!text){ wrap.innerHTML = '<p>Ingresá tu teléfono para generar QR.</p>'; return; }
    // Using a simple data URL with text; replace with real QR library in prod
    const png = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent('LC:'+text);
    wrap.innerHTML = `<img alt="QR" src="${png}"><p class="badge">${text}</p>`;
  }

  return sec;
}

async function eventosPage(){
  const res = await fetch('/data/eventos.json'); const events = await res.json();
  const sec = el(`<section class="grid"></section>`);
  const list = el(`<div class="card"><h3>Próximos eventos</h3><table class="table"><thead><tr><th>Fecha</th><th>Evento</th><th>Acción</th></tr></thead><tbody></tbody></table></div>`);
  for(const ev of events){
    const tr = el(`<tr><td>${new Date(ev.date).toLocaleString()}</td><td>${ev.title}</td><td><a class="btn" href="${ev.link||'#'}" target="_blank" rel="noopener">Reservar</a></td></tr>`);
    list.querySelector('tbody').append(tr);
  }
  sec.append(list);
  sec.append(el(`<div class="notice">Podés conectar tu Google Calendar público para que se muestre automáticamente aquí.</div>`));
  return sec;
}

async function contactoPage(){
  const sec = el(`<section class="grid cols-2"></section>`);
  sec.append(el(`<div class="card">
    <h3>Contacto & Horarios</h3>
    <div class="kv">
      <b>Instagram</b><span><a href="https://instagram.com/lacomarca.r4" target="_blank" rel="noopener">@lacomarca.r4</a></span>
      <b>WhatsApp</b><span><a href="https://wa.me/549" target="_blank" rel="noopener">+54 9 …</a></span>
      <b>Dirección</b><span>Río Cuarto, Córdoba</span>
      <b>Horarios</b><span>Lun-Jue (día); Vie-Sáb 20:00–00:00</span>
    </div>
  </div>`));
  sec.append(el(`<div class="card">
    <h3>Cómo llegar</h3>
    <p>Mapa embebido (reemplazar con Google Maps).</p>
    <iframe title="mapa" style="width:100%;height:220px;border:0;border-radius:12px" src=""></iframe>
  </div>`));
  return sec;
}

async function tiendaPage(){
  const sec = el(`<section class="grid"></section>`);
  sec.append(el(`<div class="card">
    <h3>Tienda & Merch</h3>
    <p>Explorá y comprá directamente en nuestro catálogo:</p>
    <a class="btn" href="https://lacomarcar4.kyte.site" target="_blank" rel="noopener">Abrir catálogo Kyte</a>
    <p class="notice">En una próxima iteración podemos leer el feed de Kyte o usar webhooks para sincronizar stock y precios.</p>
  </div>`));
  return sec;
}

function notFound(){
  return el(`<div class="card"><h3>404</h3><p>No encontramos esa sección.</p></div>`);
}
