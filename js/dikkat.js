/* "Dikkat çeken yapılar" sayfası. Veri: js/dikkat-veri.js (window.DIKKAT). */
(function () {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const EN = !!(window.I18N && window.I18N.en);
  const L = (tr, en) => (EN ? en : tr);
  const C = window.CEVIRI_EN || null;
  const AD_EN = window.AD_EN || {};
  const TEMALAR = [
    { k: "inanc", ad: L("Yaşayan inanç ve gelenek", "Living faith and tradition"), acik: L("Bugün de ziyaret edilen, farklı inançlardan insanların paylaştığı ya da çevresinde inanışların sürdüğü yapılar.", "Buildings still visited today, shared by people of different faiths or surrounded by living beliefs.") },
    { k: "dag", ad: L("Dağların ve vadilerin kiliseleri", "Churches of the mountains and valleys"), acik: L("Dağ yamaçlarına, vadilere ve kayaların arasına saklanmış yapılar ve birden çok kiliseyi bir araya getiren rotalar.", "Buildings hidden on mountain slopes, in valleys and among rocks, and routes that link several churches.") },
    { k: "yeni", ad: L("Yeni hayatlar", "New lives"), acik: L("Müze, galeri, kütüphane, atölye ya da cami olarak yeni bir işlevle ayakta kalan yapılar.", "Buildings that survive with a new use as museums, galleries, libraries, workshops or mosques.") },
    { k: "mimari", ad: L("Mimari ve tarih", "Architecture and history"), acik: L("Büyüklükleri, planları ya da erken tarihleriyle öne çıkan yapılar.", "Buildings that stand out for their size, plan or early date.") }
  ];
  // Gözlemlerin İngilizcesi (A. Mecid Vergül'ün Türkçe notlarının anlamı korunarak çevrildi)
  const NOT_EN = {
    29: "Used by both Muslims and Christians.",
    618: "The church stands in the garden of a mosque’s lodging and is looked after by the religious official who lives there.",
    112: "It stands on the summit of the mountain. Armenians visit it every July.",
    453: "People believe they find healing by swimming in this chapel.",
    424: "The Seven Sleepers are said to have lived in this cave.",
    20: "It lies on a summit climbing route and serves as one of the shelters for mountaineers.",
    72: "It stands at the foot of the ancient Mount Didymus.",
    196: "A remarkable route: abandoned Greek villages deep in the mountains.",
    206: "Another remarkable route, with many churches along the valley.",
    207: "Another remarkable route, with many churches along the valley.",
    185: "A building hidden among the rocks in the mountains. It has been restored and turned into a museum.",
    158: "It seems hidden among the rocks. It dates from the second century AD.",
    488: "Reached on foot. Closed to visitors.",
    127: "Interesting for its unusual collection and because the museum building is a church.",
    151: "Some sources state that the robots built by al-Jazari were used in this palace.",
    441: "City library.",
    529: "Carpet-weaving workshop.",
    167: "It has dazzling architecture. A news report states that it will become a library after restoration.",
    48: "A huge building in the middle of the forest, still standing and restored as a mosque. It was saved from disappearing.",
    169: "Hidden in nature and largely still standing, it was saved from disappearing because it is used as a mosque.",
    234: "Included as one of the earliest churches.",
    402: "It has unique architecture.",
    532: "It has an unusual architectural plan.",
    439: "A magnificent building.",
    170: "One of the colossal buildings.",
    172: "One of the colossal buildings.",
    164: "Although it is in the countryside, it covers a large area. The main building looks very well preserved from the outside."
  };
  const cevir = {
    tur: t => (EN && C ? C.TUR[t] || t : t),
    topluluk: t => (EN && C && t ? t.split(/\s*,\s*/).map(x => C.TOPLULUK[x] || x).join(", ") : t),
    islev: t => (EN && C && t ? C.islev(t) : t),
    durum: t => (EN && C && t ? C.durum(t) : { metin: t, tam: true })
  };
  const veri = window.DIKKAT || [];
  const T = window.TURKIYE_SVG;
  const proj = (lng, lat) => [(lng - T.x0) * T.k * T.s, (T.y1 - lat) * T.s];

  function miniHarita(liste) {
    const noktalar = liste.map(o => proj(o.lng, o.lat));
    return `<svg class="mini-harita" viewBox="0 0 ${T.w} ${T.h}" role="img" aria-label="${esc(L("Bu temadaki yapıların Türkiye haritasındaki yerleri", "Locations of the buildings in this theme on the map of Türkiye"))}">
      <path class="mh-il" d="${T.d}"/>
      ${noktalar.map(([x, y], i) => `<g class="mh-nokta" data-no="${liste[i].no}" tabindex="0" aria-label="${esc(liste[i].ad)}"><title>${esc(liste[i].ad)}</title><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="21"/><text x="${x.toFixed(0)}" y="${y.toFixed(0)}">${i + 1}</text></g>`).join("")}
    </svg>`;
  }

  function kart(o, i) {
    const etiket = [cevir.tur(o.tur), cevir.topluluk(o.topluluk), cevir.islev(o.islev)].filter(Boolean).filter((v, j, a) => a.indexOf(v) === j);
    const not = EN && NOT_EN[o.no] ? NOT_EN[o.no] : o.not_;
    const d = cevir.durum(o.durum);
    return `<article class="yk" id="yapi-${o.no}" data-no="${o.no}">
      <span class="yk-no" aria-hidden="true">${i + 1}</span>
      <h3 lang="tr">${esc(o.ad)}</h3>${EN && AD_EN[o.no] ? `<p class="yk-en">${esc(AD_EN[o.no][0])}</p>` : ""}
      <p class="yk-konum">${esc(o.konum)}</p>
      <div class="yk-etiket">${etiket.map(e => `<span>${esc(e)}</span>`).join("")}</div>
      <blockquote${EN && !NOT_EN[o.no] ? ' lang="tr"' : ""}>${esc(not)}</blockquote>
      ${o.durum ? `<p class="yk-durum"><b>${esc(L("Durum", "Condition"))}:</b> <span${d.tam ? "" : ' lang="tr"'}>${esc(d.metin)}</span></p>` : ""}
      ${o.alt ? `<p class="yk-alt"><b>${esc(L("Kapsadığı yapılar", "Buildings included"))}:</b> <span lang="tr">${esc(o.alt.replace(/\s+-\s+/g, " · ").replace(/"/g, ""))}</span></p>` : ""}
      <div class="yk-dugmeler">
        <a class="harita-git" href="harita.html${EN ? "?lang=en" : ""}#yapi-${o.no}"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s6-5.6 6-10.2A6 6 0 0 0 4 7.8C4 12.4 10 18 10 18Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="8" r="2.2" fill="currentColor"/></svg>${esc(L("Haritada göster", "Show on map"))}</a>
        ${o.kaynak.length ? `<details><summary>${esc(L("Kaynaklar", "Sources"))} (${o.kaynak.length})</summary><ul>${o.kaynak.map(k => `<li><a href="${esc(k.u)}" target="_blank" rel="noopener">${esc(k.a)}</a></li>`).join("")}</ul></details>` : ""}
      </div>
    </article>`;
  }

  function goster(k, odak) {
    const t = TEMALAR.find(x => x.k === k) || TEMALAR[0];
    const liste = veri.filter(o => o.tema === t.k);
    document.querySelectorAll(".tema-sekmeler button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tema === t.k)));
    const alan = document.getElementById("tema-alan");
    alan.innerHTML = `<div class="tema-bas"><div><h2>${esc(t.ad)}</h2><p>${esc(t.acik)}</p></div>${miniHarita(liste)}</div>
      <div class="yapi-kartlar">${liste.map(kart).join("")}</div>`;
    alan.querySelectorAll(".mh-nokta").forEach(n => {
      const k2 = alan.querySelector(`.yk[data-no="${n.dataset.no}"]`);
      const vurgu = v => { n.classList.toggle("vurgu", v); k2.classList.toggle("vurgu", v); };
      n.addEventListener("mouseenter", () => vurgu(true)); n.addEventListener("mouseleave", () => vurgu(false));
      n.addEventListener("click", () => k2.scrollIntoView({ behavior: "smooth", block: "center" }));
      n.addEventListener("keydown", e => { if (e.key === "Enter") k2.scrollIntoView({ behavior: "smooth", block: "center" }); });
    });
    alan.querySelectorAll(".yk").forEach(k2 => {
      const n = alan.querySelector(`.mh-nokta[data-no="${k2.dataset.no}"]`);
      k2.addEventListener("mouseenter", () => n.classList.add("vurgu")); k2.addEventListener("mouseleave", () => n.classList.remove("vurgu"));
    });
    if (odak) { const el = document.getElementById("yapi-" + odak); if (el) setTimeout(() => { el.scrollIntoView({ block: "center" }); el.classList.add("vurgu"); }, 1300); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (EN) {
      document.title = "Notable buildings | Religious Tourism of Türkiye: Living Inventory Project";
      const r = document.querySelector(".rulo");
      r.querySelector("h1").textContent = "Notable buildings";
      r.querySelector(".alt-baslik").textContent = "27 buildings that stand out for their locations, stories and features";
      r.querySelector(".yontem").textContent = "During the thesis research, the buildings in the inventory that stand out for their locations, stories and features were identified through a separate content analysis. This page presents all 27 buildings from that analysis under four themes. The observations and the information on the condition of the buildings come from the working table of 2024 and earlier, when the thesis was completed. Their current condition may have changed. If you notice a change, you can report it from the building’s card on the map.";
      r.querySelector(".kaynak-not").textContent = "Observations: A. Mecid Vergül, content analysis within the thesis research. The source links come from the working table, and some of them may no longer be accessible.";
      document.querySelector(".tema-sekmeler").setAttribute("aria-label", "Themes");
    }
    const sek = document.querySelector(".tema-sekmeler");
    sek.innerHTML = TEMALAR.map(t => `<button type="button" role="tab" data-tema="${t.k}" aria-selected="false">${esc(t.ad)} <b>${veri.filter(o => o.tema === t.k).length}</b></button>`).join("");
    sek.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { goster(b.dataset.tema); history.replaceState(null, "", "#" + b.dataset.tema); } });
    const h = location.hash.slice(1), m = h.match(/^yapi-(\d+)$/);
    if (m) { const o = veri.find(x => x.no === +m[1]); goster(o ? o.tema : "inanc", m[1]); }
    else goster(TEMALAR.some(t => t.k === h) ? h : "inanc");
  });
})();
