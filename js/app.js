'use strict';

/* Lógica da página: idioma, renderização, carrossel de confidentes e player de música. */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Idioma ---------- */
let lang = 'pt';
try { if (localStorage.getItem('p5r-lang') === 'en') lang = 'en'; } catch (e) { /* storage indisponível */ }

const T = key => UI[lang][key];
const attrName = a => ATTR_NAMES[lang][a];
const locConf = i => (lang === 'en' ? { ...confidants[i], ...CONF_EN[i] } : confidants[i]);
const locAttrs = () => (lang === 'en'
  ? attrs.map((a, i) => ({ ...a, nome: attrName(a.nome), linhas: ATTRS_EN[i] }))
  : attrs);
const locTips = () => (lang === 'en' ? TIPS_EN : tips);

$$('[data-i18n]').forEach(el => { el.dataset.pt = el.innerHTML; });

function setLabel(el, text) {
  el.title = text;
  el.setAttribute('aria-label', text);
}

function applyStatic() {
  document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
  document.title = T('docTitle');
  $$('[data-i18n]').forEach(el => {
    el.innerHTML = lang === 'en' ? STATIC_EN[el.dataset.i18n] : el.dataset.pt;
  });
  const btn = $('#langBtn');
  btn.innerHTML = lang === 'en' ? FLAGS.br : FLAGS.us;
  setLabel(btn, T('langBtn'));
  setLabel($('#vinylBtn'), T('music'));
  setLabel($('#volumeSlider'), T('volume'));
  setLabel($('#carPrev'), T('prev'));
  setLabel($('#carNext'), T('next'));
}

function setLang(next) {
  lang = next;
  try { localStorage.setItem('p5r-lang', next); } catch (e) { /* storage indisponível */ }
  render();
}

$('#langBtn').addEventListener('click', e => {
  e.stopPropagation();
  setLang(lang === 'en' ? 'pt' : 'en');
});

/* ---------- Imagens com fallback ---------- */
document.addEventListener('error', e => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.hasAttribute('data-fallback')) {
    img.style.display = 'none';
    if (img.nextElementSibling) img.nextElementSibling.style.display = 'flex';
  }
}, true);

const portrait = c => `
  <img src="assets/img/${c.file}.png" alt="${c.nome}" loading="lazy" draggable="false" data-fallback>
  <span class="fallback">${svg(c.icone)}</span>`;

