/* Tanıtım sayfası */
(function () {
  "use strict";
  const Ortak = window.Ortak;
  const I = window.I18N, T = I.t, EN = I.en;
  const C = window.CEVIRI_EN || {};
  const ILLER = window.ILLER || [];
  let YAPILAR = window.YAPILAR || [];
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => n.toLocaleString(EN ? "en-GB" : "tr-TR");
  const norm = (s) => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const TURLER = ["Kilise", "Manastır", "Şapel"];
  const TUR_RENK = { "Kilise": "#24497F", "Manastır": "#A33A26", "Şapel": "#A87412" };
  const TUR_SINIF = { "Kilise": "kilise", "Manastır": "manastir", "Şapel": "sapel" };
  const ISLEV = [
    ["İbadete açık", "#2A9D8F"], ["Müze / ören yeri", "#E9A23B"], ["Cami", "#5B8FD6"],
    ["Kültür-sanat / kütüphane", "#A07CC5"], ["Terk edilmiş / harabe", "#8C9AA1"], ["Diğer / bilinmiyor", "#C5CED3"]
  ];
  const RAMP = ["#EFDCAE", "#E0BF7E", "#CFA05A", "#B98041", "#9A602D", "#74431F"];
  const BREAKS = [1, 2, 4, 8, 15, 30];
  const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  I.uygula(); I.baglantiDil();
  if (EN) document.title = T("giris_title");
  $("#lisans-metin").innerHTML = esc(T("l_metin", { lisans: "\u0000" })).replace("\u0000", `<a href="https://creativecommons.org/licenses/by/4.0/${EN ? "" : "deed.tr"}" target="_blank" rel="noopener">${esc(T("l_lisans"))}</a>`);

  // ---------- Rakamlar: görünür olunca YouTube tarzı dönen sayaç ----------
  let sayacGoster = false;
  function sayaclariCalistir() {
    document.querySelectorAll(".rakamlar [data-deger]").forEach((el, i) => Ortak.sayac(el, Number(el.dataset.deger), { sure: 1300 + i * 40 }));
  }
  function rakamlar() {
    const say = (f) => YAPILAR.filter(f).length;
    const il = new Set(YAPILAR.map(y => y.il)).size;
    const kalem = [[YAPILAR.length, T("kayit"), ""], [il, T("il_kucuk"), ""]].concat(TURLER.map(t => [say(y => y.tur === t), T("tur_cok_" + t), t]));
    $("#tur-rakam").innerHTML = kalem.map(([n, a, t]) => `<div><dt>${t ? Ortak.ikon(t) : ""}${esc(a)}</dt><dd data-deger="${n}">${sayacGoster ? "" : fmt(n)}</dd></div>`).join("");

    const top = YAPILAR.length || 1;
    const ad = (k) => EN ? (C.ISLEV_KAT[k] || k) : k;
    const parca = ISLEV.map(([k, r]) => [k, r, say(y => y.islevKat === k)]).filter(p => p[2]);
    $("#kullanim-cubuk").innerHTML = parca.map(([k, r, n]) => `<i style="width:${(n / top) * 100}%;background:${r}" title="${esc(ad(k))}: ${n}"></i>`).join("");
    $("#kullanim-cubuk").setAttribute("aria-label", parca.map(([k, , n]) => `${ad(k)}: ${n}`).join(", "));
    $("#kullanim-lejant").innerHTML = parca.map(([k, r, n]) => `<li><i style="background:${r}"></i>${esc(ad(k))} <b data-deger="${n}">${sayacGoster ? "" : fmt(n)}</b></li>`).join("");
    if (sayacGoster) sayaclariCalistir();

    const ilSay = {};
    YAPILAR.forEach(y => { const s = ilSay[y.il] || (ilSay[y.il] = { n: 0, "Kilise": 0, "Manastır": 0, "Şapel": 0 }); s.n++; s[y.tur]++; });
    const sira = Object.entries(ilSay).sort((a, b) => b[1].n - a[1].n).slice(0, 8);
    const max = sira.length ? sira[0][1].n : 1;
    if ($("#il-sira")) $("#il-sira").innerHTML = sira.map(([il, s]) => `<li><a href="harita.html?il=${encodeURIComponent(il)}${EN ? "&lang=en" : ""}">
      <span class="il-ad">${esc(il)}</span><span class="il-n">${s.n}</span>
      <span class="bar">${TURLER.filter(t => s[t]).map(t => `<i style="width:${(s[t] / max) * 100}%;background:${TUR_RENK[t]}"></i>`).join("")}</span></a></li>`).join("");
    return ilSay;
  }

  // ---------- Metinler ----------
  function metinler() {
    document.querySelectorAll("[data-metin]").forEach(el => { el.textContent = Ortak.m(el.getAttribute("data-metin")); });
    const kisi = (p) => {
      const ad = Ortak.m(p + "_ad"), unvan = Ortak.m(p + "_unvan"), oz = Ortak.m(p + "_ozgecmis"), foto = Ortak.m(p + "_foto"), link = Ortak.m(p + "_baglanti");
      const bas = ad.replace(/^((Prof|Doç|Dr|Öğr|Üyesi|Arş|Gör)\.?\s*)+/g, "").split(/\s+/).filter(Boolean);
      const harf = ((bas[0] || "")[0] || "") + ((bas[bas.length - 1] || "")[0] || "");
      return `<article class="kisi">
        <span class="kisi-hare">${foto ? `<img class="kisi-foto" src="${esc(foto)}${/^img\//.test(foto) && !foto.includes("?") ? "?v=3" : ""}" alt="${esc(ad)}" width="120" height="120">` : `<div class="kisi-foto" aria-hidden="true">${esc(harf)}</div>`}</span>
        <div><h3>${esc(ad)}</h3>${unvan ? `<p class="unvan">${esc(unvan)}</p>` : ""}${oz ? `<p>${esc(oz)}</p>` : ""}
        ${link ? `<p><a href="${esc(link)}" target="_blank" rel="noopener">${esc(T("e_profil"))}</a></p>` : ""}</div>
      </article>`;
    };
    if ($("#ekip-kartlar")) $("#ekip-kartlar").innerHTML = kisi("yazar") + kisi("danisman");
    $("#atif-kutu").innerHTML = Ortak.atifHtml(esc);
    // İletişim bölümü
    const ep = Ortak.m("iletisim_eposta"), site = Ortak.m("kisisel_site"), prof = Ortak.m("yazar_baglanti");
    const satir = (etiket, href, yazi) => `<li><span>${esc(T(etiket))}</span><a href="${esc(href)}"${/^mailto:/.test(href) ? "" : ' target="_blank" rel="noopener"'}>${esc(yazi)}</a></li>`;
    if ($("#iletisim-liste")) $("#iletisim-liste").innerHTML = [
      ep && satir("il_eposta", "mailto:" + ep, ep),
      site && satir("il_site", site, site.replace(/^https?:\/\//, "")),
      prof && satir("il_akademik", prof, prof.replace(/^https?:\/\//, ""))
    ].filter(Boolean).join("");
    // Footer: sitenin temel aldığı tezin künyesi
    $("#tez-kunye").innerHTML = Ortak.tezKunye();
  }

  // ---------- Kahraman haritası ----------
  const B = { lng0: 19.2, lng1: 47.6, lat0: 33.2, lat1: 46.4 };   // Türkiye ile birlikte Balkanlar, Karadeniz ve Kafkasya
  const KX = 100 * Math.cos(39 * Math.PI / 180), KY = 100;
  const px = (lng, lat) => [((lng - B.lng0) * KX).toFixed(1), ((B.lat1 - lat) * KY).toFixed(1)];
  const W = ((B.lng1 - B.lng0) * KX).toFixed(0), H = ((B.lat1 - B.lat0) * KY).toFixed(0);
  const RAMP_KOYU = ["#22356F", "#2C4690", "#3A5BAE", "#5174C6", "#7090D8", "#9DB4EA"];
  const koyu = () => document.documentElement.dataset.tema === "koyu";
  function renk(n) { if (!n) return koyu() ? "#16224A" : "#EFE3C6"; let i = 0; while (i < BREAKS.length - 1 && n >= BREAKS[i + 1]) i++; return (koyu() ? RAMP_KOYU : RAMP)[i]; }
  // Tema değişince giriş haritasındaki il renkleri de güncellenir
  window.addEventListener("temadegisti", () => document.querySelectorAll("#kahraman-harita [data-il]").forEach(el => { if (el.style.fill) el.style.fill = renk(ilSay[el.dataset.il] && ilSay[el.dataset.il].n); }));

  // Komşu ülkeler: world-atlas (Natural Earth, kamu malı) 1:50m verisi. Yüklenemezse harita yalnız Türkiye'yi gösterir.
  async function komsulariCiz(g) {
    let topo;
    try { const r = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"); if (!r.ok) return; topo = await r.json(); } catch (e) { return; }
    const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
    const yaylar = topo.arcs.map(a => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
    const yay = i => i >= 0 ? yaylar[i] : yaylar[~i].slice().reverse();
    const halka = ids => { const o = []; ids.forEach((i, k) => { const a = yay(i); o.push(...(k ? a.slice(1) : a)); }); return o; };
    const kutuda = h => h.some(([x, y]) => x > B.lng0 - 3 && x < B.lng1 + 3 && y > B.lat0 - 3 && y < B.lat1 + 3);
    let d = "";
    topo.objects.countries.geometries.forEach(geo => {
      if (geo.id === "792") return;   // Türkiye il sınırlarıyla ayrıca çiziliyor
      const polys = geo.type === "Polygon" ? [geo.arcs] : geo.type === "MultiPolygon" ? geo.arcs : [];
      polys.forEach(p => p.map(halka).forEach(h => { if (kutuda(h)) d += "M" + h.map(([x, y]) => px(x, y).join(",")).join("L") + "Z"; }));
    });
    if (d) { g.innerHTML = `<path class="komsu" d="${d}"></path>`; requestAnimationFrame(() => g.classList.add("gorunur")); }
  }

  async function kahraman(ilSay) {
    const kap = $("#kahraman-harita");
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const yazi = (k, lng, lat, size) => { const [x, y] = px(lng, lat); return `<text class="deniz-yazi" x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${esc(T(k))}</text>`; };
    const ulkeYazi = ([tr, en, lng, lat]) => { const [x, y] = px(lng, lat); return `<text class="ulke-yazi" x="${x}" y="${y}" text-anchor="middle">${esc(EN ? en : tr)}</text>`; };
    const ULKELER = [["Yunanistan", "Greece", 23.9, 39.6], ["Bulgaristan", "Bulgaria", 25.2, 42.85], ["Romanya", "Romania", 25.6, 45.75], ["Ukrayna", "Ukraine", 31.2, 46.15], ["Rusya", "Russia", 40.8, 45.6],
      ["Gürcistan", "Georgia", 43.6, 42.2], ["Ermenistan", "Armenia", 45.0, 40.25], ["Azerbaycan", "Azerbaijan", 47.0, 40.7], ["İran", "Iran", 46.6, 37.9], ["Irak", "Iraq", 43.6, 35.1], ["Suriye", "Syria", 38.6, 34.9], ["Kıbrıs", "Cyprus", 33.2, 34.75], ["Lübnan", "Lebanon", 35.6, 33.55]];
    // Kuzey Kıbrıs Türk Cumhuriyeti: adanın kuzeyinde, kısaltmasıyla
    const KKTC = EN ? "TRNC" : "KKTC";
    svg.innerHTML = `<g id="g-komsu"></g><g id="g-iller"></g><g id="g-nokta"></g>` + ULKELER.map(ulkeYazi).join("")
      + `<text class="ulke-yazi kktc-yazi" x="${px(33.55, 35.42)[0]}" y="${px(33.55, 35.42)[1]}" text-anchor="middle">${KKTC}</text>`
      + `<text class="kita-yazi" x="${px(23.5, 44.15)[0]}" y="${px(23.5, 44.15)[1]}" text-anchor="middle">${esc(EN ? "EUROPE" : "AVRUPA")}</text>`
      + yazi("deniz_karadeniz", 34.6, 43.0, 42) + yazi("deniz_akdeniz", 30.4, 34.6, 40) + yazi("deniz_ege", 25.1, 38.2, 30);
    kap.appendChild(svg);
    komsulariCiz(svg.querySelector("#g-komsu"));

    let geo = null;
    for (const url of ["data/iller.json?v=1", "https://cdn.jsdelivr.net/gh/cihadturhan/tr-geojson@master/geo/tr-cities-utf8.json"]) {
      try { const r = await fetch(url); if (r.ok) { geo = await r.json(); break; } } catch (e) { geo = null; }
    }
    const alias = { "afyon": "Afyonkarahisar" };
    const ilAdi = Object.fromEntries(ILLER.map(i => [norm(i.ad), i.ad]));
    const gIl = svg.querySelector("#g-iller");
    if (geo && geo.features) {
      const parcalar = geo.features.map(f => {
        const ad = ilAdi[norm(f.properties.name)] || alias[norm(f.properties.name)] || f.properties.name;
        const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
        let d = "", sx = 0, sn = 0;
        polys.forEach(p => { d += "M" + p[0].map(([lng, lat]) => { sx += lng; sn++; return px(lng, lat).join(","); }).join("L") + "Z"; });
        return { ad, d, merkez: sx / sn };
      }).sort((a, b) => a.merkez - b.merkez);
      gIl.innerHTML = parcalar.map(p => `<path class="il" pathLength="1" d="${p.d}" data-il="${esc(p.ad)}"></path>`).join("");
      const yollar = Array.from(gIl.querySelectorAll(".il"));
      yollar.forEach((el, i) => {
        if (azalt) { el.style.strokeDashoffset = 0; el.style.fill = renk(ilSay[el.dataset.il] && ilSay[el.dataset.il].n); return; }
        el.style.animationDelay = (i * 14) + "ms"; el.classList.add("ciz");
      });
      if (!azalt) setTimeout(() => yollar.forEach(el => { el.classList.add("dolu"); el.style.fill = renk(ilSay[el.dataset.il] && ilSay[el.dataset.il].n); }), 1500);
    }

    // Noktalar <canvas> üzerinde çizilir: 622 öğe tek bir yüzeyde, her karede akıcı
    const sirali = YAPILAR.slice().sort((a, b) => a.lng - b.lng);
    const RENK = { "Kilise": "#24497F", "Manastır": "#A33A26", "Şapel": "#A87412" };
    const cv = document.createElement("canvas"); kap.appendChild(cv);
    const ctx = cv.getContext("2d");
    let olcek = 1, ox = 0, oy = 0;
    function boyutla() {
      const sr = svg.getBoundingClientRect(), kr = kap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      // preserveAspectRatio=meet: içerik kutunun ortasına sığdırılır
      olcek = Math.min(sr.width / W, sr.height / H);
      ox = sr.left - kr.left + (sr.width - W * olcek) / 2; oy = sr.top - kr.top + (sr.height - H * olcek) / 2;
      cv.style.left = ox + "px"; cv.style.top = oy + "px"; cv.style.width = W * olcek + "px"; cv.style.height = H * olcek + "px";
      cv.width = Math.round(W * olcek * dpr); cv.height = Math.round(H * olcek * dpr);
      ctx.setTransform(dpr * olcek, 0, 0, dpr * olcek, 0, 0);
    }
    const noktalar = sirali.map((y, i) => { const [x, yy] = px(y.lng, y.lat); return { x: +x, y: +yy, tur: y.tur, bas: (geo ? 1100 : 200) + i * 2.4 }; });
    function sekil(n, olc, alfa) {
      const r = (4.2 / olcek) * olc; // ekranda ~4 piksel
      ctx.globalAlpha = alfa; ctx.fillStyle = RENK[n.tur]; ctx.strokeStyle = document.documentElement.dataset.tema === "koyu" ? "#0B1530" : "#F7EDD6"; ctx.lineWidth = 1.2 / olcek;
      ctx.beginPath();
      if (n.tur === "Manastır") ctx.rect(n.x - r, n.y - r, 2 * r, 2 * r);
      else if (n.tur === "Şapel") { ctx.moveTo(n.x, n.y - r * 1.3); ctx.lineTo(n.x + r * 1.3, n.y); ctx.lineTo(n.x, n.y + r * 1.3); ctx.lineTo(n.x - r * 1.3, n.y); ctx.closePath(); }
      else ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    function ciz(simdi) {
      ctx.clearRect(0, 0, W, H);
      let devam = false;
      for (const n of noktalar) {
        const t = azalt ? 1 : (simdi - basla - n.bas) / 500;
        if (t <= 0) { devam = true; continue; }
        const p = Math.min(1, t); if (p < 1) devam = true;
        const e = 1 - Math.pow(1 - p, 3);
        sekil(n, 1 + 1.4 * (1 - e), e);
      }
      ctx.globalAlpha = 1;
      if (devam) requestAnimationFrame(ciz);
    }
    boyutla();
    const basla = performance.now();
    requestAnimationFrame(ciz);
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { boyutla(); ciz(performance.now() + 1e6); }, 120); });
    kap.classList.add("hazir");
    kap.addEventListener("click", () => { location.href = "harita.html" + (EN ? "?lang=en" : ""); });
    kap.classList.add("tiklanir");
  }

  // ---------- Başlat ----------
  Ortak.atifBagla($("#atif-kutu"));
  const sayacKullan = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window;
  let ilSay = rakamlar();
  if (sayacKullan) {
    // Rakamlar sıfırda bekler; bölüm görünür olunca dönerek gerçek değere gelir
    document.querySelectorAll(".rakamlar [data-deger]").forEach(el => { el.textContent = "0"; });
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); sayacGoster = true; sayaclariCalistir(); } }, { threshold: 0.15 });
    io.observe($(".rakamlar"));
  }
  // Kahraman kartındaki cümle: sayılar ilk ekranda dönerek gelir
  (function kahramanSayac() {
    const kayit = YAPILAR.length, il = new Set(YAPILAR.map(y => y.il)).size;
    const kutu = $("#kartus-alt");
    kutu.innerHTML = esc(T("h_alt")).replace("{il}", `<b class="kahraman-sayi" data-k="${il}"></b>`).replace("{kayit}", `<b class="kahraman-sayi" data-k="${kayit}"></b>`);
    const sayilar = kutu.querySelectorAll("[data-k]");
    if (!sayacKullan) { sayilar.forEach(b => { b.textContent = fmt(Number(b.dataset.k)); }); return; }
    sayilar.forEach(b => { b.textContent = "0"; });
    setTimeout(() => sayilar.forEach((b, i) => Ortak.sayac(b, Number(b.dataset.k), { sure: 1600 + i * 150 })), 500);
  })();
  metinler();
  kahraman(ilSay);
  Ortak.siteBilgi($("#site-bilgi"), true);
  Ortak.yukle().then(liste => {
    Ortak.siteBilgi($("#site-bilgi"), true);
    if (liste) { const yeni = Ortak.normalize(liste, ILLER); if (yeni.length >= 50) { YAPILAR = yeni; ilSay = rakamlar(); } }
    metinler();
  });
})();
