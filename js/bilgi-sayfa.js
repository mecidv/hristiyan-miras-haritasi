/* Hakkında, Ekip ve İletişim sayfaları: metinler ana sayfadakiyle aynı kaynaktan (Ortak.metinler) gelir.
   Sayfa <body data-sayfa="hakkinda|ekip|iletisim"> ile seçilir. */
(function () {
  "use strict";
  const Ortak = window.Ortak, I = window.I18N, T = I.t, EN = I.en;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sayfa = document.body.dataset.sayfa;
  const TURLER = ["Kilise", "Manastır", "Şapel"], TUR_RENK = { "Kilise": "#24497F", "Manastır": "#A33A26", "Şapel": "#A87412" };
  I.uygula(); I.baglantiDil();
  const BASLIK = { hakkinda: "p_baslik", ekip: "e_baslik", iletisim: "il_baslik" }[sayfa];
  document.title = `${T(BASLIK)} | ${T("giris_title")}`;

  function kisi(p) {
    const ad = Ortak.m(p + "_ad"), unvan = Ortak.m(p + "_unvan"), oz = Ortak.m(p + "_ozgecmis"), foto = Ortak.m(p + "_foto"), link = Ortak.m(p + "_baglanti");
    const bas = ad.replace(/^((Prof|Doç|Dr|Öğr|Üyesi|Arş|Gör)\.?\s*)+/g, "").split(/\s+/).filter(Boolean);
    const harf = ((bas[0] || "")[0] || "") + ((bas[bas.length - 1] || "")[0] || "");
    return `<article class="kisi">
      <span class="kisi-hare">${foto ? `<img class="kisi-foto" src="${esc(foto)}${/^img\//.test(foto) && !foto.includes("?") ? "?v=3" : ""}" alt="${esc(ad)}" width="120" height="120">` : `<div class="kisi-foto" aria-hidden="true">${esc(harf)}</div>`}</span>
      <div><h3>${esc(ad)}</h3>${unvan ? `<p class="unvan">${esc(unvan)}</p>` : ""}${oz ? `<p>${esc(oz)}</p>` : ""}
      ${link ? `<p><a href="${esc(link)}" target="_blank" rel="noopener">${esc(T("e_profil"))}</a></p>` : ""}</div>
    </article>`;
  }
  function iller() {
    const Y = window.YAPILAR || [], say = {};
    Y.forEach(y => { const s = say[y.il] || (say[y.il] = { n: 0, "Kilise": 0, "Manastır": 0, "Şapel": 0 }); s.n++; s[y.tur]++; });
    const sira = Object.entries(say).sort((a, b) => b[1].n - a[1].n).slice(0, 8), max = sira.length ? sira[0][1].n : 1;
    return sira.map(([il, s]) => `<li><a href="harita.html?il=${encodeURIComponent(il)}${EN ? "&lang=en" : ""}"><span class="il-ad">${esc(il)}</span><span class="il-n">${s.n}</span>
      <span class="bar">${TURLER.filter(t => s[t]).map(t => `<i style="width:${(s[t] / max) * 100}%;background:${TUR_RENK[t]}"></i>`).join("")}</span></a></li>`).join("");
  }
  function ciz() {
    document.querySelectorAll("[data-metin]").forEach(el => { el.textContent = Ortak.m(el.getAttribute("data-metin")); });
    if (sayfa === "hakkinda") { const o = $("#il-sira"); if (o) o.innerHTML = iller(); }
    if (sayfa === "ekip") $("#ekip-kartlar").innerHTML = kisi("yazar") + kisi("danisman");
    if (sayfa === "iletisim") {
      const ep = Ortak.m("iletisim_eposta"), site = Ortak.m("kisisel_site"), prof = Ortak.m("yazar_baglanti");
      const satir = (etiket, href, yazi) => `<li><span>${esc(T(etiket))}</span><a href="${esc(href)}"${/^mailto:/.test(href) ? "" : ' target="_blank" rel="noopener"'}>${esc(yazi)}</a></li>`;
      $("#iletisim-liste").innerHTML = [ep && satir("il_eposta", "mailto:" + ep, ep), site && satir("il_site", site, site.replace(/^https?:\/\//, "")), prof && satir("il_akademik", prof, prof.replace(/^https?:\/\//, ""))].filter(Boolean).join("");
    }
  }
  ciz();
  Ortak.yukle().then(() => ciz());
})();
