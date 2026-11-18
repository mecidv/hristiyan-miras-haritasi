/* DEMO 3: yeni menü (açılır gruplar), parşömen rulo açılışı ve harita açılışı.
   Sayfalar <base href="../"> ile kök klasördeki ortak dosyaları kullanır; bu yüzden bağlantılar köke göredir. */
(function () {
  "use strict";
  const EN = !!(window.I18N && window.I18N.en);
  const L = (tr, en) => (EN ? en : tr);
  const AZALT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      { ad: L("Harita", "Map"), not: L("622 kayıt, il ve ilçelere göre", "622 records by province and district"), href: "demo3/harita.html" },
      { ad: L("Dikkat çeken yapılar", "Notable buildings"), not: L("27 yapı, dört tema", "27 buildings, four themes"), href: "demo3/dikkat-ceken-yapilar.html" },
      { ad: L("Dönüşen yapılar", "Repurposed buildings"), not: L("Yakında", "Coming soon"), href: "#", yakinda: true },
      { ad: L("Tur programlarındaki yapılar", "Buildings in tour programmes"), not: L("Yakında", "Coming soon"), href: "#", yakinda: true } ] },
    { ad: L("Tarihsel bağlam", "Historical context"), href: "tarihsel-baglam.html" },
    { ad: L("Atıf", "Citation"), href: "index.html#atif" }
  ];
  const secili = (href) => href && href !== "#" && href.split("#")[0].split("/").pop() === burasi && !href.includes("#");
  (function menuKur() {
    const nav = document.querySelector(".ust nav"); if (!nav) return;
    nav.classList.add("nav-grup");
    nav.innerHTML = MENU.map((g, i) => {
      if (!g.alt) return `<a href="${g.href}"${secili(g.href) ? ' aria-current="page"' : ""}>${g.ad}</a>`;
      const icinde = g.alt.some(a => secili(a.href));
      return `<div class="acilir${icinde ? " secili" : ""}"><button type="button" aria-expanded="false" aria-controls="acilir-${i}">${g.ad}${ok}</button>
        <div class="acilir-liste" id="acilir-${i}">${g.alt.map(a => `<a href="${a.href}"${a.yakinda ? ' class="yakinda" aria-disabled="true" tabindex="-1"' : ""}${secili(a.href) ? ' aria-current="page"' : ""}>${a.ad}${a.not ? `<small>${a.not}</small>` : ""}</a>`).join("")}</div></div>`;
    }).join("");
    const kapat = (haric) => nav.querySelectorAll(".acilir.acik").forEach(x => { if (x !== haric) { x.classList.remove("acik"); x.querySelector("button").setAttribute("aria-expanded", "false"); } });
    nav.querySelectorAll(".acilir").forEach(g => {
      const b = g.querySelector("button");
      b.addEventListener("click", e => { e.stopPropagation(); const ac = !g.classList.contains("acik"); kapat(g); g.classList.toggle("acik", ac); b.setAttribute("aria-expanded", String(ac)); });
      if (window.matchMedia("(hover: hover)").matches) {
        let t; g.addEventListener("mouseenter", () => { clearTimeout(t); kapat(g); g.classList.add("acik"); b.setAttribute("aria-expanded", "true"); });
        g.addEventListener("mouseleave", () => { t = setTimeout(() => { g.classList.remove("acik"); b.setAttribute("aria-expanded", "false"); }, 220); });
      }
    });
    document.addEventListener("click", e => { if (!nav.contains(e.target)) kapat(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") kapat(); });
  })();
  // Dar ekran menüsü (atlas.js düz bir liste kurar): grup başlıklarıyla yeniden kur
  function panelKur() {
    const p = document.getElementById("menu-panel"); if (!p) return false;
    p.innerHTML = MENU.map(g => g.alt
      ? `<p class="mp-baslik">${g.ad}</p>` + g.alt.filter(a => !a.yakinda).map(a => `<a href="${a.href}"${secili(a.href) ? ' aria-current="page"' : ""}>${a.ad}</a>`).join("")
      : `<a href="${g.href}"${secili(g.href) ? ' aria-current="page"' : ""}>${g.ad}</a>`).join("");
    return true;
  }
  if (!panelKur()) document.addEventListener("DOMContentLoaded", panelKur);
  window.addEventListener("load", panelKur);

  // ---------- Parşömen rulo açılışı ----------
  function ruloAc(rulo) {
    const yaprak = rulo.querySelector(".rulo-yaprak"), alt = rulo.querySelector(".rulo-alt"), ust = rulo.querySelector(".rulo-ust");
    if (!yaprak || !alt || AZALT || !yaprak.animate) return;
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

  // ---------- Harita açılışı: soldan sağa açılan yatay bir rulo ----------
  function haritaAc() {
    const harita = document.getElementById("map"); if (!harita || AZALT || !harita.animate) return;
    const kap = harita.parentElement; if (getComputedStyle(kap).position === "static") kap.style.position = "relative";
    const r = harita.getBoundingClientRect(), k = kap.getBoundingClientRect();
    const sol = document.createElement("div"), sag = document.createElement("div");
    [sol, sag].forEach(c => { c.className = "harita-rulo-cubuk"; c.style.top = (r.top - k.top) + "px"; c.style.height = r.height + "px"; c.style.bottom = "auto"; kap.appendChild(c); });
    const x0 = r.left - k.left - 13, gen = r.width;
    sol.style.left = x0 + "px"; sag.style.left = x0 + "px";
    const sure = 1300, egri = "cubic-bezier(.33,.0,.2,1)";
    harita.animate([{ clipPath: `inset(0 ${gen}px 0 0)` }, { clipPath: "inset(0 0 0 0)" }], { duration: sure, easing: egri });
    const a = sag.animate([{ transform: "translateX(0)" }, { transform: `translateX(${gen}px)` }], { duration: sure, easing: egri, fill: "forwards" });
    a.finished.then(() => {
      [sol, sag].forEach(c => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" }).finished.then(() => c.remove()));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-rulo]").forEach(r => window.requestAnimationFrame(() => ruloAc(r)));
    if (document.getElementById("map")) haritaAc();
  });
})();
