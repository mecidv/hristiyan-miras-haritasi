/* Türkiye İnanç Turizmi Yaşayan Envanter Projesi — harita sayfası */
(function () {
  "use strict";

  const CFG = window.SITE_CONFIG || {};
  const I = window.I18N, T = I.t, EN = I.en;
  const C = window.CEVIRI_EN || {};
  const Ortak = window.Ortak;
  let YAPILAR = window.YAPILAR || [];
  const ILLER = window.ILLER || [];
  const TURLER = ["Kilise", "Manastır", "Şapel"];
  const TUR_COLOR = { "Kilise": "#24497F", "Manastır": "#A33A26", "Şapel": "#A87412" };
  // Piri Reis: parşömen üzerinde sepya mürekkep yıkaması
  const RAMP_ACIK = ["#EFDCAE", "#E0BF7E", "#CFA05A", "#B98041", "#9A602D", "#74431F"];
  // Lapis Lazuli: derin ultramarinden açık maviye; açık renkli yazılar okunaklı kalır
  const RAMP_KOYU = ["#22356F", "#2C4690", "#3A5BAE", "#5174C6", "#7090D8", "#9DB4EA"];
  // Haritadaki çizgi ve dolgu renkleri temaya göre değişir
  const koyuMu = () => document.documentElement.dataset.tema === "koyu";
  const rampa = () => koyuMu() ? RAMP_KOYU : RAMP_ACIK;
  const HR = () => koyuMu()
    ? { cizgi: "#8C9BC8", disari: "#0A1229", disariCizgi: "#2A3A6E", vurgu: "#F0D27A", ilce: "#C9D2EE", bos: "#16224A", ilceSecili: "#F0D27A", ilcePerde: "#0A1229" }
    : { cizgi: "#6B4E2E", disari: "#F1E6CC", disariCizgi: "#B39C72", vurgu: "#8E2C18", ilce: "#5C4630", bos: "#EFE3C6", ilceSecili: "#8E2C18", ilcePerde: "#F1E6CC" };
  const BREAKS = [1, 2, 4, 8, 15, 30];
  const ISLEV_SIRA = ["İbadete açık", "Müze / ören yeri", "Cami", "Kültür-sanat / kütüphane", "Terk edilmiş / harabe", "Diğer / bilinmiyor"];
  const BOLGELER = ["Marmara", "Ege", "Akdeniz", "İç Anadolu", "Karadeniz", "Doğu Anadolu", "Güneydoğu Anadolu"];
  const AZALT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TURKIYE = [[35.8, 25.6], [42.15, 44.8]];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
  const fmt = (n) => n.toLocaleString(EN ? "en-GB" : "tr-TR");

  // Dile göre gösterim
  const turAd = (t) => T("tur_" + t);
  const islevAd = (y) => EN && C.islev ? C.islev(y.islev) : y.islev;
  const durumAd = (y) => EN && C.durum ? C.durum(y.durum).metin : y.durum;
  const islevKatAd = (k) => EN ? (C.ISLEV_KAT[k] || k) : k;
  const toplulukAd = (k) => EN ? (C.TOPLULUK[k] || k) : k;
  const bolgeAd = (k) => EN ? (C.BOLGE[k] || k) : k;
  const hassKey = (h) => "hass_" + (/^Yapı/.test(h) ? "Yapı" : /^Köy/.test(h) ? "Köy" : /^İlçe/.test(h) ? "İlçe" : /^İl /.test(h) ? "İl" : "Ziyaretçi");
  const konumMetni = (y) => [y.il, y.ilce, y.yer].filter(Boolean).join(", ");

  I.uygula(); I.baglantiDil();
  if (EN) { $("#pusula-k").textContent = "N"; document.title = T("harita_title"); }

  // Yerleşik İngilizce ad (yalnızca İngilizce Vikipedi'de maddesi olan yapılar; data/ad-en.js)
  const AD_EN = window.AD_EN || {};
  const enAd = (y) => (AD_EN[y.no] ? AD_EN[y.no][0] : "");
  const araHazirla = () => YAPILAR.forEach(y => { y._ara = norm([y.ad, enAd(y), y.il, y.ilce, y.yer, y.islev, EN ? islevAd(y) : ""].join(" ")); });
  araHazirla();

  // ---------------- Harita ----------------
  const map = L.map("map", { zoomControl: true, minZoom: 5, maxZoom: 18, zoomSnap: 0.25, worldCopyJump: false }).fitBounds(TURKIYE);
  // Yakınlaşma/uçuş sürerken imleç altındaki katmanlar vurgu ve ipucu üretmesin (titremeyi önler)
  let ucusSigorta = 0;
  map.on("zoomstart", () => { map.getContainer().classList.add("ucusta"); clearTimeout(ucusSigorta); ucusSigorta = setTimeout(() => map.getContainer().classList.remove("ucusta"), 2600); });
  map.on("zoomend moveend", () => map.getContainer().classList.remove("ucusta"));
  map.setMaxBounds([[33, 20], [45, 50]]);
  const ACILIS_Z = map.getZoom();
  const ALTLIK_URL = {
    acik: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    koyu: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
  };
  const altlikSade = L.tileLayer(ALTLIK_URL[document.documentElement.dataset.tema === "koyu" ? "koyu" : "acik"], {
    attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap | <a href="https://www.geoboundaries.org">geoBoundaries</a> (ODbL)',
    maxNativeZoom: 16, maxZoom: 18, className: "altlik-sade"
  }).addTo(map);
  const altlikAyrintili = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19, className: "altlik-ayrintili"
  });
  L.control.layers({ [T("altlik_sade")]: altlikSade, [T("altlik_ayrintili")]: altlikAyrintili }, null, { position: "topright" }).addTo(map);

  map.createPane("iller"); map.getPane("iller").style.zIndex = 350;
  map.createPane("ilEtiket"); map.getPane("ilEtiket").style.zIndex = 450; map.getPane("ilEtiket").style.pointerEvents = "none";

  // ---------------- Portolan katmanı: rüzgâr gülleri ve rüzgâr çizgileri ----------------
  // Portolan geleneği: 8 ana rüzgâr siyah, 8 yarım rüzgâr yeşil, 16 çeyrek rüzgâr kırmızı mürekkeple.
  // Web haritası Mercator izdüşümünde olduğundan sabit yönlü çizgiler (loksodromlar) burada düz görünür.
  map.createPane("portolan"); map.getPane("portolan").style.zIndex = 345; map.getPane("portolan").style.pointerEvents = "none";
  const GULLER = [[43.3, 34.4], [34.6, 31.2]];   // Karadeniz ve Doğu Akdeniz
  const portolan = L.layerGroup().addTo(map);
  function gulSvg() {
    const uc = (a, l, w, sinif) => `<g transform="rotate(${a})"><path class="ga" d="M0 0L0 -${l}L-${w} -${w}Z"/><path class="${sinif}" d="M0 0L0 -${l}L${w} -${w}Z"/></g>`;
    let g = "";
    for (let i = 0; i < 8; i++) g += uc(22.5 + i * 45, 46, 7, "gy");
    for (let i = 0; i < 4; i++) g += uc(45 + i * 90, 66, 10, "gm");
    for (let i = 0; i < 4; i++) g += uc(i * 90, 92, 13, "gk");
    return `<svg viewBox="-110 -110 220 220" aria-hidden="true"><circle class="gc" r="76"/><circle class="gc ince" r="71"/><circle class="gc ince" r="30"/>${g}<circle class="gm-orta" r="5"/><text class="gn" y="-97" text-anchor="middle">${EN ? "N" : "K"}</text></svg>`;
  }
  const kerteRenk = i => { const k = koyuMu(); return i % 4 === 0 ? (k ? "#E9DFC4" : "#2E2014") : i % 2 === 0 ? (k ? "#7CC79A" : "#2F6B3F") : (k ? "#E58A6C" : "#A8321E"); };
  function portolanCiz() {
    portolan.clearLayers();
    const z0 = 6, d = 2600, svg = gulSvg();
    GULLER.forEach(g => {
      const p0 = map.project(g, z0);
      for (let i = 0; i < 32; i++) {
        const a = i * Math.PI / 16;
        const uc = map.unproject(L.point(p0.x + Math.sin(a) * d, p0.y - Math.cos(a) * d), z0);
        L.polyline([g, uc], { pane: "portolan", interactive: false, color: kerteRenk(i), weight: i % 4 === 0 ? 0.7 : 0.5, opacity: i % 4 === 0 ? 0.16 : 0.11 }).addTo(portolan);
      }
      L.marker(g, { pane: "portolan", interactive: false, keyboard: false, icon: L.divIcon({ className: "ruzgar-gulu", html: svg, iconSize: [0, 0] }) }).addTo(portolan);
    });
  }
  portolanCiz();

  // Parşömen dokusu: il dolgularının ve çizgilerin üstünde, yapıların altında; ekranda sabit durur
  map.createPane("doku"); map.getPane("doku").style.zIndex = 420; map.getPane("doku").style.pointerEvents = "none";
  const dokuEl = L.DomUtil.create("div", "harita-doku", map.getPane("doku"));
  function dokuYerlestir() { const b = map.getSize(); dokuEl.style.width = b.x + "px"; dokuEl.style.height = b.y + "px"; L.DomUtil.setPosition(dokuEl, map.containerPointToLayerPoint([0, 0])); }
  map.on("move zoomend viewreset resize", dokuYerlestir); dokuYerlestir();

  // Birbirine yakın yapılar sayılı dairelerde toplanır (Leaflet.markercluster); eklenti yüklenemezse düz katman
  const KUME = typeof L.markerClusterGroup === "function";
  function kumeIkonu(k) {
    const ms = k.getAllChildMarkers(); const n = ms.length;
    const say = {}; ms.forEach(m => { say[m.options.tur] = (say[m.options.tur] || 0) + 1; });
    let a = 0;
    const dilim = TURLER.filter(t => say[t]).map(t => { const b = a + say[t] / n * 360; const d = `${TUR_COLOR[t]} ${a.toFixed(1)}deg ${b.toFixed(1)}deg`; a = b; return d; }).join(", ");
    const mobil = window.matchMedia("(max-width: 860px)").matches;
    const r = mobil ? (n < 10 ? 26 : n < 40 ? 30 : 34) : (n < 10 ? 32 : n < 40 ? 37 : 42);
    return L.divIcon({ className: "kume", html: `<div style="--dilim:conic-gradient(${dilim})"><i></i><span>${n}</span></div>`, iconSize: [r, r] });
  }
  // Kümeler il bazlıdır: farklı illerin yapıları aynı kümede birleşmez.
  // Türkiye görünümünde bir kümeye tıklamak o ili seçer; il seçiliyken küme yakınlaştırılır ya da açılır.
  const KUME_SEC = { maxClusterRadius: z => z >= 13 ? 28 : z >= 9 ? 38 : 46, spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false, removeOutsideVisibleBounds: true, spiderLegPolylineOptions: { weight: 1.2, color: "#85929A", opacity: 0.8 }, iconCreateFunction: kumeIkonu };
  const ilKumeleri = new Map();
  function ilKumesi(il) {
    let g = ilKumeleri.get(il);
    if (!g) {
      g = KUME ? L.markerClusterGroup(KUME_SEC) : L.layerGroup();
      if (KUME) g.on("clusterclick", e => kumeTikla(il, e.layer));
      g.addTo(map); ilKumeleri.set(il, g);
    }
    return g;
  }
  const kumesi = mk => ilKumesi(mk.options.il);
  function kumeTikla(il, kume) {
    if (picking) return;
    if (state.il !== il) { closeDrawer(); ilSec(il); return; }
    const z = map.getZoom(), sinir = kume.getBounds();
    const bz = map.getBoundsZoom(sinir, false, L.point(80, 80));
    if (z >= map.getMaxZoom() - 0.01 || bz <= z + 0.3) kume.spiderfy();
    else map.flyToBounds(sinir, { padding: [60, 60], maxZoom: Math.min(bz, 17), duration: AZALT ? 0 : 0.8 });
  }
  const ilKatmani = L.layerGroup().addTo(map);
  const etiketKatmani = L.layerGroup().addTo(map);
  let ilGeo = null, ilGeoFeatures = {}, ilMerkez = {}, vurgu = null, aktifMarker = null;
  const mapEl = $("#map");

  function zoomSinif() {
    const z = map.getZoom();
    mapEl.classList.toggle("uzak", z < 6.75);
    mapEl.classList.toggle("yakin", z >= 10);
    mapEl.classList.toggle("portolan-sonuk", z >= 8);
  }
  zoomSinif();

  // Açılış animasyonu: il sınırları mürekkeple çizilir, yapılar batıdan doğuya belirir
  // Dil değiştirilince sayfa yeniden açılır: önceki durum (filtreler, il, ilçe, görünüm, açık yapı) geri kurulur
  const GECIS = (window.I18N && window.I18N.gecis && window.I18N.gecis.harita) || null;
  let gecisBekle = !!GECIS;
  const acilis = { aktif: !AZALT && !GECIS, basla: performance.now() };
  if (acilis.aktif) { mapEl.classList.add("ilk"); setTimeout(() => mapEl.classList.remove("ilk"), 3600); }

  function cizAnimasyon(layers, sure, gecikme, dolguda) {
    if (AZALT) return;
    const adim = Math.min(10, 900 / Math.max(layers.length, 1));
    layers.forEach((layer, i) => {
      const el = layer.getElement && layer.getElement(); if (!el) return;
      const d = (gecikme || 0) + i * adim;
      el.setAttribute("pathLength", "1");
      el.style.strokeDasharray = "1"; el.style.strokeDashoffset = "1";
      if (dolguda) el.style.fillOpacity = "0";
      el.style.animation = `ciz ${sure}ms cubic-bezier(.4,.1,.3,1) ${d}ms forwards`;
      if (dolguda) setTimeout(() => { el.style.fillOpacity = ""; }, d + sure * 0.45);
      setTimeout(() => { el.removeAttribute("pathLength"); el.style.strokeDasharray = ""; el.style.strokeDashoffset = ""; el.style.animation = ""; }, d + sure + 60);
    });
  }

  function iconFor(y, gec) {
    // Beyaz zemin ikonla birlikte bir kapta durur: açılış animasyonunda ikonla birlikte düşer, önceden belirmez
    return L.divIcon({ className: "yapi-ic", html: `<span class="ik-zemin" style="--gec:${gec || 0}ms">${Ortak.ikon(y.tur)}</span>`, iconSize: [26, 26], iconAnchor: [13, 15] });
  }

  function tipHtml(y) {
    return `<h3>${esc(trunc(y.ad, 110))}</h3>${EN && enAd(y) ? `<p class="tip-en">${esc(enAd(y))}</p>` : ""}
      <div class="tip-tur">${Ortak.ikon(y.tur)}${esc(turAd(y.tur))}${y.topluluk.length ? " (" + esc(y.topluluk.map(toplulukAd).join(", ")) + ")" : ""}</div>
      <dl>
        <dt>${esc(T("tip_konum"))}</dt><dd>${esc(konumMetni(y))}</dd>
        <dt>${esc(T("guncel_islevi"))}</dt><dd>${esc(islevAd(y))}</dd>
        <dt>${esc(T("tip_korunma"))}</dt><dd>${esc(trunc(durumAd(y), 150))}</dd>
      </dl>
      <div class="tip-hint">${esc(T("tip_hint"))}</div>`;
  }

  // Bilgi kutusunu haritanın görünen, boş tarafına yerleştir
  const TIP_OFSET = { top: [0, -12], bottom: [0, 12], right: [14, 0], left: [-14, 0] };
  function tipYerlestir(mk) {
    const tt = mk.getTooltip(); const el = tt && tt.getElement(); if (!el) return;
    el.style.translate = ""; el.classList.remove("kaydirildi");
    const M = mapEl.getBoundingClientRect(); const pad = 14;
    const sag = !$("#drawer").hidden && window.innerWidth > 860 ? $("#drawer").getBoundingClientRect().left : M.right;
    const p = map.latLngToContainerPoint(mk.getLatLng());
    const w = el.offsetWidth, h = el.offsetHeight, gen = sag - M.left;
    const bos = { top: p.y - pad, bottom: M.height - p.y - pad, right: gen - p.x - pad, left: p.x - pad };
    let dir = bos.top >= h + 16 ? "top" : bos.bottom >= h + 16 ? "bottom" : bos.right >= w + 18 ? "right" : bos.left >= w + 18 ? "left"
      : Object.keys(bos).sort((a, b) => bos[b] - bos[a])[0];
    tt.options.direction = dir; tt.options.offset = L.point(TIP_OFSET[dir][0], TIP_OFSET[dir][1]);
    tt.update();
    // Hâlâ taşıyorsa kutuyu görünür alanın içine kaydır
    const r = el.getBoundingClientRect(); let dx = 0, dy = 0;
    if (r.left < M.left + pad) dx = M.left + pad - r.left; else if (r.right > sag - pad) dx = sag - pad - r.right;
    if (r.top < M.top + pad) dy = M.top + pad - r.top; else if (r.bottom > M.bottom - pad) dy = M.bottom - pad - r.bottom;
    if (dx || dy) { el.style.translate = `${Math.round(dx)}px ${Math.round(dy)}px`; el.classList.add("kaydirildi"); }
  }
  function tipYonu(mk) {
    const tt = mk.getTooltip(); if (!tt) return;
    const p = map.latLngToContainerPoint(mk.getLatLng()); const s = map.getSize();
    let dir = "top", off = [0, -12];
    if (p.y < 250) { dir = "bottom"; off = [0, 12]; }
    if (p.x < 170) { dir = "right"; off = [14, 0]; } else if (p.x > s.x - 170) { dir = "left"; off = [-14, 0]; }
    tt.options.direction = dir; tt.options.offset = L.point(off[0], off[1]);
  }
  const cakisir = (a, b) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  function engelKontrol(mk, acik) {
    ["#legend", "#pusula"].forEach(sel => {
      const el = $(sel); if (!el) return;
      if (!acik) { el.classList.remove("cekil"); return; }
      const tEl = mk.getTooltip() && mk.getTooltip().getElement(); if (!tEl) return;
      el.classList.toggle("cekil", cakisir(tEl.getBoundingClientRect(), el.getBoundingClientRect()));
    });
  }

  const markers = new Map();
  const gorunen = new Set();
  // Kayıtlı koordinatı il sınırının dışında (çoğunlukla denizde) kalan yapılar haritada en yakın kara noktasında gösterilir; kayıtlı veri değişmez
  const kara = new Map();
  const konum = y => kara.get(y.no) || [y.lat, y.lng];
  function markerlariKur() {
    ilKumeleri.forEach(g => g.clearLayers()); gorunen.clear();
    markers.clear();
    const sira = YAPILAR.slice().sort((a, b) => a.lng - b.lng).map(y => y.no);
    const rank = new Map(sira.map((no, i) => [no, i]));
    YAPILAR.forEach(y => {
      const gec = acilis.aktif ? 700 + rank.get(y.no) * 2 : 0;
      const mk = L.marker(konum(y), { icon: iconFor(y, gec), alt: y.ad, riseOnHover: true, keyboard: true, tur: y.tur, no: y.no, il: y.il });
      mk.on("mouseover", () => tipYonu(mk));            // bilgi kutusu açılmadan önce yönü belirle
      mk.bindTooltip(tipHtml(y), { direction: "top", offset: [0, -12], className: "yapi-tip", opacity: 1 });
      mk.on("tooltipopen", () => { tipYerlestir(mk); engelKontrol(mk, true); });
      mk.on("tooltipclose", () => engelKontrol(mk, false));
      mk.on("click", () => { if (!picking) openDrawer(y); });
      markers.set(y.no, mk);
    });
  }
  markerlariKur();

  // ---------------- Filtreler ----------------
  const state = { turler: new Set(TURLER), islev: "", topluluk: "", bolge: "", il: "", ilce: "", unesco: false, ara: "", araKapsam: "il" };
  // "Tüm Türkiye'de ara" seçiliyken (ve bir şey yazılmışken) arama il sınırına bakmaz
  const tumAra = () => !!(state.il && state.araKapsam === "tum" && state.ara);
  let ilceAtama = new Map();   // seçili ildeki yapı no → ilçe adı
  function secenekler(sel, items) {
    const secili = sel.value;
    sel.innerHTML = `<option value="">${esc(T("tumu"))}</option>` + items.map(([v, txt]) => `<option value="${esc(v)}">${esc(txt)}</option>`).join("");
    sel.value = secili;
  }
  $("#f-turler").insertAdjacentHTML("beforeend", TURLER.map(t =>
    `<label class="chk"><input type="checkbox" name="tur" value="${t}" checked>${Ortak.ikon(t)}${esc(turAd(t))}</label>`).join(""));
  secenekler($("#f-islev"), ISLEV_SIRA.map(k => [k, islevKatAd(k)]));
  secenekler($("#f-bolge"), BOLGELER.map(k => [k, bolgeAd(k)]));
  secenekler($("#f-il"), ILLER.map(i => i.ad).sort((a, b) => a.localeCompare(b, "tr")).map(a => [a, a]));
  function toplulukDoldur() {
    const say = {}; YAPILAR.forEach(y => y.topluluk.forEach(k => { say[k] = (say[k] || 0) + 1; }));
    secenekler($("#f-topluluk"), Object.keys(say).sort((a, b) => say[b] - say[a]).map(k => [k, toplulukAd(k)]));
  }
  toplulukDoldur();
  $("#tally-types").innerHTML = TURLER.map(t => `<li>${Ortak.ikon(t)}<b id="t-${Ortak.IKON_SINIF[t]}">0</b> ${esc(T("tur_cok_" + t))}</li>`).join("");

  function gecerli(y, ignoreIl, ignoreIlce) {
    if (!state.turler.has(y.tur)) return false;
    if (state.islev && y.islevKat !== state.islev) return false;
    if (state.topluluk && !y.topluluk.includes(state.topluluk)) return false;
    if (state.bolge && y.bolge !== state.bolge) return false;
    const tum = tumAra();
    if (!ignoreIl && !tum && state.il && y.il !== state.il) return false;
    if (!ignoreIl && !ignoreIlce && !tum && state.ilce && ilceAtama.get(y.no) !== state.ilce) return false;
    if (state.unesco && !y.unesco) return false;
    if (state.ara && !y._ara.includes(state.ara)) return false;
    return true;
  }

  let sonFiltre = [], sonIlSay = {};
  let araT;
  function uygula() {
    const liste = YAPILAR.filter(y => gecerli(y, false));
    const ilIcin = YAPILAR.filter(y => gecerli(y, true));
    sonFiltre = liste;
    const yeni = new Set($("#l-noktalar").checked ? liste.map(y => y.no) : []);
    const cik = [], ekle = [];
    gorunen.forEach(no => { if (!yeni.has(no)) { cik.push(markers.get(no)); gorunen.delete(no); } });
    yeni.forEach(no => { if (!gorunen.has(no)) { ekle.push(markers.get(no)); gorunen.add(no); } });
    const grupla = arr => { const m = new Map(); arr.forEach(mk => { const k = mk.options.il; (m.get(k) || m.set(k, []).get(k)).push(mk); }); return m; };
    grupla(cik).forEach((arr, il) => { const g = ilKumesi(il); if (KUME) g.removeLayers(arr); else arr.forEach(m => g.removeLayer(m)); });
    grupla(ekle).forEach((arr, il) => { const g = ilKumesi(il); if (KUME) g.addLayers(arr); else arr.forEach(m => g.addLayer(m)); });
    rozetler();
    Ortak.sayac($("#t-toplam"), liste.length, { sure: 800 });
    TURLER.forEach(t => Ortak.sayac($("#t-" + Ortak.IKON_SINIF[t]), liste.filter(y => y.tur === t).length, { sure: 800 }));
    const ilSay = {};
    ilIcin.forEach(y => { const s = ilSay[y.il] || (ilSay[y.il] = { toplam: 0, "Kilise": 0, "Manastır": 0, "Şapel": 0 }); s.toplam++; s[y.tur]++; });
    sonIlSay = ilSay;
    cizIller(ilSay); cizIlListesi(ilSay); cizLejant();
  }

  // ---------------- İl katmanı ----------------
  function renk(n) { if (!n) return null; let i = 0; while (i < BREAKS.length - 1 && n >= BREAKS[i + 1]) i++; return rampa()[i]; }
  function ilTip(il, s) {
    if (!s || !s.toplam) return `<b>${esc(il)}</b><br>${esc(T("il_tip_yok"))}`;
    const parca = TURLER.filter(t => s[t]).map(t => `${s[t]} ${T("tur_cok_" + t)}`);
    return `<b>${esc(il)}</b><br>${s.toplam} ${esc(T("kayit"))}: ${esc(parca.join(", "))}`;
  }
  const merkez = (i) => ilMerkez[i.ad] || [i.lat, i.lng];

  function cizIller(ilSay) {
    ilKatmani.clearLayers(); etiketKatmani.clearLayers();
    const ilAcik = $("#l-iller").checked, gosterNokta = $("#l-noktalar").checked, z = map.getZoom();
    if (ilGeo) {
      if (!ilAcik) { if (map.hasLayer(ilGeo)) map.removeLayer(ilGeo); }
      else {
        if (!map.hasLayer(ilGeo)) ilGeo.addTo(map);
        Object.entries(ilGeoFeatures).forEach(([il, layer]) => {
          if (!layer.setStyle) return;
          const s = ilSay[il]; const c = renk(s && s.toplam);
          if (state.il && il !== state.il) {
            // Seçili ilin dışı: beyaz, sönük
            layer.setStyle({ fillColor: HR().disari, fillOpacity: 0.88, color: HR().disariCizgi, weight: 0.7, opacity: 0.45, dashArray: "4 3" });
          } else {
            const secili = state.il === il;
            // Seçili ilin içi sade, açık bir zemine döner; yoğunluk rengi orada bilgi vermez, ikonları gölgeler
            const dolgu = secili ? (koyuMu() ? "#1A2A5C" : "#F6EDD5") : (c || HR().bos);
            layer.setStyle({ fillColor: dolgu, fillOpacity: (secili ? 0.8 : c ? (gosterNokta ? 0.72 : 0.86) : 0.7) * (koyuMu() ? 0.95 : 1), color: HR().cizgi, weight: 0.9, opacity: 0.85, dashArray: "4 3" });
          }
          layer.unbindTooltip(); layer.bindTooltip(ilTip(il, s), { sticky: true, className: "il-tip" });
        });
      }
    } else if (ilAcik) {
      ILLER.forEach(i => {
        const s = ilSay[i.ad]; if (!s || !s.toplam) return;
        L.circleMarker(merkez(i), { pane: "iller", radius: 6 + Math.sqrt(s.toplam) * 4.2, color: HR().cizgi, weight: 1, fillColor: renk(s.toplam), fillOpacity: state.il && state.il !== i.ad ? 0.12 : gosterNokta ? 0.5 : 0.8, opacity: state.il && state.il !== i.ad ? 0.3 : 1 })
          .bindTooltip(ilTip(i.ad, s), { className: "il-tip" }).on("click", () => ilSec(i.ad)).addTo(ilKatmani);
      });
    }
    if (gosterNokta && z >= 8) return;
    // İl adları ve sayıları; öncelik kayıt sayısında
    const sirali = ILLER.slice().sort((a, b) => ((ilSay[b.ad] || {}).toplam || 0) - ((ilSay[a.ad] || {}).toplam || 0));
    const etiketler = sirali.filter(i => !state.il || i.ad === state.il).map(i => {
      const n = ilAcik && ilSay[i.ad] ? ilSay[i.ad].toplam : 0;
      const html = n ? `<span>${n}<small>${esc(i.ad)}</small></span>` : `<span class="bos"><small>${esc(i.ad)}</small></span>`;
      return L.marker(merkez(i), { pane: "ilEtiket", interactive: false, keyboard: false, icon: L.divIcon({ className: "il-label", html, iconSize: [0, 0] }) }).addTo(etiketKatmani);
    });
    requestAnimationFrame(() => etiketAyikla(etiketler));
  }

  // Üst üste binen il etiketlerinden, kaydı az olanı gizle (yakınlaştırınca görünür)
  function etiketAyikla(etiketler) {
    const kabul = [];
    etiketler.forEach(mk => {
      const kap = mk.getElement(); if (!kap) return;
      const sp = kap.querySelector("span"); if (!sp) return;
      kap.classList.remove("gizli");
      const r = sp.getBoundingClientRect(); const pad = 2;
      const kutu = { left: r.left - pad, right: r.right + pad, top: r.top - pad, bottom: r.bottom + pad };
      if (kabul.some(k => cakisir(k, kutu))) kap.classList.add("gizli"); else kabul.push(kutu);
    });
  }
  map.on("zoomend", () => { zoomSinif(); geriDugmeleri(); cizIller(sonIlSay); requestAnimationFrame(() => requestAnimationFrame(ilceEtiketAyikla)); });

  function cizIlListesi(ilSay) {
    const ol = $("#il-listesi");
    const baslik = $("#liste-baslik");
    if (state.il || state.ara) { cizYapiListesi(ol, baslik); return; }
    ol.classList.remove("yapi-list"); baslik.textContent = T("illere_gore");
    const sirali = Object.entries(ilSay).filter(([, s]) => s.toplam).sort((a, b) => b[1].toplam - a[1].toplam || a[0].localeCompare(b[0], "tr"));
    if (!sirali.length) { ol.innerHTML = `<li class="empty">${esc(T("liste_bos"))}</li>`; return; }
    const max = sirali[0][1].toplam;
    ol.innerHTML = sirali.map(([il, s]) => {
      const w = (s.toplam / max) * 100;
      const segs = TURLER.filter(t => s[t]).map(t => `<i style="width:${(s[t] / s.toplam) * w}%;background:${TUR_COLOR[t]}"></i>`).join("");
      const title = TURLER.filter(t => s[t]).map(t => `${s[t]} ${T("tur_cok_" + t)}`).join(", ");
      return `<li><button type="button" data-il="${esc(il)}" aria-pressed="${state.il === il}" title="${esc(title)}">
        <span class="il-ad">${esc(il)}</span><span class="il-n">${s.toplam}</span><span class="bar">${segs}</span></button></li>`;
    }).join("");
  }
  // Seçili ildeki yapılar: üzerine gelince haritada parlar, tıklayınca bilgi kutusu açılır
  function cizYapiListesi(ol, baslik) {
    const liste = sonFiltre.slice().sort((a, b) => (a.ilce || "").localeCompare(b.ilce || "", "tr") || a.ad.localeCompare(b.ad, "tr"));
    const yerAdi = state.ilce ? `${state.ilce}, ${state.il}` : state.il;
    const bas = tumAra() ? T("arama_tum") : state.il ? (state.ara ? `${T("arama_sonuc")} · ${yerAdi}` : state.ilce ? T("ilce_yapilari", { ilce: state.ilce }) : T("il_yapilari", { il: state.il })) : T("arama_sonuc");
    baslik.innerHTML = `${esc(bas)} <small>${liste.length}</small>`;
    ol.classList.add("yapi-list");
    const ok = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4 6.5 10l6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const geri = !state.il ? "" : state.ilce
      ? `<li class="liste-geri"><button type="button" data-ilce-geri>${ok}${esc(T("geri_il", { il: state.il }))}</button></li>`
      : `<li class="liste-geri"><button type="button" data-il="">${ok}${esc(T("tum_iller"))}</button></li>`;
    if (!liste.length) { ol.innerHTML = geri + `<li class="empty">${esc(T("liste_bos"))}</li>`; return; }
    ol.innerHTML = geri + liste.slice(0, 400).map(y => `<li><button type="button" data-no="${y.no}">${Ortak.ikon(y.tur)}<span class="y-ad">${esc(y.ad)}</span><span class="y-yer">${esc([state.il && !tumAra() ? "" : y.il, y.ilce, y.yer].filter(Boolean).join(", "))}</span></button></li>`).join("");
  }
  // Arama kapsamı: il seçiliyken "bu ilde" ya da "tüm Türkiye'de"
  function aramaKapsamCiz() {
    const k = $("#ara-kapsam");
    if (!state.il) { k.hidden = true; k.innerHTML = ""; return; }
    k.hidden = false;
    k.setAttribute("aria-label", T("ara_kapsam_etiket"));
    const tum = state.araKapsam === "tum";
    const buyutec = `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m13 13 4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    k.innerHTML = `<button type="button" data-kapsam="il" aria-pressed="${!tum}">${esc(T("ara_kapsam_il", { il: state.il }))}</button><button type="button" data-kapsam="tum" aria-pressed="${tum}">${buyutec}${esc(T("ara_kapsam_tum"))}</button>${tum ? `<p class="ara-ipucu">${esc(T("ara_kapsam_ipucu"))}</p>` : ""}`;
  }
  // Kapsam düğmesi yalnızca aramanın nerede yapılacağını seçer; harita, arama gönderilince Türkiye geneline döner
  $("#ara-kapsam").addEventListener("click", e => {
    const b = e.target.closest("[data-kapsam]"); if (!b || b.dataset.kapsam === state.araKapsam) return;
    state.araKapsam = b.dataset.kapsam; aramaKapsamCiz(); uygula();
    const g = $("#ara-kapsam [data-kapsam=" + state.araKapsam + "]"); if (g) g.focus({ preventScroll: true });
    if (state.araKapsam === "tum") $("#f-ara").focus();
  });
  function aramaGonder() {
    clearTimeout(araT); state.ara = norm($("#f-ara").value);
    if (state.il && state.araKapsam === "tum") { closeDrawer(); ilSec(""); }
    else uygula();
    grupAc("g-liste");
  }
  let listeVurgu = null;
  function yapiVurgula(no) {
    if (listeVurgu) { listeVurgu.classList.remove("liste-vurgu"); listeVurgu = null; }
    if (no == null) return;
    const mk = markers.get(no); if (!mk) return;
    const g = kumesi(mk); const ust = KUME && g.hasLayer(mk) ? g.getVisibleParent(mk) : mk;
    const el = ust && ust.getElement && ust.getElement();
    if (el) { el.classList.add("liste-vurgu"); listeVurgu = el; }
  }
  function yapiAc(no) {
    const y = YAPILAR.find(x => x.no === no); const mk = markers.get(no); if (!y) return;
    yapiVurgula(null);
    if (window.matchMedia("(max-width: 860px)").matches) togglePanel(false);
    if (KUME && mk && kumesi(mk).hasLayer(mk)) kumesi(mk).zoomToShowLayer(mk, () => openDrawer(y));
    else openDrawer(y);
  }
  $("#il-listesi").addEventListener("click", e => {
    const y = e.target.closest("button[data-no]"); if (y) { yapiAc(Number(y.dataset.no)); return; }
    if (e.target.closest("button[data-ilce-geri]")) { ilceSec(""); return; }
    const b = e.target.closest("button[data-il]"); if (!b) return;
    ilSec(state.il === b.dataset.il ? "" : b.dataset.il);
  });
  $("#il-listesi").addEventListener("mouseover", e => { const y = e.target.closest("button[data-no]"); yapiVurgula(y ? Number(y.dataset.no) : null); });
  $("#il-listesi").addEventListener("mouseleave", () => yapiVurgula(null));
  $("#il-listesi").addEventListener("focusin", e => { const y = e.target.closest("button[data-no]"); yapiVurgula(y ? Number(y.dataset.no) : null); });

  // ---------------- İlçe sınırları ----------------
  // Kaynak: geoBoundaries (OpenStreetMap, ODbL). Her il ayrı dosyada, il seçilince yüklenir.
  map.createPane("ilceler"); map.getPane("ilceler").style.zIndex = 380;
  const ilceOnbellek = {};
  let ilceKatman = null, ilceEtiketKatman = null, ilceIstek = 0;
  const TR_ASCII = { "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };
  const ilceDosya = il => "data/ilceler/" + il.toLocaleLowerCase("tr").replace(/[çğıöşüâîû]/g, c => TR_ASCII[c]).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".json?v=2";
  function ilceleriKaldir() {
    if (ilceKatman) { map.removeLayer(ilceKatman); ilceKatman = null; }
    if (ilceEtiketKatman) { map.removeLayer(ilceEtiketKatman); ilceEtiketKatman = null; }
  }
  async function ilceleriGoster(il, gecikme) {
    const istek = ++ilceIstek; ilceleriKaldir();
    if (!il) return;
    let veri = ilceOnbellek[il];
    if (!veri) {
      try { const r = await fetch(ilceDosya(il)); if (!r.ok) return; veri = ilceOnbellek[il] = await r.json(); } catch (e) { return; }
    }
    if (istek !== ilceIstek) return;
    ilceAta(il, veri);
    const fc = { type: "FeatureCollection", features: veri.map(([ad, koord]) => ({ type: "Feature", properties: { ad }, geometry: { type: "MultiPolygon", coordinates: koord } })) };
    ilceKatman = L.geoJSON(fc, {
      pane: "ilceler", style: () => ilceStil(), onEachFeature: (f, layer) => {
        const ad = f.properties.ad;
        layer.bindTooltip(() => ilceTip(ad), { sticky: true, className: "il-tip" });
        // Bir ilçe seçiliyken diğerlerinin perdesi aynı renkte biraz açılır; renk değiştirmek koyu bir çakmaya yol açıyordu
        layer.on("mouseover", () => { if (state.ilce !== ad) layer.setStyle(state.ilce ? { fillColor: HR().ilcePerde, fillOpacity: 0.3 } : { fillColor: HR().ilce, fillOpacity: 0.1 }); });
        layer.on("mouseout", () => layer.setStyle(ilceStil(ad)));
        layer.on("click", () => { if (!picking) ilceSec(state.ilce === ad ? "" : ad); });
      }
    });
    const yollar = []; ilceKatman.eachLayer(l => yollar.push(l));
    ilceEtiketKatman = L.layerGroup(fc.features.map(f => {
      const m = agirlikMerkezi(f.geometry); if (!m) return null;
      return L.marker(m, { pane: "ilEtiket", interactive: false, keyboard: false, ad: f.properties.ad, icon: L.divIcon({ className: "ilce-label", html: `<span>${esc(f.properties.ad)}</span>`, iconSize: [0, 0] }) });
    }).filter(Boolean));
    setTimeout(() => {
      if (istek !== ilceIstek) return;
      ilceKatman.addTo(map); cizAnimasyon(yollar, 1100, 0, false);
      setTimeout(() => { if (istek !== ilceIstek || !ilceEtiketKatman) return; ilceEtiketKatman.addTo(map); requestAnimationFrame(ilceEtiketAyikla); }, AZALT ? 0 : 650);
    }, gecikme || 0);
  }
  // İlçe adları birbirine ya da il etiketine çarpıyorsa gizlenir; yakınlaştırınca geri gelir
  function ilceEtiketAyikla() {
    if (!ilceEtiketKatman) return;
    const kabul = [];
    etiketKatmani.eachLayer(mk => { const k = mk.getElement(); const sp = k && !k.classList.contains("gizli") && k.querySelector("span"); if (sp) kabul.push(sp.getBoundingClientRect()); });
    // Seçili ilçenin adı her zaman görünür kalır: çakışmada önce o yerleştirilir
    const sirali = []; ilceEtiketKatman.eachLayer(mk => sirali.push(mk));
    sirali.sort((a, b) => (b.options.ad === state.ilce) - (a.options.ad === state.ilce));
    sirali.forEach(mk => {
      const kap = mk.getElement(); if (!kap) return;
      const sp = kap.querySelector("span"); if (!sp) return;
      kap.classList.remove("gizli");
      const r = sp.getBoundingClientRect(); const pad = 3;
      const kutu = { left: r.left - pad, right: r.right + pad, top: r.top - pad, bottom: r.bottom + pad };
      if (kabul.some(k => cakisir(k, kutu))) kap.classList.add("gizli"); else kabul.push(kutu);
    });
  }
  function ilceTemaYenile() { ilceStilYenile(); }

  // İlçe seçimi: kaynaktaki ilçe adı esas alınır; ad yoksa ya da eşleşmezse haritadaki konum (nokta-çokgen testi)
  function noktaIcinde(x, y, halka) {
    let ic = false;
    for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
      const [xi, yi] = halka[i], [xj, yj] = halka[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ic = !ic;
    }
    return ic;
  }
  const cokgendeMi = (x, y, mp) => mp.some(p => noktaIcinde(x, y, p[0]) && !p.slice(1).some(h => noktaIcinde(x, y, h)));
  // Sınırın en yakın noktasını bulur, oradan ~650 m içeride bir kara noktası seçer; olmazsa il merkezine doğru ilerler
  function karaNoktasi(x, y, mp, merkez) {
    const k = Math.cos(y * Math.PI / 180); let en = null, enD = Infinity;
    mp.forEach(p => p.forEach(r => {
      for (let i = 0; i < r.length - 1; i++) {
        const ax = r[i][0] * k, ay = r[i][1], dx = r[i + 1][0] * k - ax, dy = r[i + 1][1] - ay, L2 = dx * dx + dy * dy;
        const t = L2 ? Math.max(0, Math.min(1, ((x * k - ax) * dx + (y - ay) * dy) / L2)) : 0;
        const qx = ax + t * dx, qy = ay + t * dy, d = (x * k - qx) ** 2 + (y - qy) ** 2;
        if (d < enD) { enD = d; en = [qx / k, qy]; }
      }
    }));
    if (!en) return null;
    // Sınır noktası çevresinde giderek genişleyen halkalarda, asıl noktaya en yakın kara noktası aranır
    for (const rr of [0.006, 0.01, 0.016, 0.025, 0.04]) {
      let iyi = null, iyiD = Infinity;
      for (let a = 0; a < 24; a++) {
        const an = a * Math.PI / 12, nx = en[0] + Math.cos(an) * rr / k, ny = en[1] + Math.sin(an) * rr;
        if (!cokgendeMi(nx, ny, mp)) continue;
        const d = ((nx - x) * k) ** 2 + (ny - y) ** 2; if (d < iyiD) { iyiD = d; iyi = [ny, nx]; }
      }
      if (iyi) return iyi;
    }
    if (merkez) for (let t = 0.05; t <= 1.001; t += 0.05) {
      const nx = en[0] + (merkez[1] - en[0]) * t, ny = en[1] + (merkez[0] - en[1]) * t;
      if (cokgendeMi(nx, ny, mp)) return [ny, nx];
    }
    return null;
  }
  function karaHesapla() {
    kara.clear();
    YAPILAR.forEach(y => {
      const f = ilGeoFeatures[y.il], g = f && f.feature && f.feature.geometry; if (!g) return;
      const mp = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
      if (cokgendeMi(y.lng, y.lat, mp)) return;
      const p = karaNoktasi(y.lng, y.lat, mp, ilMerkez[y.il]); if (p) kara.set(y.no, p);
    });
  }
  function karayaCek() {
    karaHesapla();
    YAPILAR.forEach(y => {
      const mk = markers.get(y.no); if (!mk) return;
      const p = L.latLng(konum(y)); if (mk.getLatLng().equals(p)) return;
      const g = kumesi(mk), v = g.hasLayer(mk);
      if (v) g.removeLayer(mk); mk.setLatLng(p); if (v) g.addLayer(mk);
    });
  }
  function ilceAta(il, veri) {
    const adlar = new Map(veri.map(([ad]) => [norm(ad), ad]));
    ilceAtama = new Map();
    YAPILAR.filter(y => y.il === il).forEach(y => {
      let k = norm(y.ilce || ""); if (k === "merkez") k = norm(il + " merkez");
      let ad = adlar.get(k);
      if (!ad) { const [la, ln] = konum(y); const h = veri.find(([, mp]) => cokgendeMi(ln, la, mp)); ad = h ? h[0] : null; }
      if (ad) ilceAtama.set(y.no, ad);
    });
  }
  function ilceStil(ad) {
    const secili = state.ilce && ad === state.ilce;
    if (secili) return { color: HR().ilceSecili, weight: 2.8, opacity: 1, fill: true, fillOpacity: 0, className: "ilce-yol" };
    return { color: HR().ilce, weight: state.ilce ? 0.9 : 1.15, opacity: 0.85, fill: true, fillColor: HR().ilcePerde, fillOpacity: state.ilce ? 0.55 : 0, className: "ilce-yol" };
  }
  function ilceStilYenile() {
    if (!ilceKatman) return;
    ilceKatman.eachLayer(l => { const ad = l.feature.properties.ad; l.setStyle(ilceStil(ad)); if (ad === state.ilce) l.bringToFront(); });
    if (ilceEtiketKatman) { ilceEtiketKatman.eachLayer(mk => { const el = mk.getElement && mk.getElement(); if (el) el.classList.toggle("secili", !!state.ilce && mk.options.ad === state.ilce); }); requestAnimationFrame(ilceEtiketAyikla); }
  }
  function ilceTip(ad) {
    const n = YAPILAR.filter(y => gecerli(y, false, true) && ilceAtama.get(y.no) === ad).length;
    return `<b>${esc(ad)}</b><br>${esc(n ? T("ilce_tip_kayit", { n }) : T("ilce_tip_yok"))}${n && state.ilce !== ad ? `<br><small>${esc(T("ilce_tip_ipucu"))}</small>` : ""}`;
  }
  function ilceSec(ad) {
    if (!state.il) return;
    state.ilce = ad || "";
    closeDrawer(); uygula(); ilceStilYenile(); geriDugmeleri();
    const sec = AZALT ? { animate: false } : { duration: 1.0, easeLinearity: 0.25 };
    const panel = $("#panel"); panel.scrollTo({ top: 0, behavior: AZALT ? "auto" : "smooth" });
    const sec2 = $(".provinces"); sec2.classList.remove("parla"); void sec2.offsetWidth; sec2.classList.add("parla");
    if (state.ilce && ilceKatman) {
      let hedef = null; ilceKatman.eachLayer(l => { if (l.feature.properties.ad === state.ilce) hedef = l; });
      if (hedef) map.flyToBounds(hedef.getBounds(), Object.assign({ padding: [56, 56], maxZoom: 12 }, sec));
    } else if (ilGeoFeatures[state.il]) {
      const [mrk, zm] = ilGorunumu(state.il, ilGeoFeatures[state.il]); map.flyTo(mrk, zm, sec);
    }
    if (window.matchMedia("(max-width: 860px)").matches) togglePanel(false);
  }
  function geriDugmeleri() {
    $("#geri").hidden = !(state.il || map.getZoom() > ACILIS_Z + 0.9);
    $("#geri-il").hidden = !state.ilce;
    $("#geri-il-yazi").textContent = state.il ? T("geri_il", { il: state.il }) : "";
  }

  // İl seçimi: haritada yumuşak uçuş + sınırın mürekkeple yeniden çizilmesi
  // İl merkezini önceleyen yakınlaştırma: ilin ana kara sınırı sığacak yakınlık seçilir, il merkezi ortada tutulur.
  // Adalar gibi uzak parçalar hesaba katılmaz; il merkezi ortadayken sınır sığmıyorsa en fazla bir kademe uzaklaşılır.
  function anaSinir(geom) {
    const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
    let enIyi = null, enA = 0;
    polys.forEach(p => { const r = p[0]; let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); a = Math.abs(a); if (a > enA) { enA = a; enIyi = r; } });
    return enIyi ? L.latLngBounds(enIyi.map(([x, y]) => [y, x])) : null;
  }
  function ilGorunumu(il, f) {
    const sinir = (f.feature && anaSinir(f.feature.geometry)) || f.getBounds();
    const bilgi = ILLER.find(i => i.ad === il);
    const merkez = bilgi ? L.latLng(bilgi.lat, bilgi.lng) : sinir.getCenter();
    const pay = L.point(56, 56);
    let z = Math.min(map.getBoundsZoom(sinir, false, pay), 10);
    const sigar = zz => { const boy = map.getSize().subtract(pay).divideBy(2); const p = map.project(merkez, zz); return L.latLngBounds(map.unproject(p.subtract(boy), zz), map.unproject(p.add(boy), zz)).contains(sinir); };
    if (!sigar(z) && z > 6) z -= 1;
    return [merkez, z];
  }
  function ilSec(il) {
    state.il = il; state.ilce = ""; state.araKapsam = "il"; ilceAtama = new Map(); $("#f-il").value = il; uygula();
    if (il) grupAc("g-liste");
    geriDugmeleri();
    aramaKapsamCiz();
    // İl seçilince o ilin yapı listesi panelin üstüne gelir
    const panel = $("#panel"); panel.classList.toggle("il-secili", !!il);
    if (il) { panel.scrollTo({ top: 0, behavior: AZALT ? "auto" : "smooth" }); const sec2 = $(".provinces"); sec2.classList.remove("parla"); void sec2.offsetWidth; sec2.classList.add("parla"); }
    if (vurgu) { map.removeLayer(vurgu); vurgu = null; }
    const sec = AZALT ? { animate: false } : { duration: 1.2, easeLinearity: 0.2 };
    ilceleriGoster(il, AZALT ? 0 : 1000);
    if (!il) { map.flyToBounds(TURKIYE, Object.assign({ padding: [10, 10] }, sec)); return; }
    const f = ilGeoFeatures[il];
    if (f) {
      const [mrk, zm] = ilGorunumu(il, f);
      map.flyTo(mrk, zm, sec);
      vurgu = L.geoJSON(f.feature, { pane: "iller", interactive: false, style: { color: HR().vurgu, weight: 2.6, opacity: 0.95, fill: false, className: "il-vurgu" } }).addTo(map);
      const yollar = []; vurgu.eachLayer(l => yollar.push(l));
      setTimeout(() => cizAnimasyon(yollar, 1400, 0, false), AZALT ? 0 : 700);
    } else {
      const pts = YAPILAR.filter(y => y.il === il).map(y => [y.lat, y.lng]);
      if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.4), Object.assign({ maxZoom: 11 }, sec));
    }
    if (window.matchMedia("(max-width: 860px)").matches) togglePanel(false);
  }

  function cizLejant() {
    const labels = BREAKS.map((b, i) => i < BREAKS.length - 1 ? (BREAKS[i + 1] - 1 > b ? `${b}–${BREAKS[i + 1] - 1}` : `${b}`) : `${b}+`);
    const acik = !window.matchMedia("(max-width: 860px)").matches;
    const legend = $("#legend"); const det = legend.querySelector("details");
    let kayitli = null; try { kayitli = localStorage.getItem("lejant"); } catch (e) { /* yoksay */ }
    const isOpen = det ? det.open : kayitli ? kayitli === "acik" : acik;
    legend.innerHTML = `<details ${isOpen ? "open" : ""}><summary><span>${esc(T("lejant"))}</span><span class="lejant-dugme" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M5 12.5 10 7.5l5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></summary>
      ${TURLER.map(t => `<div class="row">${Ortak.ikon(t)}${esc(turAd(t))}</div>`).join("")}
      ${$("#l-iller").checked ? `<h4>${esc(T("ildeki_kayit"))}</h4>
      <div class="ramp">${rampa().map(c => `<i style="background:${c}"></i>`).join("")}</div>
      <div class="ramp-lab"><span>${labels[0]}</span><span>${labels[labels.length - 1]}</span></div>
      ${ilGeo ? "" : `<div class="note">${esc(T("daire_not"))}</div>`}` : ""}
      ${KUME ? `<div class="row kume-row"><span class="kume-ornek"><span>5</span></span>${esc(T("kume_not"))}</div>` : ""}
      <div class="note">${esc(T("konum_yaklasik_not"))}</div></details>`;
    const d = legend.querySelector("details");
    d.querySelector("summary").setAttribute("aria-label", T(d.open ? "lejant_gizle" : "lejant_goster"));
    d.addEventListener("toggle", () => {
      try { localStorage.setItem("lejant", d.open ? "acik" : "kapali"); } catch (e) { /* yoksay */ }
      d.querySelector("summary").setAttribute("aria-label", T(d.open ? "lejant_gizle" : "lejant_goster"));
    });
  }

  // İl sınırları (yüklenemezse daireler kullanılır)
  const IL_ALIAS = { "afyon": "Afyonkarahisar", "icel": "Mersin", "k maras": "Kahramanmaraş", "maras": "Kahramanmaraş", "antep": "Gaziantep", "urfa": "Şanlıurfa" };
  const IL_NORM = Object.fromEntries(ILLER.map(i => [norm(i.ad), i.ad]));
  function ilAdiBul(props) {
    for (const v of Object.values(props || {})) {
      if (typeof v !== "string") continue;
      const n = norm(v); if (IL_NORM[n]) return IL_NORM[n]; if (IL_ALIAS[n]) return IL_ALIAS[n];
    }
    return null;
  }
  // Etiket yeri: ilin en büyük parçasının ağırlık merkezi
  function agirlikMerkezi(geom) {
    const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
    let best = null, bestA = 0;
    polys.forEach(p => {
      const r = p[0]; let a = 0, cx = 0, cy = 0;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f;
      }
      a /= 2; if (Math.abs(a) > bestA) { bestA = Math.abs(a); best = [cy / (6 * a), cx / (6 * a)]; }
    });
    return best;
  }
  async function ilSinirlariYukle() {
    // İl sınırları ilçe verisinden üretildi (aynı topoloji): il ve ilçe çizgileri birebir örtüşür
    const kaynaklar = ["data/iller.json?v=1", "https://cdn.jsdelivr.net/gh/cihadturhan/tr-geojson@master/geo/tr-cities-utf8.json"];
    for (const url of kaynaklar) {
      try {
        const r = await fetch(url); if (!r.ok) continue;
        const gj = await r.json(); const feats = gj.features || [];
        if (feats.filter(f => ilAdiBul(f.properties)).length < 75) continue;
        ilGeoFeatures = {};
        ilGeo = L.geoJSON(gj, {
          pane: "iller",
          style: { weight: 0.9, color: HR().cizgi, fillOpacity: 0.2, dashArray: "4 3", className: "il-yol" },
          onEachFeature: (f, layer) => {
            const il = ilAdiBul(f.properties); if (!il) return;
            ilGeoFeatures[il] = layer;
            const m = agirlikMerkezi(f.geometry); if (m) ilMerkez[il] = m;
            layer.on("click", () => { if (!picking) ilSec(il); });
          }
        });
        try { karayaCek(); } catch (e) { /* konum düzeltmesi yapılamazsa kayıtlı konum kullanılır */ }
        uygula();
        // Sayfa yeni açıldıysa sınırları çizerek göster
        if (acilis.aktif && performance.now() - acilis.basla < 4000) {
          const yollar = Object.values(ilGeoFeatures).sort((a, b) => a.getBounds().getCenter().lng - b.getBounds().getCenter().lng);
          cizAnimasyon(yollar, 1300, 0, true);
        }
        if (gecisBekle) gecisUygula(); else if (state.il) ilSec(state.il);
        return;
      } catch (e) { /* sıradaki kaynağı dene */ }
    }
  }

  // ---------------- Filtre olayları ----------------
  $$('input[name="tur"]').forEach(c => c.addEventListener("change", () => { state.turler = new Set($$('input[name="tur"]:checked').map(x => x.value)); uygula(); }));
  $("#f-islev").addEventListener("change", e => { state.islev = e.target.value; uygula(); });
  $("#f-topluluk").addEventListener("change", e => { state.topluluk = e.target.value; uygula(); });
  $("#f-bolge").addEventListener("change", e => { state.bolge = e.target.value; uygula(); });
  $("#f-il").addEventListener("change", e => ilSec(e.target.value));
  $("#f-unesco").addEventListener("change", e => { state.unesco = e.target.checked; uygula(); });
  $("#f-ara").addEventListener("input", e => { clearTimeout(araT); araT = setTimeout(() => { state.ara = norm(e.target.value); uygula(); }, 150); });
  $("#f-ara").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); aramaGonder(); } });
  $("#f-ara-dugme").addEventListener("click", e => { e.preventDefault(); aramaGonder(); });
  $("#l-noktalar").addEventListener("change", uygula);
  $("#l-iller").addEventListener("change", uygula);
  $("#f-temizle").addEventListener("click", () => {
    $$('input[name="tur"]').forEach(c => c.checked = true);
    ["#f-islev", "#f-topluluk", "#f-bolge", "#f-il"].forEach(s => $(s).value = "");
    $("#f-unesco").checked = false; $("#f-ara").value = "";
    Object.assign(state, { turler: new Set(TURLER), islev: "", topluluk: "", bolge: "", ilce: "", ara: "", unesco: false, araKapsam: "il" });
    ilSec("");
  });

  function togglePanel(open) {
    const p = $("#panel"); const want = open == null ? !p.classList.contains("open") : open;
    p.classList.toggle("open", want); $("#panel-toggle").setAttribute("aria-expanded", String(want));
    if (want && window.matchMedia("(max-width: 860px)").matches) closeDrawer();
  }
  $("#panel-toggle").addEventListener("click", () => togglePanel());

  // ---------------- Panel bölümleri: lejant gibi açılır kapanır, tercih hatırlanır ----------------
  // Kapalı bir bölümde etkin bir seçim varsa başlığındaki rozet bunu gösterir
  function rozetler() {
    const yaz = (id, metin) => { const r = $("#" + id); if (r) { r.textContent = metin; r.hidden = !metin; } };
    yaz("r-tur", state.turler.size < TURLER.length ? `${state.turler.size}/${TURLER.length}` : "");
    const n = [state.islev, state.topluluk, state.bolge, state.il, state.unesco].filter(Boolean).length;
    yaz("r-filtre", n ? T("rozet_etkin", { n }) : "");
    const k = ["#l-noktalar", "#l-iller"].filter(x => !$(x).checked).length;
    yaz("r-katman", k ? T("rozet_kapali", { n: k }) : "");
  }
  const GRUP_DEPO = "panel_gruplar";
  let grupKayit = {}; try { grupKayit = JSON.parse(localStorage.getItem(GRUP_DEPO) || "{}") || {}; } catch (e) { grupKayit = {}; }
  $$(".p-grup").forEach(d => {
    if (grupKayit[d.id] != null) d.open = grupKayit[d.id];
    d.addEventListener("toggle", () => {
      if (d.dataset.katlaniyor) return;
      grupKayit[d.id] = d.open; try { localStorage.setItem(GRUP_DEPO, JSON.stringify(grupKayit)); } catch (e) { /* yoksay */ }
    });
    d.querySelector("summary").addEventListener("click", e => {
      if (AZALT || !d.animate) return;
      e.preventDefault(); if (d.dataset.katlaniyor) return;
      const h1 = d.offsetHeight; d.open = !d.open; const h2 = d.offsetHeight, kapaniyor = !d.open;
      d.dataset.katlaniyor = "1"; if (kapaniyor) d.open = true;
      d.style.overflow = "hidden";
      d.animate([{ height: h1 + "px" }, { height: h2 + "px" }], { duration: Math.min(420, 200 + Math.abs(h2 - h1) * .5), easing: "cubic-bezier(.33,.0,.2,1)" })
        .finished.then(() => {
          d.style.overflow = ""; if (kapaniyor) d.open = false; delete d.dataset.katlaniyor;
          grupKayit[d.id] = d.open; try { localStorage.setItem(GRUP_DEPO, JSON.stringify(grupKayit)); } catch (er) { /* yoksay */ }
        });
    });
  });
  function grupAc(id) { const d = document.getElementById(id); if (d && !d.open) d.open = true; }

  // ---------------- Panelin tamamı gizlenir (geniş ekran): yalnızca haritada gezinmek isteyenler için ----------------
  const appEl = $(".app");
  function panelGizli(gizle, animasyon) {
    if (window.matchMedia("(max-width: 860px)").matches) gizle = false;
    if (gizle === appEl.classList.contains("panel-kapali")) return;
    const mw = $(".map-wrap"); let onceki = mw.getBoundingClientRect().left;
    // Panel kayarken harita sabit dursun: kap genişledikçe görünüm ters yönde kaydırılır
    const izle = () => {
      map.invalidateSize({ pan: false, animate: false });
      const sol = mw.getBoundingClientRect().left, dx = sol - onceki; onceki = sol;
      if (dx) map.panBy([dx, 0], { animate: false });
    };
    appEl.classList.toggle("panel-kapali", gizle);
    $("#panel-goster").hidden = !gizle; $("#panel-goster").setAttribute("aria-expanded", String(!gizle));
    $("#panel").toggleAttribute("inert", gizle);
    try { localStorage.setItem("panel", gizle ? "kapali" : "acik"); } catch (e) { /* yoksay */ }
    if (!animasyon || AZALT) { izle(); return; }
    const bitis = performance.now() + 450;
    (function kare() { izle(); if (performance.now() < bitis) requestAnimationFrame(kare); })();
    if (gizle) $("#panel-goster").focus({ preventScroll: true }); else $("#panel-gizle").focus({ preventScroll: true });
  }
  $("#panel-gizle").addEventListener("click", () => panelGizli(true, true));
  $("#panel-goster").addEventListener("click", () => panelGizli(false, true));
  try { if (localStorage.getItem("panel") === "kapali") panelGizli(true, false); } catch (e) { /* yoksay */ }
  window.addEventListener("resize", () => { if (window.matchMedia("(max-width: 860px)").matches && appEl.classList.contains("panel-kapali")) panelGizli(false, false); });
  $("#panel-close").addEventListener("click", () => togglePanel(false));
  map.on("click", () => {
    if (window.matchMedia("(max-width: 860px)").matches) togglePanel(false);
    if (!picking && !$("#drawer").hidden) closeDrawer();
  });

  // ---------------- Ayrıntı çekmecesi ----------------
  function openDrawer(y) {
    if (aktifMarker) { const el = aktifMarker.getElement(); if (el) el.classList.remove("is-active"); }
    aktifMarker = markers.get(y.no); $(".map-wrap").classList.add("cekmece-acik");
    const el = aktifMarker && aktifMarker.getElement(); if (el) el.classList.add("is-active");
    const gq = encodeURIComponent([y.ad.split(":").pop().split(" - ")[0], y.ilce !== "Merkez" ? y.ilce : "", y.il].filter(Boolean).join(" "));
    const unescoBadge = y.unesco ? `<span class="d-badge">${esc(y.unesco === "Kalıcı" ? T("unesco_dunya") : T("unesco_gecici"))}</span>` : "";
    const digerTur = y.icerir.length > 1 ? " (" + T("d_kayitta", { x: y.icerir.map(k => T("tur_" + { kilise: "Kilise", manastir: "Manastır", sapel: "Şapel" }[k]).toLocaleLowerCase(EN ? "en" : "tr")).join(", ") }) + ")" : "";
    const kaynak = y.kaynak && !/^Tez/.test(y.kaynak) ? esc(y.kaynak) + ". " : esc(T("d_kaynak_tez"));
    $("#drawer-body").innerHTML = `
      <div class="d-tur">${Ortak.ikon(y.tur)}${esc(turAd(y.tur))}${esc(digerTur)}</div>
      <h2>${esc(y.ad)}</h2>
      ${EN && AD_EN[y.no] ? `<p class="d-en-ad">${esc(AD_EN[y.no][0])} <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(AD_EN[y.no][1].replace(/ /g, "_"))}" target="_blank" rel="noopener">${esc(T("d_en_kaynak"))}</a></p>` : ""}
      <p class="d-place">${esc(konumMetni(y))}</p>
      <dl class="d-list">
        <div><dt>${esc(T("guncel_islevi"))}</dt><dd>${esc(islevAd(y))}</dd></div>
        <div><dt>${esc(T("d_korunma"))}</dt><dd>${esc(durumAd(y) || "–")} ${unescoBadge}</dd></div>
        <div><dt>${esc(T("d_topluluk"))}</dt><dd>${y.topluluk.length ? esc(y.topluluk.map(toplulukAd).join(", ")) : esc(T("belirtilmemis"))}</dd></div>
        <div><dt>${esc(T("bolge"))}</dt><dd>${esc(bolgeAd(y.bolge))}</dd></div>
      </dl>
      ${EN ? `<p class="d-ceviri">${esc(T("d_ceviri_not"))}</p><details class="d-ozgun"><summary>${esc(T("d_ozgun"))}</summary><p>${esc(y.islev)}. ${esc(y.durum)}</p></details>` : ""}
      <div class="d-approx"><b>${esc(T("d_yaklasik"))}</b> ${esc(T(hassKey(y.hassasiyet)))}${kara.has(y.no) ? " " + esc(T("d_karaya")) : ""} ${esc(T("d_duzelt_cagri"))}</div>
      <div class="d-photos" id="d-photos" hidden></div>
      <div class="d-actions">
        <button type="button" class="btn btn-ana" data-act="duzelt">${esc(T("btn_duzelt"))}</button>
        <button type="button" class="btn btn-ghost" data-act="foto">${esc(T("btn_foto"))}</button>
        <a class="btn btn-ghost" href="https://www.google.com/maps/search/?api=1&query=${gq}" target="_blank" rel="noopener">${esc(T("btn_gmaps"))}</a>
      </div>
      <p class="d-source">${kaynak}${y.sayfa ? ` (${esc(T("d_s"))} ${esc(y.sayfa)})` : ""}. ${esc(T("d_kayit_no"))} ${y.no}.</p>`;
    $("#drawer").hidden = false; $("#drawer").scrollTop = 0;
    $("#drawer-body").querySelector('[data-act="duzelt"]').addEventListener("click", () => formDuzeltme(y));
    $("#drawer-body").querySelector('[data-act="foto"]').addEventListener("click", () => formFoto(y));
    history.replaceState(null, "", location.pathname + location.search + "#yapi-" + y.no);
    fotolariGoster(y);
    $("#drawer-close").focus({ preventScroll: true });
    yapiyiGorunurKil(y);
  }
  // Bilgi kutusu açıldığında tıklanan yapı (ve halesi) kutunun altında kalmasın: harita kaydırılır
  function yapiyiGorunurKil(y) {
    const mk = markers.get(y.no); if (!mk) return;
    if (window.matchMedia("(hover: none)").matches) mk.closeTooltip();
    setTimeout(() => {
      const d = $("#drawer"); if (d.hidden) return;
      const M = mapEl.getBoundingClientRect(), D = d.getBoundingClientRect();
      const p = map.latLngToContainerPoint(mk.getLatLng());
      const mobil = window.matchMedia("(max-width: 860px)").matches;
      let hx = p.x, hy = p.y;
      if (mobil) {
        const ust = 120, alt = D.top - M.top - 56;          // üstteki düğmeler ile kutunun arası
        if (alt - ust < 40) return;
        if (p.y < ust || p.y > alt) hy = Math.round((ust + alt) / 2);
        if (p.x < 40 || p.x > M.width - 40) hx = Math.round(M.width / 2);
      } else {
        const sag = D.left - M.left - 70;
        if (p.x > sag) hx = Math.round((sag + 70) / 2 + 35);
        if (p.y < 70 || p.y > M.height - 70) hy = Math.round(M.height / 2);
      }
      if (hx !== p.x || hy !== p.y) map.panBy([p.x - hx, p.y - hy], { animate: !AZALT, duration: 0.5 });
    }, 60);
  }
  function closeDrawer() {
    $("#drawer").hidden = true; $(".map-wrap").classList.remove("cekmece-acik");
    if (aktifMarker) { const el = aktifMarker.getElement(); if (el) el.classList.remove("is-active"); aktifMarker = null; }
    history.replaceState(null, "", location.pathname + location.search);
  }
  $("#drawer-close").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#modal").open) { if (picking) pickBitir(null); else closeDrawer(); } });

  async function fotolariGoster(y) {
    if (!CFG.FEEDBACK_ENDPOINT || !CFG.SHOW_APPROVED_PHOTOS) return;
    try {
      await Ortak.yukle();
      const list = Ortak.fotolar.filter(f => String(f.no) === String(y.no));
      const box = $("#d-photos"); if (!box || !list.length) return;
      box.innerHTML = list.map(f => `<a href="${esc(f.url)}" target="_blank" rel="noopener" title="${esc(f.kredi || "")}"><img src="${esc(f.thumb || f.url)}" alt="${esc(y.ad)}${f.kredi ? ", " + esc(f.kredi) : ""}" loading="lazy"></a>`).join("");
      box.hidden = false;
    } catch (e) { /* fotoğraf yoksa kart fotoğrafsız açılır */ }
  }

  // ---------------- Konum seçme ----------------
  let picking = null, pickMarker = null;
  function pickBasla(cb) {
    picking = cb; $("#modal").close();
    $("#pick-banner").hidden = false; $(".map-wrap").classList.add("picking"); $("#drawer").hidden = true;
  }
  function pickBitir(latlng) {
    const cb = picking; picking = null;
    $("#pick-banner").hidden = true; $(".map-wrap").classList.remove("picking");
    if (latlng) { if (pickMarker) map.removeLayer(pickMarker); pickMarker = L.circleMarker(latlng, { radius: 9, color: "#F2C14E", weight: 3, fillOpacity: 0.2 }).addTo(map); }
    if (cb) cb(latlng);
  }
  map.on("click", e => { if (picking) pickBitir(e.latlng); });
  $("#pick-iptal").addEventListener("click", () => pickBitir(null));
  $("#geri").addEventListener("click", () => { closeDrawer(); ilSec(""); });
  $("#geri-il").addEventListener("click", () => ilceSec(""));

  // ---------------- Formlar ----------------
  const modal = $("#modal");
  function openModal(html) { $("#modal-body").innerHTML = html; if (!modal.open) modal.showModal(); }
  modal.addEventListener("close", () => { if (pickMarker && !picking) { map.removeLayer(pickMarker); pickMarker = null; } });

  const iletisimAlanlari = () => `
    <div class="two">
      <label class="f">${esc(T("f_ad"))} <span class="hint">${esc(T("f_istege"))}</span><input type="text" name="ad_soyad" autocomplete="name"></label>
      <label class="f">${esc(T("f_eposta"))} <span class="hint">${esc(T("f_eposta_not"))}</span><input type="email" name="eposta" autocomplete="email"></label>
    </div>
    <label class="hp" aria-hidden="true">${esc(T("f_hp"))}<input type="text" name="web_sitesi" tabindex="-1" autocomplete="off"></label>
    <label class="consent"><input type="checkbox" name="kvkk" required>${esc(T("f_kvkk"))}</label>`;
  function durumKutusu() {
    if (CFG.FEEDBACK_ENDPOINT) return "";
    return `<div class="msg err">${esc(T("f_kapali"))}${CFG.FEEDBACK_EMAIL ? " " + T("f_kapali_eposta", { e: `<a href="mailto:${esc(CFG.FEEDBACK_EMAIL)}">${esc(CFG.FEEDBACK_EMAIL)}</a>` }) : ""}</div>`;
  }
  const locVal = (p) => p && p.lat ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : T("isaretlenmedi");

  function formDuzeltme(y, prefill) {
    const alanlar = T("duz_alanlar"), alanlarTr = I.S.duz_alanlar[0];
    openModal(`
      <h2>${esc(T("duz_baslik"))}</h2>
      <p class="lead">${T("duz_lead", { ad: esc(y.ad), yer: esc(konumMetni(y)) })}</p>
      <form class="form" id="frm" novalidate>
        ${durumKutusu()}
        <label class="f">${esc(T("duz_alan"))}
          <select name="alan">${alanlar.map((a, i) => `<option value="${esc(alanlarTr[i])}">${esc(a)}</option>`).join("")}</select>
        </label>
        <label class="f">${esc(T("duz_dogrusu"))} <textarea name="aciklama" required placeholder="${esc(T("duz_ph"))}"></textarea></label>
        <div class="f">
          <span>${esc(T("dogru_konum"))} <span class="hint">${esc(T("f_istege"))}</span></span>
          <div class="loc-row"><button type="button" class="btn btn-ghost" id="btn-pick">${esc(T("haritada_isaretle"))}</button><span class="loc-val">${esc(locVal(prefill))}</span></div>
        </div>
        <label class="f">${esc(T("kaynak_alan"))} <span class="hint">${esc(T("kaynak_not"))}</span><input type="text" name="kaynak"></label>
        ${iletisimAlanlari()}
        <div id="frm-msg"></div>
        <div class="actions"><button type="submit" class="btn btn-ana">${esc(T("duz_gonder"))}</button></div>
      </form>`);
    const frm = $("#frm"); const loc = prefill && prefill.lat ? prefill : null;
    if (prefill) restoreForm(frm, prefill.form);
    $("#btn-pick").addEventListener("click", () => {
      const saved = new FormData(frm);
      pickBasla(ll => formDuzeltme(y, { lat: ll ? ll.lat : (loc && loc.lat), lng: ll ? ll.lng : (loc && loc.lng), form: saved }));
    });
    frm.addEventListener("submit", e => {
      e.preventDefault();
      gonder(frm, { tip: "duzeltme", yapi_no: y.no, yapi_adi: y.ad, il: y.il, ilce: y.ilce, enlem: loc ? loc.lat : "", boylam: loc ? loc.lng : "" }, T("duz_ok_b"), T("duz_ok_m"));
    });
  }

  function formYeni(prefill) {
    const islevler = ISLEV_SIRA.map(k => `<option value="${esc(k)}">${esc(islevKatAd(k))}</option>`).join("");
    openModal(`
      <h2>${esc(T("yeni_baslik"))}</h2>
      <p class="lead">${esc(T("yeni_lead"))}</p>
      <form class="form" id="frm" novalidate>
        ${durumKutusu()}
        <label class="f">${esc(T("yeni_ad"))} <input type="text" name="yapi_adi" required></label>
        <div class="two">
          <label class="f">${esc(T("turu"))}
            <select name="tur">${TURLER.map(t => `<option value="${t}">${esc(turAd(t))}</option>`).join("")}<option value="Emin değilim">${esc(T("emin_degilim"))}</option></select>
          </label>
          <label class="f">${esc(T("guncel_islevi"))}<select name="islev">${islevler}</select></label>
        </div>
        <div class="three">
          <label class="f">${esc(T("il"))} <select name="il" required><option value="">${esc(T("secin"))}</option>${ILLER.map(i => i.ad).sort((a, b) => a.localeCompare(b, "tr")).map(a => `<option>${esc(a)}</option>`).join("")}</select></label>
          <label class="f">${esc(T("ilce"))} <input type="text" name="ilce"></label>
          <label class="f">${esc(T("koy"))} <input type="text" name="koy"></label>
        </div>
        <div class="f">
          <span>${esc(T("konum"))}</span>
          <div class="loc-row"><button type="button" class="btn btn-ghost" id="btn-pick">${esc(T("haritada_isaretle"))}</button><span class="loc-val">${esc(locVal(prefill))}</span></div>
        </div>
        <label class="f">${esc(T("aciklama"))} <span class="hint">${esc(T("aciklama_not"))}</span><textarea name="aciklama"></textarea></label>
        <label class="f">${esc(T("kaynak_alan"))} <span class="hint">${esc(T("kaynak_not2"))}</span><input type="text" name="kaynak"></label>
        <label class="f">${esc(T("fotograf"))} <span class="hint">${esc(T("foto_not", { n: CFG.PHOTO_MAX_COUNT || 3 }))}</span><input type="file" name="foto" accept="image/*" multiple></label>
        <div class="thumbs" id="thumbs"></div>
        <label class="consent"><input type="checkbox" name="foto_izin">${esc(T("foto_izin"))}</label>
        ${iletisimAlanlari()}
        <div id="frm-msg"></div>
        <div class="actions"><button type="submit" class="btn btn-ana">${esc(T("yeni_gonder"))}</button></div>
      </form>`);
    const frm = $("#frm"); const loc = prefill && prefill.lat ? prefill : null;
    if (prefill) restoreForm(frm, prefill.form);
    const fotoSec = fotoAlani(frm);
    $("#btn-pick").addEventListener("click", () => {
      const saved = new FormData(frm);
      pickBasla(ll => formYeni({ lat: ll ? ll.lat : (loc && loc.lat), lng: ll ? ll.lng : (loc && loc.lng), form: saved }));
    });
    frm.addEventListener("submit", async e => {
      e.preventDefault();
      if (!loc) return hata(T("yeni_konum_hata"));
      const fotolar = await fotoSec();
      if (fotolar.length && !frm.foto_izin.checked) return hata(T("h_foto_izin"));
      gonder(frm, { tip: "yeni", enlem: loc.lat, boylam: loc.lng, fotolar }, T("yeni_ok_b"), T("yeni_ok_m"));
    });
  }

  function formFoto(y) {
    openModal(`
      <h2>${esc(T("foto_baslik"))}</h2>
      <p class="lead">${T("foto_lead", { ad: esc(y.ad), yer: esc(konumMetni(y)) })}</p>
      <form class="form" id="frm" novalidate>
        ${durumKutusu()}
        <label class="f">${esc(T("fotograflar"))} <span class="hint">${esc(T("foto_not2", { n: CFG.PHOTO_MAX_COUNT || 3 }))}</span><input type="file" name="foto" accept="image/*" multiple required></label>
        <div class="thumbs" id="thumbs"></div>
        <label class="f">${esc(T("cekim_tarihi"))} <span class="hint">${esc(T("cekim_not"))}</span><input type="text" name="cekim_tarihi" placeholder="${esc(T("cekim_ph"))}"></label>
        <label class="f">${esc(T("not_alan"))} <textarea name="aciklama" placeholder="${esc(T("not_ph"))}"></textarea></label>
        <label class="consent"><input type="checkbox" name="foto_izin" required>${esc(T("foto_izin"))}</label>
        ${iletisimAlanlari()}
        <div id="frm-msg"></div>
        <div class="actions"><button type="submit" class="btn btn-ana">${esc(T("foto_gonder"))}</button></div>
      </form>`);
    const frm = $("#frm"); const fotoSec = fotoAlani(frm);
    frm.addEventListener("submit", async e => {
      e.preventDefault();
      const fotolar = await fotoSec();
      if (!fotolar.length) return hata(T("h_foto_sec"));
      if (!frm.foto_izin.checked) return hata(T("h_foto_izin"));
      gonder(frm, { tip: "foto", yapi_no: y.no, yapi_adi: y.ad, il: y.il, ilce: y.ilce, fotolar }, T("foto_ok_b"), T("foto_ok_m"));
    });
  }

  function restoreForm(frm, fd) {
    if (!fd) return;
    for (const [k, v] of fd.entries()) { const el = frm.elements[k]; if (!el || el.type === "file") continue; if (el.type === "checkbox") el.checked = true; else el.value = v; }
  }
  function fotoAlani(frm) {
    const input = frm.elements.foto; const thumbs = $("#thumbs");
    let hazir = Promise.resolve([]);
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []).slice(0, CFG.PHOTO_MAX_COUNT || 3);
      hazir = Promise.all(files.map(kucult));
      hazir.then(list => { thumbs.innerHTML = list.map(f => `<img src="data:${f.mime};base64,${f.data}" alt="">`).join(""); }).catch(() => hata(T("h_foto_oku")));
    });
    return () => hazir.catch(() => []);
  }
  function kucult(file) {
    const max = CFG.PHOTO_MAX_EDGE || 1600;
    return new Promise((res, rej) => {
      const img = new Image(); const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        res({ ad: file.name.replace(/\.[^.]+$/, "") + ".jpg", mime: "image/jpeg", data: c.toDataURL("image/jpeg", 0.85).split(",")[1] });
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("okunamadı")); };
      img.src = url;
    });
  }
  function hata(msg) { $("#frm-msg").innerHTML = `<div class="msg err">${esc(msg)}</div>`; }

  async function gonder(frm, ekler, baslik, mesaj) {
    const fd = new FormData(frm);
    if (fd.get("web_sitesi")) return;
    if (!CFG.FEEDBACK_ENDPOINT) return hata(T("h_kapali"));
    if (!frm.kvkk.checked) return hata(T("h_onay"));
    const zorunlu = $$("[required]", frm).find(el => el.type !== "checkbox" && el.type !== "file" && !String(el.value).trim());
    if (zorunlu) { zorunlu.focus(); return hata(T("h_eksik")); }
    const veri = {};
    fd.forEach((v, k) => { if (k !== "foto" && k !== "web_sitesi") veri[k] = v; });
    Object.assign(veri, ekler, { dil: I.dil, sayfa: location.href, zaman: new Date().toISOString() });
    const btn = frm.querySelector('button[type="submit"]'); const eski = btn.textContent;
    btn.disabled = true; btn.textContent = T("gonderiliyor");
    try {
      await fetch(CFG.FEEDBACK_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(veri) });
      $("#modal-body").innerHTML = `<div class="done"><h2>${esc(baslik)}</h2><p>${esc(mesaj)}</p><form method="dialog"><button class="btn btn-ana">${esc(T("haritaya_don"))}</button></form></div>`;
    } catch (err) { btn.disabled = false; btn.textContent = eski; hata(T("h_ag")); }
  }

  // ---------------- Kılavuz, atıf ----------------
  $("#btn-hakkinda").addEventListener("click", () => openModal(`<div class="about">
      <h2>${esc(T("kil_baslik"))}</h2>
      <h3>${esc(T("kil_nokta_b"))}</h3>
      <p>${TURLER.map(t => `${Ortak.ikon(t)} ${esc(turAd(t))}`).join(" &nbsp; ")}</p>
      <p>${esc(T("kil_nokta_1"))}</p><p>${esc(T("kil_nokta_2"))}</p>
      <h3>${esc(T("kil_konum_b"))}</h3><p>${esc(T("kil_konum_1"))}</p>
      <h3>${esc(T("kil_katki_b"))}</h3><p>${esc(T("kil_katki_1"))}</p>
      <p><a href="index.html${EN ? "?lang=en" : ""}">${esc(T("kil_proje_link"))}</a></p>
    </div>`));
  function atifPenceresi() {
    openModal(`<div class="about"><h2>${esc(T("atif_nasil"))}</h2><p class="lead">${esc(T("atif_lead"))}</p><div data-atif-kutu>${Ortak.atifHtml(esc)}</div></div>`);
  }
  Ortak.atifBagla($("#modal"));
  $("#btn-atif").addEventListener("click", () => { atifPenceresi(); Ortak.yukle().then(() => { if (modal.open && $("[data-atif-kutu]")) $("[data-atif-kutu]").innerHTML = Ortak.atifHtml(esc); }); });
  $("#btn-yeni").addEventListener("click", () => formYeni());

  { const te = $("#tam-ekran"); if (te) te.href = "harita.html" + (EN ? "?lang=en" : ""); }

  // ---------------- Tema değişimi ----------------
  window.addEventListener("temadegisti", () => {
    altlikSade.setUrl(ALTLIK_URL[koyuMu() ? "koyu" : "acik"]);
    portolanCiz();
    cizIller(sonIlSay); cizLejant();
    if (vurgu) vurgu.setStyle({ color: HR().vurgu });
    ilceTemaYenile();
  });

  // ---------------- Dil geçişi: durumu sakla ve geri kur ----------------
  window.addEventListener("dilgecis", e => {
    const k = e.detail, c = map.getCenter(), m = location.hash.match(/^#yapi-(\d+)/);
    k.capa = null; k.hash = location.hash;
    k.harita = { turler: [...state.turler], islev: state.islev, topluluk: state.topluluk, bolge: state.bolge, il: state.il, ilce: state.ilce,
      unesco: state.unesco, ara: $("#f-ara").value, araKapsam: state.araKapsam, merkez: [c.lat, c.lng], zoom: map.getZoom(),
      acik: m ? +m[1] : null, panelY: $("#panel").scrollTop, panelAcik: $("#panel").classList.contains("open"),
      noktalar: $("#l-noktalar").checked, iller: $("#l-iller").checked };
  });
  function gecisHazirla() {
    const g = GECIS;
    state.turler = new Set((g.turler || TURLER).filter(t => TURLER.includes(t)));
    $$('input[name="tur"]').forEach(c => { c.checked = state.turler.has(c.value); });
    [["islev", "#f-islev"], ["topluluk", "#f-topluluk"], ["bolge", "#f-bolge"]].forEach(([a, sec]) => {
      const el = $(sec); if (g[a] && [...el.options].some(o => o.value === g[a])) { el.value = g[a]; state[a] = g[a]; }
    });
    state.unesco = !!g.unesco; $("#f-unesco").checked = state.unesco;
    $("#f-ara").value = g.ara || ""; state.ara = norm(g.ara || ""); state.araKapsam = g.araKapsam || "il";
    $("#l-noktalar").checked = g.noktalar !== false; $("#l-iller").checked = g.iller !== false;
    uygula();
    if (g.merkez) map.setView(g.merkez, g.zoom, { animate: false });
    setTimeout(gecisUygula, 4000);                 // il sınırları yüklenemezse de devam et
  }
  function gecisUygula() {
    if (!gecisBekle) return; gecisBekle = false;
    const g = GECIS;
    const gorunum = () => { if (g.merkez) map.setView(g.merkez, g.zoom, { animate: false }); $("#panel").scrollTop = g.panelY || 0; };
    const yapi = () => {
      const y = g.acik != null && YAPILAR.find(x => x.no === g.acik);
      if (y) { openDrawer(y); setTimeout(gorunum, 120); }
    };
    if (g.il && ILLER.some(i => i.ad === g.il)) {
      ilSec(g.il); state.araKapsam = g.araKapsam || "il"; aramaKapsamCiz(); uygula(); gorunum();
      if (g.ilce) {
        const bas = Date.now();
        (function dene() {
          if (ilceKatman) { ilceSec(g.ilce); gorunum(); yapi(); }
          else if (Date.now() - bas < 6000) setTimeout(dene, 120); else yapi();
        })();
      } else yapi();
    } else { gorunum(); yapi(); }
    if (g.panelAcik && window.matchMedia("(max-width: 860px)").matches) togglePanel(true);
  }

  // ---------------- Başlat ----------------
  Ortak.siteBilgi($("#site-bilgi"));
  uygula();
  ilSinirlariYukle();
  // Tarihsel bağlam sayfasından gelen topluluk bağlantısı: ?topluluk=Süryani
  const topParam = new URLSearchParams(location.search).get("topluluk");
  if (topParam && YAPILAR.some(y => y.topluluk.includes(topParam))) { state.topluluk = topParam; $("#f-topluluk").value = topParam; uygula(); }
  const islevParam = new URLSearchParams(location.search).get("islev");
  if (islevParam && ISLEV_SIRA.includes(islevParam)) { state.islev = islevParam; $("#f-islev").value = islevParam; uygula(); }
  const ilParam = new URLSearchParams(location.search).get("il");
  if (ilParam && ILLER.some(i => i.ad === ilParam)) ilSec(ilParam);
  const hm = location.hash.match(/^#yapi-(\d+)/);
  if (GECIS) gecisHazirla();
  else if (hm) { const y = YAPILAR.find(x => x.no === +hm[1]); if (y) { map.setView(konum(y), 12); yapiAc(y.no); } }

  Ortak.yukle().then(liste => {
    Ortak.siteBilgi($("#site-bilgi"));
    if (!liste) return;
    const yeni = Ortak.normalize(liste, ILLER); if (yeni.length < 50) return;
    const acikNo = aktifMarker ? [...markers.entries()].find(([, mk]) => mk === aktifMarker)?.[0] : null;
    acilis.aktif = false; mapEl.classList.remove("ilk");
    YAPILAR = yeni; window.YAPILAR = yeni;
    araHazirla(); try { karaHesapla(); } catch (e) { kara.clear(); } markerlariKur(); toplulukDoldur();
    if (state.il && ilceOnbellek[state.il]) ilceAta(state.il, ilceOnbellek[state.il]);
    uygula();
    if (acikNo != null) { const y = YAPILAR.find(x => x.no === acikNo); if (y) openDrawer(y); }
  });
  window.__harita = { map, uygula, state, markers, ilSec, ilceSec, ilceKatmani: () => ilceKatman, panelGoster: () => panelGizli(false, true) };
})();
