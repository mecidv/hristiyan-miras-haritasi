/* Atlas teması (demo): camaltı yüzeyi, imleç haresi, dar ekran menüsü ve "başa dön" düğmesi.
   Camaltı katmanı sabittir: sayfa, camın altına konmuş bir eser gibi görünür; hiçbir şey hareket etmez. */
(function () {
  "use strict";
  const kok = document.documentElement;
  const INCE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (INCE) kok.classList.add("imlec-hare");

  // ---------- Camaltı yüzeyi (sabit cam katmanı) ----------
  const cam = document.createElement("div");
  cam.className = "cam"; cam.setAttribute("aria-hidden", "true");
  cam.innerHTML = '<i class="c-cila"></i><i class="c-genis"></i><i class="c-ince"></i><i class="c-kenar"></i>';
  document.body.appendChild(cam);

  // ---------- Dar ekranlarda menü düğmesi: tüm sayfalara her ekrandan ulaşılır ----------
  (function menu() {
    const ust = document.querySelector(".ust"), nav = ust && ust.querySelector("nav"), sag = ust && ust.querySelector(".ust-sag");
    if (!nav || !sag) return;
    const t = (k, v) => (window.I18N ? window.I18N.t(k) : v);
    const b = document.createElement("button");
    b.type = "button"; b.className = "menu-dugme"; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", "menu-panel");
    b.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 6h13M3.5 10h13M3.5 14h13" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg><span>' + t("menu", "Menü") + "</span>";
    sag.insertBefore(b, sag.firstChild);
    const panel = document.createElement("nav");
    panel.className = "menu-panel"; panel.id = "menu-panel"; panel.hidden = true; panel.setAttribute("aria-label", t("menu", "Menü"));
    nav.querySelectorAll("a").forEach(a => { const k = a.cloneNode(true); k.classList.remove("gizle-mobil"); panel.appendChild(k); });
    ust.appendChild(panel);
    const ac = v => { panel.hidden = !v; b.setAttribute("aria-expanded", String(v)); };
    b.addEventListener("click", e => { e.stopPropagation(); ac(panel.hidden); });
    panel.addEventListener("click", e => { if (e.target.closest("a")) ac(false); });
    document.addEventListener("click", e => { if (!panel.hidden && !panel.contains(e.target)) ac(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { ac(false); b.focus(); } });
  })();

  // ---------- Başa dön (uzun sayfalarda) ----------
  if (document.body.classList.contains("giris") || document.body.classList.contains("td")) {
    const t = (k, v) => (window.I18N ? window.I18N.t(k) : v);
    const b = document.createElement("button");
    b.type = "button"; b.className = "basa-don"; b.setAttribute("aria-label", t("basa_don", "Başa dön"));
    b.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 12.5 10 7.5l5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(b);
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: azalt ? "auto" : "smooth" }));
    const guncelle = () => b.classList.toggle("gorunur", window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", guncelle, { passive: true }); guncelle();
  }
})();
