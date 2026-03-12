/**
 * RIYAJ CHAULAGAIN — Portfolio (UPDATED) · main.js
 * Top nav, project carousels, all animations.
 */
'use strict';

const qs  = (s, c=document) => c.querySelector(s);
const qsa = (s, c=document) => Array.from(c.querySelectorAll(s));
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ── PAGE FADE IN ── */
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';
window.addEventListener('load', () => { document.body.style.opacity = '1'; });

/* ── INJECT STYLES ── */
const inj = document.createElement('style');
inj.textContent = `
  @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
`;
document.head.appendChild(inj);

/* ═══════════════════════════════════════
   SPA NAVIGATION — top nav + sidebar synced
═══════════════════════════════════════ */
const topNavLinks  = qsa('.tnl');       // top nav desktop links
const mobNavLinks  = qsa('.tnl-mob');  // mobile dropdown links
const sections     = qsa('.sec');

function showSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  sections.forEach(s => s.classList.remove('active'));
  topNavLinks.forEach(l => l.classList.remove('active'));
  mobNavLinks.forEach(l => l.classList.remove('active'));

  target.classList.add('active');

  topNavLinks.filter(l => l.dataset.section === id).forEach(l => l.classList.add('active'));
  mobNavLinks.filter(l => l.dataset.section === id).forEach(l => l.classList.add('active'));

  onActivate(id, target);
  history.replaceState(null, '', '#' + id);
  window.scrollTo(0, 0);
  closeMobileNav();
}

// Desktop top nav clicks
topNavLinks.forEach(l => {
  l.addEventListener('click', e => { e.preventDefault(); showSection(l.dataset.section); });
});
// Mobile dropdown nav clicks
mobNavLinks.forEach(l => {
  l.addEventListener('click', e => { e.preventDefault(); showSection(l.dataset.section); });
});

// Logo click
const logo = qs('.topnav-logo');
if (logo) logo.addEventListener('click', e => { e.preventDefault(); showSection('about'); });

// Any [data-section] link anywhere
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-section]');
  if (a && !a.classList.contains('tnl') && !a.classList.contains('tnl-mob')) {
    e.preventDefault(); showSection(a.dataset.section);
  }
});

// Init
showSection(window.location.hash.replace('#', '') || 'about');

/* ═══════════════════════════════════════
   MOBILE NAV TOGGLE (top nav burger)
═══════════════════════════════════════ */
const burger         = qs('#mobBurger');
const mobDropdown    = qs('#mobNavDropdown');
const sidebar        = qs('#sidebar');

function closeMobileNav() {
  if (burger)      burger.classList.remove('open');
  if (mobDropdown) mobDropdown.classList.remove('open');
  if (sidebar)     sidebar.classList.remove('open');
}

if (burger) {
  burger.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = burger.classList.toggle('open');
    // At <=900px the topnav-links are hidden — toggle the dropdown
    if (mobDropdown) mobDropdown.classList.toggle('open', isOpen);
    // At <=768px the sidebar is hidden off-screen — toggle it too
    if (sidebar) sidebar.classList.toggle('open', isOpen);
  });
}
document.addEventListener('click', e => {
  if (!e.target.closest('.topnav') && !e.target.closest('.sidebar')) closeMobileNav();
});

/* ═══════════════════════════════════════
   TYPING ANIMATION (sidebar title)
═══════════════════════════════════════ */
(function initTyping() {
  const el = qs('.sb-title');
  if (!el) return;

  const phrases = [
    'Full-Stack Dev & AI Engineer',
    'React & .NET Developer',
    'AI / ML & LLM Engineer',
    'Cloud & DevOps Engineer',
    '3.96/4.0 GPA',
    'CS Student @ SELU',
  ];

  let pi = 0, ci = 0, del = false, paused = false;

  function tick() {
    if (paused) return;
    const w = phrases[pi];
    if (!del) {
      el.textContent = w.slice(0, ++ci);
      if (ci === w.length) {
        paused = true;
        setTimeout(() => { paused = false; del = true; tick(); }, 2000);
        return;
      }
    } else {
      el.textContent = w.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, del ? 38 : 70);
  }
  setTimeout(tick, 1200);
})();

/* ═══════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════ */
function animateCounter(el) {
  const t = parseInt(el.dataset.target, 10);
  if (isNaN(t)) return;
  const dur = 1500, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * t);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = t;
  };
  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════
   PROFICIENCY BARS
═══════════════════════════════════════ */
function animateBars(ctx) {
  qsa('.pb-fill', ctx).forEach((f, i) => {
    setTimeout(() => { f.style.width = (f.dataset.w || 0) + '%'; }, 150 + i * 100);
  });
}

