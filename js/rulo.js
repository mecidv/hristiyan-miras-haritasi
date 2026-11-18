/* Yeni menü (açılır gruplar), parşömen rulo açılışı ve harita açılışı. */
(function () {
  "use strict";
  const EN = !!(window.I18N && window.I18N.en);
  const L = (tr, en) => (EN ? en : tr);
  const AZALT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Dil değiştirilerek yeniden açılan sayfada açılış animasyonu tekrarlanmaz
  const GECIS = !!(window.I18N && window.I18N.gecis);
  const burasi = location.pathname.split("/").pop() || "index.html";
  const ok = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---------- Menü ----------
  const MENU = [
    { ad: L("Proje", "Project"), alt: [
      { ad: L("Hakkında", "About"), href: "index.html#proje" },
      { ad: L("Proje ekibi", "Project team"), href: "index.html#ekip" },
      { ad: L("Tasarım dili", "Design language"), href: "tasarim-dili.html" },
      { ad: L("SSS", "FAQ"), href: "sss.html" },
      { ad: L("İletişim", "Contact"), href: "index.html#iletisim" } ] },
    { ad: L("Haritayı keşfet", "Explore the map"), alt: [
      { ad: L("Harita", "Map"), not: L("Tüm kayıtlar, il ve ilçelere göre", "All records by province and district"), href: "harita.html" },
      { ad: L("Dikkat çeken yapılar", "Notable buildings"), not: L("27 yapı, dört tema", "27 buildings, four themes"), href: "dikkat-ceken-yapilar.html" },
      { ad: L("Dönüşen yapılar", "Repurposed buildings"), not: L("Yakında", "Coming soon"), href: "#", yakinda: true },
      { ad: L("Tur programlarındaki yapılar", "Buildings in tour programmes"), not: L("Yakında", "Coming soon"), href: "#", yakinda: true } ] },
    { ad: L("Tarihsel bağlam", "Historical context"), href: "tarihsel-baglam.html" },
    { ad: L("Atıf", "Citation"), href: "index.html#atif" }
  ];
  // İngilizce arayüzde dil bağlantılarda taşınır
  const dh = (h) => { if (!EN || !h || h === "#") return h; const [y, hs] = h.split("#"); return y + (y.includes("?") ? "&" : "?") + "lang=en" + (hs ? "#" + hs : ""); };
  const secili = (href) => href && href !== "#" && href.split("#")[0].split("/").pop() === burasi && !href.includes("#");
  (function menuKur() {
    const nav = document.querySelector(".ust nav"); if (!nav) return;
    nav.classList.add("nav-grup");
    nav.innerHTML = MENU.map((g, i) => {
      if (!g.alt) return `<a href="${dh(g.href)}"${secili(g.href) ? ' aria-current="page"' : ""}>${g.ad}</a>`;
      const icinde = g.alt.some(a => secili(a.href));
      return `<div class="acilir${icinde ? " secili" : ""}"><button type="button" aria-expanded="false" aria-controls="acilir-${i}">${g.ad}${ok}</button>
        <div class="acilir-liste" id="acilir-${i}">${g.alt.map(a => `<a href="${dh(a.href)}"${a.yakinda ? ' class="yakinda" aria-disabled="true" tabindex="-1"' : ""}${secili(a.href) ? ' aria-current="page"' : ""}>${a.ad}${a.not ? `<small>${a.not}</small>` : ""}</a>`).join("")}</div></div>`;
    }).join("");
    const kapat = (haric) => nav.querySelectorAll(".acilir.acik").forEach(x => { if (x !== haric) { x.classList.remove("acik"); x.querySelector("button").setAttribute("aria-expanded", "false"); } });
    nav.querySelectorAll(".acilir").forEach(g => {
      const b = g.querySelector("button");
      let hoverActi = 0;
      b.addEventListener("click", e => {
        e.stopPropagation();
        // Fareyle üzerine gelince açılmış menüye hemen ardından tıklamak onu kapatmasın
        if (g.classList.contains("acik") && Date.now() - hoverActi < 700) return;
        const ac = !g.classList.contains("acik"); kapat(g); g.classList.toggle("acik", ac); b.setAttribute("aria-expanded", String(ac));
      });
      if (window.matchMedia("(hover: hover)").matches) {
        let t; g.addEventListener("mouseenter", () => { clearTimeout(t); if (!g.classList.contains("acik")) hoverActi = Date.now(); kapat(g); g.classList.add("acik"); b.setAttribute("aria-expanded", "true"); });
        g.addEventListener("mouseleave", () => { t = setTimeout(() => { g.classList.remove("acik"); b.setAttribute("aria-expanded", "false"); }, 220); });
      }
      g.addEventListener("focusout", e => { if (!g.contains(e.relatedTarget)) setTimeout(() => { if (!g.contains(document.activeElement)) { g.classList.remove("acik"); b.setAttribute("aria-expanded", "false"); } }, 0); });
    });
    // Haritanın kendisi tıklamaları yutabildiği için kapanma, yakalama aşamasında pointerdown ile dinlenir
    document.addEventListener("pointerdown", e => { if (!nav.contains(e.target)) kapat(); }, true);
    document.addEventListener("click", e => { if (!nav.contains(e.target)) kapat(); }, true);
    window.addEventListener("blur", () => kapat());
    window.addEventListener("scroll", () => kapat(), { passive: true });
    document.addEventListener("keydown", e => { if (e.key === "Escape") kapat(); });
  })();
  // Dar ekran menüsü (atlas.js düz bir liste kurar): grup başlıklarıyla yeniden kur
  function panelKur() {
    const p = document.getElementById("menu-panel"); if (!p) return false;
    p.innerHTML = MENU.map(g => g.alt
      ? `<p class="mp-baslik">${g.ad}</p>` + g.alt.map(a => a.yakinda
          ? `<span class="mp-yakinda" aria-disabled="true">${a.ad}<small>${a.not}</small></span>`
          : `<a href="${dh(a.href)}"${secili(a.href) ? ' aria-current="page"' : ""}>${a.ad}</a>`).join("")
      : `<a href="${dh(g.href)}"${secili(g.href) ? ' aria-current="page"' : ""}>${g.ad}</a>`).join("");
    return true;
  }
  if (!panelKur()) document.addEventListener("DOMContentLoaded", panelKur);
  window.addEventListener("load", panelKur);

  // ---------- Parşömen rulo açılışı ----------
  function ruloAc(rulo) {
    const yaprak = rulo.querySelector(".rulo-yaprak"), alt = rulo.querySelector(".rulo-alt"), ust = rulo.querySelector(".rulo-ust");
    if (!yaprak || !alt || AZALT || GECIS || !yaprak.animate) return;
    const tam = yaprak.offsetHeight;
    const gorunen = Math.max(260, Math.min(tam, window.innerHeight - yaprak.getBoundingClientRect().top - 24));
    const bas = ust.offsetHeight - 6;
    rulo.classList.add("aciliyor");
    const sure = 1150, egri = "cubic-bezier(.33,.0,.2,1)";
    const a1 = yaprak.animate([{ clipPath: `inset(0 0 ${tam}px 0)` }, { clipPath: `inset(0 0 ${Math.max(0, tam - gorunen)}px 0)` }], { duration: sure, easing: egri, fill: "forwards" });
    alt.animate([{ transform: `translateY(${bas}px)` }, { transform: `translateY(${bas + gorunen}px)` }], { duration: sure, easing: egri, fill: "forwards" });
    // Rulo açılırken sarmal desen döner gibi kayar
    alt.animate([{ backgroundPosition: "0 0, 0 0" }, { backgroundPosition: "0 0, 0 -60px" }], { duration: sure, easing: egri });
    const bitir = () => {
      yaprak.getAnimations().forEach(x => x.cancel()); alt.getAnimations().forEach(x => x.cancel());
      rulo.classList.remove("aciliyor");
    };
    a1.finished.then(() => {
      if (tam <= gorunen + 2) { bitir(); return; }
      // Görünen kısım açıldı; alt rulo ekranın altından aşağı kayıp sayfa sonundaki yerine geçer
      const kay = alt.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" });
      kay.finished.then(() => { bitir(); alt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); });
    });
    // Ziyaretçi beklemek istemezse: tıklama ya da kaydırma açılışı hemen tamamlar
    const atla = () => { if (rulo.classList.contains("aciliyor")) { a1.finish(); } };
    window.addEventListener("wheel", atla, { once: true, passive: true });
    window.addEventListener("touchmove", atla, { once: true, passive: true });
    rulo.addEventListener("click", atla, { once: true });
  }
  window.RuloAc = ruloAc;

  // ---------- Harita: soldan sağa açılan yatay bir rulo; iki dikey çubuk çerçeve olarak kalır ----------
  function haritaAc() {
    const harita = document.getElementById("map"); if (!harita) return;
    const kap = harita.closest(".map-wrap") || harita.parentElement;
    const sol = document.createElement("div"), sag = document.createElement("div");
    sol.className = "harita-rulo-cubuk sol"; sag.className = "harita-rulo-cubuk sag";
    sol.setAttribute("aria-hidden", "true"); sag.setAttribute("aria-hidden", "true");
    kap.append(sol, sag);
    if (AZALT || GECIS || !harita.animate) return;
    const gen = kap.clientWidth - sag.offsetWidth;
    const sure = 1300, egri = "cubic-bezier(.33,.0,.2,1)";
    harita.animate([{ clipPath: `inset(0 ${gen}px 0 0)` }, { clipPath: "inset(0 0 0 0)" }], { duration: sure, easing: egri });
    sag.animate([{ transform: `translateX(${-gen}px)` }, { transform: "translateX(0)" }], { duration: sure, easing: egri });
    const lej = document.getElementById("legend");
    if (lej) lej.animate([{ opacity: 0 }, { opacity: 0, offset: .7 }, { opacity: 1 }], { duration: sure + 200 });
  }

  // ---------- Lejant: kapanınca yaprak iki çubuğun arasına sarılır, açılınca yeniden açılır ----------
  function lejantKatla() {
    const lej = document.getElementById("legend"); if (!lej) return;
    lej.addEventListener("click", e => {
      const ozet = e.target.closest("summary"); if (!ozet || AZALT) return;
      const d = ozet.parentElement; if (!d.animate) return;
      e.preventDefault();
      if (lej.classList.contains("katlaniyor")) return;
      const h1 = d.offsetHeight, w1 = lej.offsetWidth;
      d.open = !d.open;                       // app.js "toggle" olayıyla tercihi kaydeder
      const h2 = d.offsetHeight, w2 = lej.offsetWidth, kapaniyor = !d.open;
      lej.classList.add("katlaniyor");
      const egri = "cubic-bezier(.33,.0,.2,1)";
      const en = (a, b, sure) => (Math.abs(a - b) < 2 ? Promise.resolve() : lej.animate([{ width: a + "px" }, { width: b + "px" }], { duration: sure, easing: egri }).finished);
      const boy = (a, b, sure) => d.animate([{ height: a + "px" }, { height: b + "px" }], { duration: sure, easing: egri }).finished;
      if (kapaniyor) {
        // Önce yaprak çubukların arasına sarılır, sonra rulo daralır
        d.open = true; lej.style.width = w1 + "px";
        boy(h1, h2, 420).then(() => { d.open = false; lej.style.width = ""; return en(w1, w2, 220); })
          .then(() => lej.classList.remove("katlaniyor"));
      } else {
        // Önce rulo genişler, sonra yaprak aşağı doğru açılır
        lej.style.width = w2 + "px"; d.style.height = h1 + "px";
        en(w1, w2, 220).then(() => { d.style.height = ""; return boy(h1, h2, 520); })
          .then(() => { lej.style.width = ""; lej.classList.remove("katlaniyor"); });
      }
    });
  }

  // ---------- Bilgi kutuları: açılırken bir çubuk yukarıdan aşağı inerek yaprağı açar ----------
  function kutuAc(el) {
    if (AZALT || !el.animate) return;
    const r = el.getBoundingClientRect(); if (!r.height) return;
    const boy = Math.min(r.height, window.innerHeight - r.top);
    const sure = Math.round(Math.min(620, 300 + boy * .45)), egri = "cubic-bezier(.33,.0,.2,1)";
    el.animate([{ clipPath: `inset(0 0 ${Math.max(0, r.height - 22)}px 0)` }, { clipPath: `inset(0 0 ${Math.max(0, r.height - boy)}px 0)` }], { duration: sure, easing: egri });
    const c = document.createElement("div"); c.className = "gecici-cubuk"; c.setAttribute("aria-hidden", "true");
    Object.assign(c.style, { left: r.left + "px", width: r.width + "px", top: r.top + "px" });
    (el.tagName === "DIALOG" ? el : document.body).appendChild(c);
    if (el.tagName === "DIALOG") Object.assign(c.style, { position: "fixed" });
    c.animate([{ transform: "translateY(0)" }, { transform: `translateY(${boy - 22}px)` }], { duration: sure, easing: egri, fill: "forwards" })
      .finished.then(() => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).finished.then(() => c.remove()));
  }
  function kutulariIzle() {
    const cek = document.getElementById("drawer"), pen = document.getElementById("modal");
    if (cek) new MutationObserver(() => { if (!cek.hidden) requestAnimationFrame(() => kutuAc(cek)); }).observe(cek, { attributes: true, attributeFilter: ["hidden"] });
    if (pen) new MutationObserver(() => { if (pen.open) requestAnimationFrame(() => kutuAc(pen)); }).observe(pen, { attributes: true, attributeFilter: ["open"] });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-rulo]").forEach(r => window.requestAnimationFrame(() => ruloAc(r)));
    if (document.getElementById("map")) { haritaAc(); lejantKatla(); kutulariIzle(); }
  });
})();
