(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  /* ---------- Typing roles ---------- */
  const typed = document.querySelector(".typed");
  if (typed && !reduceMotion) {
    const roles = typed.dataset.roles.split("|");
    let r = 0, i = roles[0].length, deleting = true;
    const tick = () => {
      if (deleting) {
        i--;
        typed.textContent = roles[r].slice(0, i);
        if (i <= 0) { deleting = false; r = (r + 1) % roles.length; }
        return setTimeout(tick, 38);
      }
      i++;
      typed.textContent = roles[r].slice(0, i);
      if (i >= roles[r].length) { deleting = true; return setTimeout(tick, 2200); }
      setTimeout(tick, 70);
    };
    setTimeout(tick, 2600);
  }

  /* ---------- Weather ---------- */
  // Snapshot used when a live request isn't possible (for example inside a sandboxed preview).
  const SNAPSHOT = {
    asOf: "Nov 12, 2026",
    temp: 73, code: 0, isDay: true,
    days: [
      { d: "Fri", hi: 67, lo: 38, code: 0 },
      { d: "Sat", hi: 60, lo: 40, code: 1 },
      { d: "Sun", hi: 60, lo: 44, code: 61 }
    ]
  };
  const ICONS = {
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.3 3.3 0 0 0 7 18z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M7 15h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.3 3.3 0 0 0 7 15z"/><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/></svg>',
    storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.6 1.6A3.3 3.3 0 0 0 7 15z"/><path d="M12.5 15l-2 3.5h3l-2 3.5"/></svg>',
    fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9h16M3 13h18M5 17h14"/></svg>'
  };
  // WMO weather codes (Open-Meteo)
  const describe = (code, isDay = true) => {
    if (code === 0) return { text: isDay ? "Sunny" : "Clear", icon: isDay ? "sun" : "moon" };
    if (code <= 2) return { text: "Partly cloudy", icon: isDay ? "sun" : "moon" };
    if (code === 3) return { text: "Overcast", icon: "cloud" };
    if (code === 45 || code === 48) return { text: "Foggy", icon: "fog" };
    if (code >= 95) return { text: "Thunderstorms", icon: "storm" };
    if (code >= 51 && code <= 82) return { text: code >= 80 ? "Showers" : "Rain", icon: "rain" };
    return { text: "Cloudy", icon: "cloud" };
  };

  const $ = (id) => document.getElementById(id);
  const render = (w, live) => {
    const desc = describe(w.code, w.isDay);
    $("wx-icon").innerHTML = ICONS[desc.icon];
    $("wx-temp").textContent = Math.round(w.temp) + "°F";
    $("wx-cond").textContent = desc.text;
    $("wx-days").innerHTML = w.days.map(d =>
      `<div class="wx-day"><b>${d.d}</b>${Math.round(d.hi)}° / ${Math.round(d.lo)}° ${describe(d.code).text.toLowerCase()}</div>`
    ).join("");
    const status = $("wx-status");
    status.textContent = live ? "Live" : "As of " + w.asOf;
    status.classList.toggle("is-snapshot", !live);
    return desc.text;
  };

  const fetchLive = async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    try {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=30.5044&longitude=-90.4612" +
        "&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min" +
        "&temperature_unit=fahrenheit&timezone=America%2FChicago&forecast_days=4";
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error("weather " + res.status);
      const j = await res.json();
      const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        temp: j.current.temperature_2m, code: j.current.weather_code, isDay: !!j.current.is_day,
        days: [1, 2, 3].map(k => ({
          d: names[new Date(j.daily.time[k] + "T12:00").getDay()],
          hi: j.daily.temperature_2m_max[k], lo: j.daily.temperature_2m_min[k], code: j.daily.weather_code[k]
        }))
      };
    } finally { clearTimeout(t); }
  };

  // Hand-written fallback lines, used until (or instead of) the Claude caption.
  const localCaption = (temp, text) => {
    const t = Math.round(temp);
    if (/thunder/i.test(text)) return `${t}° and thundering. The Pi stays unplugged and the laptop stays charged.`;
    if (/rain|shower/i.test(text)) return `Rain on campus, which means extra hours in the lab. Nobody’s complaining.`;
    if (/fog/i.test(text)) return `Foggy enough that even YOLOv8 would want a second opinion.`;
    if (t >= 88) return `${t}° of Louisiana humidity. The GPUs are not the only things overheating.`;
    if (t <= 45) return `${t}° counts as winter down here. Hoodie on, terminal open.`;
    if (/sunny|clear/i.test(text)) return `${t}° and clear. Good light for testing a camera that has to see the sidewalk.`;
    return `${t}° and ${text.toLowerCase()} in Hammond. Ideal debugging weather, honestly.`;
  };

  const askClaude = async (temp, text) => {
    if (!window.claude || typeof window.claude.use !== "function") return null;
    const sample = await window.claude.use("sample");
    if (!sample) return null;
    const prompt =
      "Write one witty, warm one-liner (max 22 words) for a weather card on the personal portfolio of Riyaj, " +
      "a computer science student in Hammond, Louisiana who builds AI apps and assistive hardware like a smart walking stick. " +
      `Current weather: ${Math.round(temp)}°F and ${text}. ` +
      "Reference the weather specifically. No hashtags, no emoji, no quotation marks. Reply with the line only.";
    const out = await sample(prompt, { model: "claude-sonnet-4-6", modelTier: "quick" });
    const line = (out && out.text || "").trim().replace(/^["“]|["”]$/g, "");
    return line || null;
  };

  (async () => {
    let w = SNAPSHOT, live = false;
    try { w = await fetchLive(); live = true; } catch (_) { /* sandbox or offline: use snapshot */ }
    const text = render(w, live);
    const cap = $("wx-caption");
    cap.textContent = localCaption(w.temp, text);
    try {
      const line = await askClaude(w.temp, text);
      if (line) cap.textContent = line;
    } catch (_) { /* keep the hand-written line */ }
  })();

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
    lb.querySelector(".lb-close").focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
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