/* ═══════════════════════════════════════
   STAGGER HELPER
═══════════════════════════════════════ */
function stagger(items, base = 0, step = 65) {
  items.forEach((el, i) => {
    const delay = base + i * step;
    el.style.cssText += `opacity:0;transform:translateY(18px);transition:opacity .4s ease ${delay}ms,transform .4s ease ${delay}ms`;
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, delay + 10);
  });
}

/* ═══════════════════════════════════════
   PROJECT CAROUSELS
═══════════════════════════════════════ */
function buildCarousels() {
  qsa('.pc-carousel').forEach(carousel => {
    const rawData = carousel.dataset.slides;
    if (!rawData) return;
    let slides;
    try { slides = JSON.parse(rawData); } catch(e) { return; }

    carousel.innerHTML = '';

    // Build slides
    slides.forEach((slide, i) => {
      const div = document.createElement('div');
      div.className = 'pc-carousel-slide' + (i === 0 ? ' active' : '');
      div.style.background = slide.color || '#0a0a10';
      div.innerHTML = `<i class="${slide.icon}"></i><span class="slide-label">${slide.label}</span>`;
      carousel.appendChild(div);
    });

    // Dots
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'pc-carousel-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'pc-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
      dotsWrap.appendChild(dot);
    });
    carousel.appendChild(dotsWrap);

    // Arrows
    const prev = document.createElement('button');
    prev.className = 'pc-carousel-prev';
    prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    const next = document.createElement('button');
    next.className = 'pc-carousel-next';
    next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    carousel.appendChild(prev);
    carousel.appendChild(next);

    let current = 0;
    let autoTimer = null;

    function goTo(idx) {
      const allSlides = qsa('.pc-carousel-slide', carousel);
      const allDots   = qsa('.pc-dot', dotsWrap);
      allSlides[current].classList.remove('active');
      allSlides[current].classList.add('exit');
      setTimeout(() => allSlides[current < idx || (current === slides.length-1 && idx === 0) ? current : current].classList.remove('exit'), 500);
      current = (idx + slides.length) % slides.length;
      allSlides.forEach((s, i) => { s.classList.remove('active','exit'); });
      allSlides[current].classList.add('active');
      allDots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => goTo(current + 1), 2800);
    }
    function stopAuto() {
      if (autoTimer) clearInterval(autoTimer);
    }

    prev.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); stopAuto(); startAuto(); });
    next.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); stopAuto(); startAuto(); });

    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    startAuto();
  });
}