/* ---------- Atributos ---------- */
function renderAttrs() {
  $('#attrGrid').innerHTML = locAttrs().map(a => `
    <div class="attr-card reveal" style="--c:${a.cor}">
      <div class="attr-head">
        <div class="attr-badge">${svg(a.icone)}</div>
        <div class="attr-name">${a.nome}</div>
      </div>
      <div class="attr-rows">
        ${a.linhas.map(([k, v]) => `<div class="attr-row"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}
      </div>
    </div>`).join('');
}

/* ---------- Filtros ---------- */
const FILTERS = ['Todos', 'Conhecimento', 'Coragem', 'Habilidade', 'Gentileza', 'Charme'];
let activeFilter = 'Todos';

function renderFilters() {
  const row = $('#filterRow');
  row.innerHTML = FILTERS.map(f => `
    <button class="chip ${f === activeFilter ? 'active' : ''}" data-f="${f}">
      ${f === 'Todos' ? T('all') : attrName(f)}
    </button>`).join('');
}

$('#filterRow').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  activeFilter = chip.dataset.f;
  renderFilters();
  closeDetail();
  renderConfidants();
});

/* ---------- Carrossel de confidentes ---------- */
const track = $('#confTrack');
let selected = null;

function themeStyle(c) {
  const [g1, g2] = CONF_THEME[c.file] || ['#e0102a', '#181418'];
  return `--g1:${g1};--g2:${g2}`;
}

function renderConfidants() {
  const visible = confidants
    .map((c, i) => i)
    .filter(i => activeFilter === 'Todos' || confidants[i].attr === activeFilter);

  track.innerHTML = visible.map((idx, n) => {
    const c = locConf(idx);
    const tag = c.attr
      ? `<span class="attr-tag" style="background:${ATTR_COLORS[c.attr]}">${attrName(c.attr)}</span>`
      : `<span class="card-cta">${T('story')}</span>`;
    return `
      <button class="conf-card ${idx === selected ? 'active' : ''}" role="listitem" type="button"
              data-idx="${idx}" style="${themeStyle(c)};--i:${n}" aria-label="${T('open')}: ${c.nome}">
        <span class="card-numeral">${c.n}</span>
        <span class="card-portrait">${portrait(c)}</span>
        <span class="card-info">
          <span class="card-arcana">${c.arc}</span>
          <span class="card-name">${c.nome}</span>
          ${tag}
        </span>
      </button>`;
  }).join('');

  track.scrollLeft = 0;
  updateCarouselUI();
}

function rankListHTML(c) {
  if (c.auto) return `<div class="rank-auto-note">${c.autoNote}</div>`;
  return `<div class="rank-list">
    ${c.ranks.map((r, i) => `<div class="rank-row" style="--i:${i}"><div class="rn">${i + 1}</div><div>${r}</div></div>`).join('')}
  </div>`;
}

function renderDetail() {
  const box = $('#confDetail');
  if (selected === null) {
    box.classList.remove('open');
    box.innerHTML = '';
    return;
  }
  const c = locConf(selected);
  box.innerHTML = `
    <article class="detail-card" style="${themeStyle(c)}">
      <button class="detail-close" type="button" data-close aria-label="${T('close')}" title="${T('close')}">✕</button>
      <div class="detail-side">
        <span class="card-numeral">${c.n}</span>
        <div class="detail-photo">${portrait(c)}</div>
        <span class="card-arcana">${c.arc}</span>
        <h3 class="card-name">${c.nome}</h3>
        ${c.attr ? `<span class="attr-tag" style="background:${ATTR_COLORS[c.attr]}">${attrName(c.attr)}</span>` : ''}
      </div>
      <div class="detail-main">
        <div class="info-list">
          <div class="info-row"><span class="lbl">${T('local')}</span><span>${c.local}</span></div>
          <div class="info-row"><span class="lbl">${T('when')}</span><span>${c.quando}</span></div>
          <div class="info-row"><span class="lbl">${T('tip')}</span><span>${c.tip}</span></div>
        </div>
        <div class="sub-tabs" role="tablist">
          <button class="sub-tab-btn active" type="button" data-sub="ranks">${T('ranks')}</button>
          <button class="sub-tab-btn" type="button" data-sub="gifts">${T('gifts')}</button>
        </div>
        <div class="sub-panel active" data-panel="ranks">${rankListHTML(c)}</div>
        <div class="sub-panel" data-panel="gifts"><div class="gift-box">${c.gifts}</div></div>
      </div>
    </article>`;
  box.classList.remove('open');
  void box.offsetWidth; // reinicia a animação de entrada
  box.classList.add('open');
}

function selectCard(idx) {
  selected = selected === idx ? null : idx;
  $$('.conf-card', track).forEach(card => card.classList.toggle('active', Number(card.dataset.idx) === selected));
  renderDetail();
  if (selected !== null) {
    const card = $(`.conf-card[data-idx="${idx}"]`, track);
    card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    $('#confDetail').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }
}

function closeDetail() {
  selected = null;
  renderDetail();
}

$('#confDetail').addEventListener('click', e => {
  if (e.target.closest('[data-close]')) {
    const idx = selected;
    closeDetail();
    $$('.conf-card', track).forEach(card => card.classList.remove('active'));
    const card = $(`.conf-card[data-idx="${idx}"]`, track);
    if (card) card.focus({ preventScroll: true });
    return;
  }
  const tab = e.target.closest('.sub-tab-btn');
  if (!tab) return;
  const box = tab.closest('.detail-main');
  $$('.sub-tab-btn', box).forEach(b => b.classList.toggle('active', b === tab));
  $$('.sub-panel', box).forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.sub));
});

/* Navegação, arrastar com o mouse e barra de progresso */
function scrollStep() {
  const card = $('.conf-card', track);
  return card ? card.offsetWidth + 18 : 260;
}

function updateCarouselUI() {
  const max = track.scrollWidth - track.clientWidth;
  $('#carPrev').disabled = track.scrollLeft <= 4;
  $('#carNext').disabled = track.scrollLeft >= max - 4;
  const ratio = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
  const bar = $('#carBar');
  bar.style.width = `${Math.min(ratio, 1) * 100}%`;
  bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 / Math.min(ratio, 1)) - 1) * 100 : 0}%)`;
}

