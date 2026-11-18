/* "Dikkat çeken yapılar" sayfası. Veri: js/dikkat-veri.js (window.DIKKAT). */
(function () {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const TEMALAR = [
    { k: "inanc", ad: "Yaşayan inanç ve gelenek", acik: "Bugün de ziyaret edilen, farklı inançlardan insanların paylaştığı ya da çevresinde inanışların sürdüğü yapılar." },
    { k: "dag", ad: "Dağların ve vadilerin kiliseleri", acik: "Dağ yamaçlarına, vadilere ve kayaların arasına saklanmış yapılar ve birden çok kiliseyi bir araya getiren rotalar." },
    { k: "yeni", ad: "Yeni hayatlar", acik: "Müze, galeri, kütüphane, atölye ya da cami olarak yeni bir işlevle ayakta kalan yapılar." },
    { k: "mimari", ad: "Mimari ve tarih", acik: "Büyüklükleri, planları ya da erken tarihleriyle öne çıkan yapılar." }
  ];
  const veri = window.DIKKAT || [];
  const T = window.TURKIYE_SVG;
  const proj = (lng, lat) => [(lng - T.x0) * T.k * T.s, (T.y1 - lat) * T.s];

  function miniHarita(liste) {
    const noktalar = liste.map(o => proj(o.lng, o.lat));
    return `<svg class="mini-harita" viewBox="0 0 ${T.w} ${T.h}" role="img" aria-label="Bu temadaki yapıların Türkiye haritasındaki yerleri">
      <path class="mh-il" d="${T.d}"/>
      ${noktalar.map(([x, y], i) => `<g class="mh-nokta" data-no="${liste[i].no}" tabindex="0" aria-label="${esc(liste[i].ad)}"><title>${esc(liste[i].ad)}</title><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="21"/><text x="${x.toFixed(0)}" y="${y.toFixed(0)}">${i + 1}</text></g>`).join("")}
    </svg>`;
  }

  function kart(o, i) {
    const etiket = [o.tur, o.topluluk, o.islev].filter(Boolean).filter((v, j, a) => a.indexOf(v) === j);
    return `<article class="yk" id="yapi-${o.no}" data-no="${o.no}">
      <span class="yk-no" aria-hidden="true">${i + 1}</span>
      <h3>${esc(o.ad)}</h3>
      <p class="yk-konum">${esc(o.konum)}</p>
      <div class="yk-etiket">${etiket.map(e => `<span>${esc(e)}</span>`).join("")}</div>
      <blockquote>${esc(o.not_)}</blockquote>
      ${o.durum ? `<p class="yk-durum"><b>Durum:</b> ${esc(o.durum)}</p>` : ""}
      ${o.alt ? `<p class="yk-alt"><b>Kapsadığı yapılar:</b> ${esc(o.alt.replace(/\s+-\s+/g, " · ").replace(/"/g, ""))}</p>` : ""}
      <div class="yk-dugmeler">
        <a class="harita-git" href="harita.html${window.I18N && window.I18N.en ? "?lang=en" : ""}#yapi-${o.no}"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s6-5.6 6-10.2A6 6 0 0 0 4 7.8C4 12.4 10 18 10 18Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="8" r="2.2" fill="currentColor"/></svg>Haritada göster</a>
        ${o.kaynak.length ? `<details><summary>Kaynaklar (${o.kaynak.length})</summary><ul>${o.kaynak.map(k => `<li><a href="${esc(k.u)}" target="_blank" rel="noopener">${esc(k.a)}</a></li>`).join("")}</ul></details>` : ""}
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
    // Bu sayfanın İngilizce çevirisi henüz yok: İngilizce arayüzde bunu açıkça belirt
    if (window.I18N && window.I18N.en) {
      const h1 = document.querySelector(".rulo h1");
      if (h1) h1.insertAdjacentHTML("afterend", '<p class="dil-not" lang="en">This page is currently available in Turkish only. An English version will follow.</p>');
      document.title = "Notable buildings | Religious Tourism of Türkiye: Living Inventory Project";
    }
    const sek = document.querySelector(".tema-sekmeler");
    sek.innerHTML = TEMALAR.map(t => `<button type="button" role="tab" data-tema="${t.k}" aria-selected="false">${esc(t.ad)} <b>${veri.filter(o => o.tema === t.k).length}</b></button>`).join("");
    sek.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { goster(b.dataset.tema); history.replaceState(null, "", "#" + b.dataset.tema); } });
    const h = location.hash.slice(1), m = h.match(/^yapi-(\d+)$/);
    if (m) { const o = veri.find(x => x.no === +m[1]); goster(o ? o.tema : "inanc", m[1]); }
    else goster(TEMALAR.some(t => t.k === h) ? h : "inanc");
  });
})();
