/* Deneme 4: rulo çizimleri. Bütün parçalar burada SVG olarak çizilir; dışarıdan görsel kullanılmaz.
   Çizimler tema değişince yeniden üretilir ve CSS değişkenleri olarak kök öğeye yazılır. */
(function () {
  "use strict";
  const kok = document.documentElement;
  const svgUrl = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const bas = (w, h, ic, oran) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${oran ? ` preserveAspectRatio="${oran}"` : ""}>${ic}</svg>`;

  // Yatay çizilmiş, ucu solda duran bir parçayı dört yöne çevirir
  function yon(w, h, ic, y, oran) {
    if (y === "sol") return bas(w, h, ic, oran);
    if (y === "sag") return bas(w, h, `<g transform="translate(${w} 0) scale(-1 1)">${ic}</g>`, oran);
    if (y === "ust") return bas(h, w, `<g transform="translate(${h} 0) rotate(90)">${ic}</g>`, oran);
    return bas(h, w, `<g transform="translate(0 ${w}) rotate(-90)">${ic}</g>`, oran);
  }

  const RENK = {
    acik: {
      ahsap: ["#2E1A0A", "#5A3618", "#9C6A3A", "#D9A66E", "#B9844F", "#6E4421", "#3B220F"],
      kagitUc: "#EADBB2", kagitCizgi: "#8E7043", murekkep: "rgba(110, 70, 30, .5)", murekkepKoyu: "rgba(96, 56, 20, .62)"
    },
    koyu: {
      ahsap: ["#3E2E08", "#7A5E1C", "#C9A548", "#FFF0B8", "#E7CC78", "#9C7C2A", "#5A4512"],
      kagitUc: "#22356E", kagitCizgi: "#C9A548", murekkep: "rgba(240, 210, 122, .5)", murekkepKoyu: "rgba(240, 210, 122, .7)"
    }
  };
  const gradyan = (id, renkler) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${renkler.map((r, i) => `<stop offset="${(i / (renkler.length - 1)).toFixed(3)}" stop-color="${r}"/>`).join("")}</linearGradient>`;

  // B: torna işi ahşap topuz (genişlik 28, yükseklik 32). Gece temasında yaldızlı.
  function topuz(R) {
    const d = `<defs>${gradyan("t", R.ahsap.slice().reverse())}</defs>`;
    const s = `fill="url(#t)"`;
    return d + `<g ${s}>
      <rect x="19" y="12.4" width="9.5" height="7.2"/>
      <rect x="18.2" y="10.4" width="1.8" height="11.2" rx=".8"/>
      <rect x="14.6" y="8.6" width="4" height="14.8" rx="1.6"/>
      <rect x="12.6" y="12" width="2.6" height="8"/>
      <path d="M3.8 16C3.8 9.6 6.6 5.6 9.4 5.6S13.6 9.8 13.6 16 12.2 26.4 9.4 26.4 3.8 22.4 3.8 16Z"/>
      <ellipse cx="2.6" cy="16" rx="2.6" ry="3.4"/>
    </g>
    <g fill="none" stroke="rgba(0,0,0,.28)" stroke-width=".5"><path d="M14.6 9.6v12.8M18.6 9.6v12.8M13.6 12.6v6.8"/></g>
    <path d="M6.2 11.2C7 8.6 8.2 7.4 9.4 7.4" fill="none" stroke="rgba(255,250,230,.55)" stroke-width=".9" stroke-linecap="round"/>`;
  }

  // A: parşömenin kendi üstüne sarılmış ucu (genişlik 10, yükseklik 22), içinde sarmal görünür
  function kagitUc(R) {
    let p = "";
    for (let t = 0; t <= 5.2 * Math.PI; t += 0.25) {
      const r = (t / (5.2 * Math.PI)) * 9.6;
      p += `${p ? "L" : "M"}${(5 + 0.42 * r * Math.sin(t)).toFixed(2)} ${(11 - r * Math.cos(t)).toFixed(2)}`;
    }
    return `<ellipse cx="5" cy="11" rx="4.7" ry="10.7" fill="${R.kagitUc}" stroke="${R.kagitCizgi}" stroke-width=".7"/>
      <path d="${p}" fill="none" stroke="${R.kagitCizgi}" stroke-width=".55" opacity=".85"/>`;
  }

  // C: kısa ahşap kapak (genişlik 9, yükseklik 26)
  function kapak(R) {
    return `<defs>${gradyan("k", R.ahsap.slice().reverse())}</defs>
      <rect x="1.6" y="1" width="7.4" height="24" rx="2.6" fill="url(#k)"/>
      <ellipse cx="2.4" cy="13" rx="2.2" ry="11.6" fill="url(#k)" stroke="rgba(0,0,0,.3)" stroke-width=".5"/>
      <ellipse cx="2.4" cy="13" rx="1" ry="5" fill="none" stroke="rgba(0,0,0,.25)" stroke-width=".5"/>`;
  }

  // C: rulo üstünde mürekkep sarmaşık deseni (karo: 120 × 20)
  function sarmasik(R) {
    return `<g fill="none" stroke="${R.murekkep}" stroke-width=".8" stroke-linecap="round">
      <path d="M0 10C15 2 25 18 40 10S65 2 80 10 105 18 120 10"/>
      <path d="M22 7.6c-2.8-3.4 1.8-6.2 3.6-3.4 1.2 1.9-1 3.6-2.2 2.2"/>
      <path d="M62 12.4c-2.8 3.4 1.8 6.2 3.6 3.4 1.2-1.9-1-3.6-2.2-2.2"/>
      <path d="M100 7.6c-2.8-3.4 1.8-6.2 3.6-3.4 1.2 1.9-1 3.6-2.2 2.2"/>
      <path d="M44 9.4q5-6 10-2.4-5 3.6-10 2.4z"/><path d="M84 10.6q5 6 10 2.4-5-3.6-10-2.4z"/>
    </g>`;
  }

  // C: yaprak köşesinde mürekkep süsleme (64 × 64, sol üst köşe için çizildi)
  function kose(R) {
    return `<g fill="none" stroke="${R.murekkepKoyu}" stroke-width="1" stroke-linecap="round">
      <path d="M5 60C5 32 10 15 22 9 31 4.5 44 5 60 5"/>
      <path d="M11 54C13 36 17 25 26 19 33 14.6 42 13.6 50 14.6" opacity=".7"/>
      <path d="M21 22c4.6-4.6 11.4-.4 8.2 5-2.2 3.6-7.6 2.6-7-1.6.4-2.6 3.6-3.2 4.6-1.2"/>
      <path d="M31 11q7-7 14-2.4-7 4.4-14 2.4z"/><path d="M9 33q-6 7-2 13.6 4-7 2-13.6z"/>
    </g><g fill="${R.murekkepKoyu}"><circle cx="60" cy="5" r="1.4"/><circle cx="5" cy="60" r="1.4"/><circle cx="38" cy="22" r="1"/></g>`;
  }
  const koseYon = (ic, y) => {
    const t = { "ust-sol": "", "ust-sag": "translate(64 0) scale(-1 1)", "alt-sol": "translate(0 64) scale(1 -1)", "alt-sag": "translate(64 64) scale(-1 -1)" }[y];
    return bas(64, 64, `<g transform="${t}">${ic}</g>`);
  };

  function ciz() {
    const R = RENK[kok.dataset.tema === "koyu" ? "koyu" : "acik"];
    const v = {};
    const t = topuz(R), k = kagitUc(R), c = kapak(R);
    ["sol", "sag", "ust", "alt"].forEach(y => {
      v[`--b-topuz-${y}`] = svgUrl(yon(28, 32, t, y));
      v[`--a-uc-${y}`] = svgUrl(yon(10, 22, k, y, "none"));
      v[`--c-kapak-${y}`] = svgUrl(yon(9, 26, c, y, "none"));
    });
    v["--c-sarmasik-yatay"] = svgUrl(bas(120, 20, sarmasik(R)));
    v["--c-sarmasik-dikey"] = svgUrl(bas(20, 120, `<g transform="translate(20 0) rotate(90)">${sarmasik(R)}</g>`));
    const ki = kose(R);
    ["ust-sol", "ust-sag", "alt-sol", "alt-sag"].forEach(y => { v[`--c-kose-${y}`] = svgUrl(koseYon(ki, y)); });
    Object.entries(v).forEach(([a, d]) => kok.style.setProperty(a, d));
  }

  // ---------- Kaydırmalı düğmeler: TR/EN, gündüz/gece ve seçenek seçici aynı bileşeni kullanır ----------
  function kaydirmali(grup, secili) {
    const dugmeler = [...grup.querySelectorAll("button")];
    const i = Math.max(0, dugmeler.findIndex(b => b.dataset.deger === secili));
    dugmeler.forEach((b, j) => b.setAttribute("aria-pressed", j === i ? "true" : "false"));
    grup.style.setProperty("--n", dugmeler.length);
    grup.style.setProperty("--i", i);
  }

  const DIL = {
    tr: {
      h1: "Rulo tasarımı: üç seçenek", gir: "Haritadaki kutuların üç farklı rulo biçimi aşağıdaki sahnede denenebilir. Çizimler örnek görsellerden yalnızca fikir alınarak CSS ve SVG ile sıfırdan yapıldı.",
      ipucu: "Sarılı bir kutuya tıklayınca açılır; açık kutu, başlığına ya da çubuğuna tıklayınca sarılır.",
      a: "Kâğıt kıvrımı", b: "Ahşap topuzlu", c: "Süslemeli",
      aAcik: "Parşömenin uçları kendi üstüne sarılır; sarmal, rulonun yan yüzünde görünür. Ahşap parça yoktur, en sade seçenektir.",
      bAcik: "Parşömen torna işi bir ahşap çubuğa sarılır; çubuğun iki ucunda topuzlar durur. Gece temasında topuzlar yaldızlıdır.",
      cAcik: "Kâğıt kıvrımına kısa ahşap kapaklar ve mürekkeple çizilmiş ince sarmaşık bezemesi eklenir; yaprağın köşelerinde süsleme bulunur.",
      kesfet: "Haritada keşfet", kayit: "kayıt gösteriliyor", kilise: "kilise", manastir: "manastır", sapel: "şapel",
      tur: "Yapı türü", tKilise: "Kilise", tManastir: "Manastır", tSapel: "Şapel", ara: "Yapı veya yer adı ara", oner: "Listede olmayan bir yapı öner",
      lejant: "Lejant", ilde: "İldeki kayıt sayısı",
      dTur: "Manastır", dYer: "Trabzon, Maçka", dIslev: "Güncel işlevi", dIslevD: "Müze", dKor: "Korunma durumu ve UNESCO", dKorD: "UNESCO Dünya Mirası Geçici Listesi’nde yer almaktadır: Sümela Manastırı (Trabzon) 2000", dTop: "Topluluk / mezhep", dTopD: "Rum / Yunan", dBol: "Bölge", dBolD: "Karadeniz", dKay: "Kaynak: Tez Ek C, Tablo 6 (s. 232). Kayıt no 588.", rozet: "UNESCO Geçici Liste",
      gunduz: "Gündüz", gece: "Gece", secenek: "Rulo seçeneği", tema: "Tema", dil: "Dil"
    },
    en: {
      h1: "Scroll design: three options", gir: "Three scroll styles for the boxes on the map can be tried in the scene below. The drawings were made from scratch in CSS and SVG, taking only the idea from the reference images.",
      ipucu: "Click a rolled box to open it; click the title or a roller of an open box to roll it up.",
      a: "Paper curl", b: "Wooden finials", c: "Ornamented",
      aAcik: "The ends of the parchment roll onto themselves, and the spiral shows on the side of the roll. There are no wooden parts; this is the plainest option.",
      bAcik: "The parchment is wound on a turned wooden rod with finials at both ends. In the night theme the finials are gilded.",
      cAcik: "Short wooden caps and a fine ink vine are added to the paper curl, and the corners of the sheet carry ornaments.",
      kesfet: "Explore the map", kayit: "records shown", kilise: "churches", manastir: "monasteries", sapel: "chapels",
      tur: "Building type", tKilise: "Church", tManastir: "Monastery", tSapel: "Chapel", ara: "Search a building or place", oner: "Suggest a building not on the list",
      lejant: "Legend", ilde: "Records per province",
      dTur: "Monastery", dYer: "Trabzon, Maçka", dIslev: "Current use", dIslevD: "Museum", dKor: "Protection status and UNESCO", dKorD: "On the UNESCO World Heritage Tentative List: Sümela Manastırı (Trabzon) 2000", dTop: "Community / denomination", dTopD: "Greek Orthodox", dBol: "Region", dBolD: "Black Sea", dKay: "Source: thesis, Appendix C, Table 6 (p. 232). Record no. 588.", rozet: "UNESCO Tentative List",
      gunduz: "Day", gece: "Night", secenek: "Scroll option", tema: "Theme", dil: "Language"
    }
  };
  let dil = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "tr";
  function metinler() {
    const M = DIL[dil];
    kok.lang = dil;
    document.querySelectorAll("[data-m]").forEach(el => { el.textContent = M[el.dataset.m]; });
    document.querySelectorAll("[data-m-aria]").forEach(el => { el.setAttribute("aria-label", M[el.dataset.mAria]); });
    document.querySelectorAll("[data-m-ph]").forEach(el => { el.placeholder = M[el.dataset.mPh]; });
    const s = document.body.dataset.secenek;
    document.getElementById("secenek-acik").textContent = M[s + "Acik"];
    document.querySelector(".r4-drawer h2").textContent = dil === "en" ? "Sumela Monastery" : "Sümela Manastırı";
  }

  function temaUygula(t) {
    kok.dataset.tema = t;
    try { localStorage.setItem("tema", t); } catch (e) { /* yoksay */ }
    kaydirmali(document.getElementById("k-tema"), t);
    ciz();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest(".kaydirmali button"); if (!b) return;
    const grup = b.closest(".kaydirmali");
    if (grup.id === "k-tema") temaUygula(b.dataset.deger);
    else if (grup.id === "k-dil") { dil = b.dataset.deger; kaydirmali(grup, dil); history.replaceState(null, "", "?lang=" + dil); metinler(); }
    else if (grup.id === "k-secenek") { document.body.dataset.secenek = b.dataset.deger; kaydirmali(grup, b.dataset.deger); metinler(); }
  });

  // ---------- Sarma ve açma ----------
  // Sarılı kutunun her yeri açar; açık kutuda yalnızca başlık ve çubuklar sarar (filtreler ve bağlantılar etkilenmez)
  const AZALT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function sar(kutu, sarili) {
    if (kutu.classList.contains("sarili") === sarili) return;
    const ic = kutu.querySelector(".r4-icerik");
    const bas = ic.offsetHeight;
    kutu.classList.toggle("sarili", sarili);
    kutu.setAttribute("aria-expanded", String(!sarili));
    if (AZALT) return;
    const son = ic.offsetHeight;
    kutu.classList.add("donuyor");
    const a = ic.animate([{ height: bas + "px" }, { height: son + "px" }], { duration: Math.round(Math.min(620, 280 + Math.abs(bas - son) * .5)), easing: "cubic-bezier(.45,.05,.3,1)" });
    a.onfinish = () => kutu.classList.remove("donuyor");
  }
  document.querySelectorAll("[data-sarilir]").forEach(kutu => {
    kutu.addEventListener("click", e => {
      if (kutu.classList.contains("sarili")) { sar(kutu, false); return; }
      if (e.target.closest(".r4-cubuk, .r4-baslik")) sar(kutu, true);
    });
    kutu.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && e.target === kutu && kutu.classList.contains("sarili")) { e.preventDefault(); sar(kutu, false); }
    });
  });

  let tema = kok.dataset.tema === "koyu" ? "koyu" : "acik";
  kaydirmali(document.getElementById("k-dil"), dil);
  kaydirmali(document.getElementById("k-secenek"), document.body.dataset.secenek);
  temaUygula(tema);
  metinler();
  requestAnimationFrame(() => kok.classList.add("hazir"));
})();