/* ═══════════════════════════════════════
   PROJECT FILTER — fixed multi-category + live search
═══════════════════════════════════════ */
(function initFilter() {

  let activeFilter = 'all';
  let searchQuery  = '';

  // --- inject search bar after filter buttons ---
  const filterRow = qs('.proj-filters');
  if (filterRow) {
    const wrap = document.createElement('div');
    wrap.className = 'proj-search-wrap';
    wrap.innerHTML = `
      <span class="proj-search-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
      <input type="text" id="projSearch" class="proj-search-input" placeholder="Search projects…" autocomplete="off"/>
      <button class="proj-search-clear" id="projSearchClear" aria-label="Clear" style="display:none">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    filterRow.insertAdjacentElement('afterend', wrap);

    const inp   = qs('#projSearch');
    const clear = qs('#projSearchClear');

    inp.addEventListener('input', () => {
      searchQuery = inp.value.trim().toLowerCase();
      clear.style.display = searchQuery ? '' : 'none';
      applyFilter();
    });
    clear.addEventListener('click', () => {
      inp.value = ''; searchQuery = '';
      clear.style.display = 'none';
      inp.focus();
      applyFilter();
    });
  }

  // --- core filter logic ---
  function applyFilter() {
    const cards = qsa('.pc');
    let vi = 0; // visible index for stagger

    cards.forEach(card => {
      // parse multi-category: "ai fullstack" → ['ai','fullstack']
      const cats = (card.dataset.cat || '')
        .split(/\s+/).map(s => s.trim()).filter(Boolean);

      // build searchable text from title, sub, and tech tags
      const title = (card.querySelector('.pc-title')?.textContent || '').toLowerCase();
      const sub   = (card.querySelector('.pc-sub')?.textContent   || '').toLowerCase();
      const tags  = Array.from(card.querySelectorAll('.pc-tags span'))
                        .map(s => s.textContent.toLowerCase()).join(' ');
      const body  = title + ' ' + sub + ' ' + tags;

      const catOk  = activeFilter === 'all' || cats.includes(activeFilter);
      const srchOk = !searchQuery || body.includes(searchQuery);

      if (catOk && srchOk) {
        card.classList.remove('hide');
        card.style.display = '';
        const delay = vi * 55;
        card.style.opacity   = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition =
          `opacity .35s ease ${delay}ms, transform .35s ease ${delay}ms, border-color .25s, box-shadow .3s`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
        }));
        vi++;
      } else {
        card.classList.add('hide');
        card.style.display = 'none';
      }
    });

    // empty state
    let empty = qs('#projEmpty');
    if (vi === 0) {
      if (!empty) {
        empty = document.createElement('p');
        empty.id = 'projEmpty';
        empty.style.cssText =
          'grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--tx-4);font-size:.9rem;';
        empty.textContent = 'No projects match — try a different keyword or filter.';
        qs('#projGrid')?.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  }

  // --- filter button clicks ---
  document.addEventListener('click', e => {
    const btn = e.target.closest('.pf');
    if (!btn) return;
    qsa('.pf').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilter();
  });

  // expose for onActivate
  window._applyProjectFilter = applyFilter;

})();

/* ═══════════════════════════════════════
   CARD TILT
═══════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  const card = e.target.closest('.pc, .skc, .stat-card, .cert-card');
  if (!card) return;
  const r  = card.getBoundingClientRect();
  const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -4;
  const ry = ((e.clientX - r.left - r.width /2) / (r.width /2)) *  4;
  card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  card.style.transition = 'transform 0.07s ease';
});
document.addEventListener('mouseleave', e => {
  const card = e.target.closest('.pc, .skc, .stat-card, .cert-card');
  if (!card) return;
  card.style.transform = '';
  card.style.transition = 'transform 0.4s ease, border-color 0.25s ease, box-shadow 0.3s ease';
}, true);

/* ═══════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════ */
document.addEventListener('submit', async e => {
  if (!e.target.closest('#contactForm')) return;
  e.preventDefault();

  const form   = e.target;
  const btn    = qs('#sendBtn');
  const txt    = qs('#sendTxt');
  const load   = qs('#sendLoad');
  const ok     = qs('#formOk');

  const v = id => (qs('#' + id, form)||{}).value || '';
  const name = v('cfn').trim(), email = v('cfe').trim(),
        subj = v('cfs').trim(), type  = v('cft'),
        msg  = v('cfm').trim(), meet  = v('cfmt');

  if (!name || !email || !subj || !msg) {
    form.style.animation = 'shake 0.4s ease';
    setTimeout(() => form.style.animation = '', 500);
    return;
  }

  btn.disabled = true;
  if (txt)  txt.style.display  = 'none';
  if (load) load.style.display = 'flex';

  await wait(650);

  const body = encodeURIComponent(
    `Hi Riyaj,\n\nName: ${name}\nType: ${type||'General'}\n\n${msg}\n\nMeeting preference: ${meet}\n\nBest,\n${name}\n${email}`
  );
  window.location.href = `mailto:criyaj2017@gmail.com?subject=${encodeURIComponent(subj)}&body=${body}`;

  btn.disabled = false;
  if (txt)  txt.style.display  = 'flex';
  if (load) load.style.display = 'none';
  if (ok)  { ok.style.display = 'flex'; setTimeout(() => ok.style.display = 'none', 7000); }
  form.reset();
});

/* ═══════════════════════════════════════
   ON SECTION ACTIVATE — run animations
═══════════════════════════════════════ */
function onActivate(id, sec) {

  if (id === 'about') {
    const counters = qsa('.stat-n[data-target]', sec);
    counters.forEach(el => { el.textContent = '0'; });
    setTimeout(() => counters.forEach(el => animateCounter(el)), 350);

    qsa('.pb-fill', sec).forEach(f => { f.style.width = '0'; f.style.transition = 'none'; });
    setTimeout(() => {
      qsa('.pb-fill', sec).forEach(f => { f.style.transition = 'width 1.3s cubic-bezier(.4,0,.2,1)'; });
      animateBars(sec);
    }, 500);

    stagger(qsa('.skc', sec), 250, 70);
    stagger(qsa('.stat-card', sec), 100, 60);
  }

  if (id === 'resume') {
    stagger(qsa('.tli', sec), 80, 90);
    stagger(qsa('.inv-card', sec), 200, 70);
  }

  if (id === 'projects') {
    qsa('.pc', sec).forEach(c => {
      c.classList.remove('hide');
      c.style.display = '';
    });
    // reset filter buttons to "all"
    qsa('.pf').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    // clear search box if present
    const si = qs('#projSearch');
    const sc = qs('#projSearchClear');
    if (si) { si.value = ''; }
    if (sc) { sc.style.display = 'none'; }
    stagger(qsa('.pc', sec), 80, 60);
    buildCarousels();
    // re-run filter so internal state matches the reset UI
    if (window._applyProjectFilter) setTimeout(window._applyProjectFilter, 0);
  }

  if (id === 'certifications') {
    stagger(qsa('.cert-card', sec), 100, 80);
  }

  if (id === 'contact') {
    stagger(qsa('.cl', sec), 100, 60);
  }
}