$('#carPrev').addEventListener('click', () => track.scrollBy({ left: -scrollStep() * 2 }));
$('#carNext').addEventListener('click', () => track.scrollBy({ left: scrollStep() * 2 }));
track.addEventListener('scroll', updateCarouselUI, { passive: true });
window.addEventListener('resize', updateCarouselUI);

let drag = null;
track.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse') return;
  drag = { x: e.clientX, left: track.scrollLeft, moved: false };
});
window.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) > 6) {
    drag.moved = true;
    track.classList.add('dragging');
  }
  if (drag.moved) track.scrollLeft = drag.left - dx;
});
window.addEventListener('pointerup', () => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  track.classList.remove('dragging');
  if (moved) track.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });
});

track.addEventListener('click', e => {
  const card = e.target.closest('.conf-card');
  if (card) selectCard(Number(card.dataset.idx));
});

track.addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const cards = $$('.conf-card', track);
  const pos = cards.indexOf(document.activeElement);
  const next = cards[pos + (e.key === 'ArrowRight' ? 1 : -1)];
  if (next) {
    e.preventDefault();
    next.focus();
    next.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }
});

/* Inclinação 3D seguindo o cursor */
if (!reducedMotion) {
  track.addEventListener('pointermove', e => {
    const card = e.target.closest('.conf-card');
    if (!card || drag?.moved) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
  });
  track.addEventListener('pointerout', e => {
    const card = e.target.closest('.conf-card');
    if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
  });
}

/* ---------- Dicas ---------- */
function renderTips() {
  $('#tipGrid').innerHTML = locTips().map((tp, i) => `
    <div class="tip-card reveal" style="transition-delay:${(i % 4) * 60}ms">
      <div class="tip-num">${String(i + 1).padStart(2, '0')}</div>
      <h4>${tp.t}</h4>
      <p>${tp.d}</p>
    </div>`).join('');
}

/* ---------- Revelar ao rolar ---------- */
const revealer = 'IntersectionObserver' in window && !reducedMotion
  ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 })
  : null;

function observeReveals() {
  $$('.reveal:not(.in)').forEach(el => (revealer ? revealer.observe(el) : el.classList.add('in')));
}

/* ---------- Abas ---------- */
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === btn.dataset.tab));
    if (btn.dataset.tab === 'confidentes') updateCarouselUI();
    observeReveals();
  });
});

/* ---------- Render geral ---------- */
function render() {
  applyStatic();
  renderAttrs();
  renderFilters();
  renderConfidants();
  renderDetail();
  renderTips();
  observeReveals();
}

render();

/* ---------- Player de música ---------- */
(function musicPlayer() {
  const audio = $('#bgAudio');
  const btn = $('#vinylBtn');
  const vol = $('#volumeSlider');
  audio.volume = parseFloat(vol.value);
  let playing = false;

  function play() {
    audio.play().then(() => {
      playing = true;
      btn.classList.add('playing');
    }).catch(() => {
      playing = false;
      btn.classList.remove('playing');
    });
  }
  function pause() {
    audio.pause();
    playing = false;
    btn.classList.remove('playing');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    if (playing) pause(); else play();
  });
  vol.addEventListener('input', () => { audio.volume = parseFloat(vol.value); });

  // Tenta tocar ao carregar; se o navegador bloquear o autoplay, começa na primeira interação.
  play();
  const events = ['click', 'keydown', 'touchstart'];
  function unlock() {
    if (!playing) play();
    events.forEach(ev => document.removeEventListener(ev, unlock));
  }
  events.forEach(ev => document.addEventListener(ev, unlock));
})();
