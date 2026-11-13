(() => {
  "use strict";
  // The design animations always run (Windows "Animation effects: off" would otherwise hide
  // them all). Visitors who ask for reduced motion only lose the hero photo drift.
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reduceMotion = false;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const navH = () => document.querySelector(".nav")?.offsetHeight || 64;

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === "function") {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollToEl = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -(navH() + 16) });
    else if (target === 0) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#main") return; // skip link keeps native focus behaviour
    const target = id === "#top" ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    scrollToEl(target);
    history.replaceState(null, "", id === "#top" ? location.pathname : id);
  });

  /* ---------- Mobile nav: fullscreen curtain ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    links.querySelectorAll("a").forEach((a, n) => a.style.setProperty("--n", n));
    const setOpen = (open) => {
      links.classList.toggle("open", open);
      nav.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
      if (lenis) open ? lenis.stop() : lenis.start();
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
    links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && links.classList.contains("open")) setOpen(false); });
    window.matchMedia("(min-width: 861px)").addEventListener("change", (m) => { if (m.matches) setOpen(false); });
  }

  /* ---------- Reveals: one config everywhere (0.6s ease-out, fires 20% into view, once) ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    // Word-stagger headings
    document.querySelectorAll(".section-title, .contact-title, .case-title").forEach((h) => {
      const words = h.textContent.trim().split(/\s+/);
      h.setAttribute("aria-label", h.textContent.trim());
      h.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--i:${i}">${w}</span>`).join(" ");
      h.classList.add("split");
    });
    // Block reveals, siblings staggered by 0.1s
    const groups = [
      ".proof > div", ".about-copy > p:not(.about-big)", ".about-side", ".logo-marquee",
      ".section-dek", ".tl-item", ".case-text", ".case .gallery", ".card", ".moment",
      ".skill", ".edu > *", ".contact-lede", ".contact-links"
    ];
    groups.forEach((sel) => {
      const els = document.querySelectorAll(sel);
      els.forEach((el) => {
        el.classList.add("reveal");
        const sibs = Array.from(el.parentElement.children).filter((c) => c.matches(sel));
        el.style.setProperty("--d", Math.min(sibs.indexOf(el), 5) * 0.1 + "s");
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -20% 0px" });
    document.querySelectorAll(".reveal, .split").forEach((el) => io.observe(el));
  }

  /* ---------- Scroll-linked effects: hero photo exit-parallax + About reading word-fill ---------- */
  if (!reduceMotion) {
    const photo = prefersReduced ? null : document.querySelector(".hero-photo img");
    const big = document.querySelector(".about-big");
    let fillWords = [];
    if (big) {
      big.innerHTML = big.textContent.trim().split(/\s+/).map((w) => `<span class="fw">${w}</span>`).join(" ");
      fillWords = Array.from(big.querySelectorAll(".fw"));
    }
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      if (photo) {
        const y = Math.min(window.scrollY, vh);
        photo.style.transform = `translateY(${y * 0.12}px) scale(${1 + y / vh * 0.08})`;
      }
      if (fillWords.length) {
        const r = big.getBoundingClientRect();
        // progress 0 when the paragraph top hits 80% of the viewport, 1 when it reaches 30%
        const p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (vh * 0.5)));
        const n = fillWords.length;
        fillWords.forEach((w, i) => {
          const local = Math.max(0, Math.min(1, p * n - i));
          w.style.opacity = (0.15 + 0.85 * local).toFixed(3);
        });
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------- Magnetic buttons (desktop pointer only, spring 150 / 15) ---------- */
  if (!reduceMotion && finePointer) {
    document.querySelectorAll(".btn-primary, .nav-cta, .contact-mail").forEach((el) => {
      el.classList.add("magnetic");
      let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, running = false;
      const k = 150, c = 15, dt = 1 / 60;
      const step = () => {
        vx += (k * (tx - x) - c * vx) * dt; vy += (k * (ty - y) - c * vy) * dt;
        x += vx * dt; y += vy * dt;
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
        if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(vx) + Math.abs(vy) > 0.05) requestAnimationFrame(step);
        else { running = false; if (!tx && !ty) el.style.transform = ""; }
      };
      const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.15;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.15;
        kick();
      });
      el.addEventListener("mouseleave", () => { tx = 0; ty = 0; kick(); });
    });
  }

  /* ---------- Project carousels: same size for every project ---------- */
  const ARROW = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
  const STAGE_RATIO = 16 / 11;
  document.querySelectorAll(".case .gallery").forEach((g) => {
    const shots = Array.from(g.querySelectorAll(".shot"));
    if (shots.length < 2) return;
    const title = g.closest(".case").querySelector(".case-title")?.getAttribute("aria-label") || g.closest(".case").querySelector(".case-title")?.textContent || "Project";
    g.classList.add("carousel");
    g.innerHTML = `
      <div class="cz-stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${title} photos">
        <div class="cz-track"></div>
        <span class="cz-hint">Click to enlarge</span>
        <button type="button" class="cz-nav cz-prev" aria-label="Previous photo">${ARROW("M15 18l-6-6 6-6")}</button>
        <button type="button" class="cz-nav cz-next" aria-label="Next photo">${ARROW("M9 6l6 6-6 6")}</button>
      </div>
      <div class="cz-meta"><span class="cz-count"></span><p class="cz-cap" aria-live="polite"></p></div>
      <div class="cz-progress" aria-hidden="true"><i></i></div>
      <div class="cz-thumbs" role="group" aria-label="Choose a photo"></div>`;
    const stage = g.querySelector(".cz-stage"), track = g.querySelector(".cz-track");
    const count = g.querySelector(".cz-count"), cap = g.querySelector(".cz-cap");
    const bar = g.querySelector(".cz-progress i"), thumbs = g.querySelector(".cz-thumbs");
    const n = shots.length, pad = (v) => String(v).padStart(2, "0");

    shots.forEach((s, k) => {
      track.appendChild(s);
      s.setAttribute("aria-label", `Enlarge photo ${k + 1} of ${n}`);
      const img = s.querySelector("img");
      img.loading = "eager";
      s.style.setProperty("--bg", `url("${img.getAttribute("src")}")`);
      const fit = () => {
        const a = img.naturalWidth / img.naturalHeight;
        if (a && Math.abs(a - STAGE_RATIO) / STAGE_RATIO > 0.2) s.classList.add("is-contain");
      };
      img.complete ? fit() : img.addEventListener("load", fit, { once: true });
      const t = document.createElement("button");
      t.type = "button"; t.className = "cz-thumb";
      t.setAttribute("aria-label", `Show photo ${k + 1}`);
      t.innerHTML = `<img src="${img.getAttribute("src")}" alt="" loading="lazy">`;
      t.addEventListener("click", () => go(k, true));
      thumbs.appendChild(t);
    });

    let i = 0;
    const go = (k, user) => {
      i = (k + n) % n;
      track.style.transform = `translate3d(${-i * 100}%, 0, 0)`;
      shots.forEach((s, j) => { s.classList.toggle("is-active", j === i); s.tabIndex = j === i ? 0 : -1; });
      thumbs.querySelectorAll(".cz-thumb").forEach((t, j) => t.setAttribute("aria-current", String(j === i)));
      const active = thumbs.children[i];
      thumbs.scrollTo({ left: active.offsetLeft - thumbs.clientWidth / 2 + active.offsetWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
      count.innerHTML = `<b>${pad(i + 1)}</b> / ${pad(n)}`;
      cap.textContent = shots[i].dataset.cap || shots[i].querySelector("img").alt;
      cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap");
      // restart the autoplay progress bar
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
      if (user) hold = true; // a manual choice stops autoplay for this carousel
      sync();
    };
    g.querySelector(".cz-prev").addEventListener("click", (e) => { e.stopPropagation(); go(i - 1, true); });
    g.querySelector(".cz-next").addEventListener("click", (e) => { e.stopPropagation(); go(i + 1, true); });
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1, true); }
    });

    // Autoplay: only while on screen, not hovered or focused, and never with reduced motion
    let visible = false, hover = false, hold = reduceMotion;
    const sync = () => {
      const play = visible && !hold;
      g.classList.toggle("playing", play);
      g.classList.toggle("paused", play && hover);
    };
    bar.addEventListener("animationend", () => { if (g.classList.contains("playing")) go(i + 1, false); });
    stage.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = true; sync(); } });
    stage.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hover = false; sync(); } });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }, { threshold: 0.5 }).observe(stage);

    // Drag / swipe
    // Horizontal drags move the carousel; vertical ones are left to the page so phones scroll normally.
    let x0 = null, y0 = 0, dx = 0, dragged = false, pid = null;
    stage.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest(".cz-nav")) return;
      x0 = e.clientX; y0 = e.clientY; dx = 0; dragged = false; pid = e.pointerId;
    });
    stage.addEventListener("pointermove", (e) => {
      if (x0 === null || e.pointerId !== pid) return;
      dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (!dragged) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { x0 = null; return; } // page scroll wins
        if (Math.abs(dx) > 8) { dragged = true; stage.classList.add("dragging"); try { stage.setPointerCapture(pid); } catch (_) {} }
      }
      if (dragged) {
        const max = stage.clientWidth * 0.6;
        const d = Math.max(-max, Math.min(max, dx));
        track.style.transform = `translate3d(calc(${-i * 100}% + ${d}px), 0, 0)`;
      }
    });
    const endDrag = (cancelled) => {
      if (x0 === null && !dragged) return;
      x0 = null; stage.classList.remove("dragging");
      if (dragged) {
        go(!cancelled && Math.abs(dx) > stage.clientWidth * 0.12 ? i + (dx < 0 ? 1 : -1) : i, true);
        setTimeout(() => { dragged = false; }, 60); // swallow only the click that ends this drag
      }
    };
    stage.addEventListener("pointerup", () => endDrag(false));
    stage.addEventListener("pointercancel", () => endDrag(true));
    stage.addEventListener("lostpointercapture", () => { if (stage.classList.contains("dragging")) endDrag(false); });
    // a drag should not also open the lightbox
    stage.addEventListener("click", (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);

    go(0, false);
  });

  /* ---------- Logo marquee: duplicate the row so the loop is seamless ---------- */
  const lm = document.querySelector(".logo-marquee");
  if (lm && !reduceMotion) {
    const row = lm.querySelector(".logo-row");
    const track = document.createElement("div");
    track.className = "logo-track";
    for (let i = 0; i < 4; i++) {
      const copy = row.cloneNode(true);
      if (i > 0) { copy.setAttribute("aria-hidden", "true"); copy.querySelectorAll("img").forEach((im) => (im.alt = "")); }
      track.appendChild(copy);
    }
    row.replaceWith(track);
    lm.classList.add("is-moving");
    // Same speed on every screen: duration comes from the distance travelled, not a fixed time
    const PX_PER_SEC = 70;
    const setSpeed = () => {
      const half = track.scrollWidth / 2;
      if (half) track.style.animationDuration = (half / PX_PER_SEC).toFixed(1) + "s";
    };
    setSpeed();
    // re-measure whenever the strip changes size (logos finishing loading, rotation, resize)
    if ("ResizeObserver" in window) new ResizeObserver(() => setSpeed()).observe(track);
    track.querySelectorAll("img").forEach((im) => { if (!im.complete) im.addEventListener("load", setSpeed, { once: true }); });
    window.addEventListener("load", setSpeed);
    window.addEventListener("resize", setSpeed);
    window.addEventListener("orientationchange", setSpeed);
  }

  /* ---------- Theme: Light / Dark, with a circular reveal from the toggle ----------
     First visit follows the device; once the visitor picks one, that choice is remembered. */
  const root = document.documentElement;
  const sw = document.querySelector(".theme-switch");
  const picks = document.querySelectorAll("[data-theme-pick]");
  const POS = { light: 0, dark: 1 };
  const deviceDark = window.matchMedia("(prefers-color-scheme: dark)");
  const metaTheme = () => {
    const bg = getComputedStyle(root).getPropertyValue("--paper").trim();
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", bg));
  };
  const setMode = (mode, save) => {
    root.setAttribute("data-theme", mode);
    if (sw) sw.style.setProperty("--pos", POS[mode]);
    picks.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themePick === mode)));
    if (save) { try { localStorage.setItem("theme", mode); } catch (e) {} }
    metaTheme();
    window.dispatchEvent(new Event("themechange"));
  };
  picks.forEach((b) => b.addEventListener("click", () => {
    const mode = b.dataset.themePick;
    if (root.getAttribute("data-theme") === mode) return;
    if (!document.startViewTransition || prefersReduced) return setMode(mode, true);
    const r = b.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(() => setMode(mode, true));
    t.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(.65, 0, .35, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {});
  }));
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  setMode(saved in POS ? saved : (deviceDark.matches ? "dark" : "light"), false);
  deviceDark.addEventListener("change", (m) => {
    let chosen = null;
    try { chosen = localStorage.getItem("theme"); } catch (e) {}
    if (!(chosen in POS)) setMode(m.matches ? "dark" : "light", false);
  });

  /* ---------- Footer: auto-fit wordmark + reveal from behind ---------- */
  const fr = document.querySelector(".footer-reveal");
  const mark = document.querySelector(".wordmark");
  if (fr && mark) {
    const fit = () => {
      const inner = mark.parentElement;
      const cs = getComputedStyle(inner);
      const avail = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      mark.style.fontSize = "100px";
      const w = mark.scrollWidth;
      if (w) mark.style.fontSize = (avail / w * 100 * 0.995).toFixed(2) + "px";
      if (!reduceMotion) {
        const footer = fr.querySelector(".footer");
        fr.style.setProperty("--footer-h", footer.offsetHeight + "px");
        // Only pin the footer when it fits on screen, otherwise it would be cut off
        fr.classList.toggle("is-fixed", footer.offsetHeight < window.innerHeight * 0.9);
      }
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    window.addEventListener("resize", fit);
    window.addEventListener("themechange", () => requestAnimationFrame(fit));
  }

  const $ = (id) => document.getElementById(id);

  /* ---------- Lightbox ---------- */
  const lb = $("lightbox"), lbImg = $("lb-img"), lbCap = $("lb-cap");
  const shots = Array.from(document.querySelectorAll(".shot"));
  let idx = 0, lastFocus = null;
  const show = (n) => {
    idx = (n + shots.length) % shots.length;
    const img = shots[idx].querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = shots[idx].dataset.cap || img.alt;
  };
  const open = (n) => {
    lastFocus = document.activeElement;
    show(n);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (lenis) lenis.stop();
    lb.querySelector(".lb-close").focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    if (lastFocus) lastFocus.focus();
  };
  shots.forEach((s, n) => s.addEventListener("click", () => open(n)));
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "ArrowLeft") show(idx - 1);
  });
  let sx = null;
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();
