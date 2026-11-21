/* "Dönüşen yapılar" ve "Tur programlarındaki yapılar" sayfaları: ortak çizim.
   Veri js/liste-veri.js içindedir (tez sürecindeki çalışma tablosu, envanter kayıtlarıyla eşleştirilmiş).
   Sayfa, <body data-liste="donusen|tur"> ile hangi listeyi göstereceğini seçer. */
(function () {
  "use strict";
  const EN = !!(window.I18N && window.I18N.en);
  const L = (tr, en) => (EN ? en : tr);
  const C = window.CEVIRI_EN || null;
  const AD_EN = window.AD_EN || {};
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const T = window.TURKIYE_SVG;
  const proj = (lng, lat) => [(lng - T.x0) * T.k * T.s, (T.y1 - lat) * T.s];
  const tur = t => (EN && C ? C.TUR[t] || t : t);
  const topluluk = t => (EN && C ? t.split(/\s*,\s*/).map(x => C.TOPLULUK[x] || x).join(", ") : t);
  const islev = t => (EN && C ? C.islev(t) : t);
  const durum = t => { if (!EN || !C || !t) return { metin: t, tam: true }; return C.durum(t); };

  const SAYFALAR = {
    donusen: {
      veri: window.DONUSEN || [],
      baslik: L("Dönüşen yapılar", "Repurposed buildings"),
      alt: n => L(`Cami, müze ya da kültür merkezi olarak yeni bir işlev kazanan ${n} yapı`, `${n} buildings that took on a new life as mosques, museums or cultural centres`),
      yontem: n => L(
        `Tez çalışmasındaki taramalar sırasında birçok kilise, manastır ve şapelin cami, kültür merkezi ya da müze gibi farklı işlevlerle kullanıldığı ve kaynaklarda farklı adlarla geçtiği görülmüştür (Vergül, 2024). Bu sayfada, tez sürecindeki çalışma tablosunda yeniden işlevlendirilmiş olarak kaydedilen ${n} yapı, bugünkü işlevlerine göre dört grupta yer alır. Bilgiler tezin tamamlandığı 2024 yılı ve öncesine aittir ve yapıların güncel durumu değişmiş olabilir.`,
        `During the thesis research, many churches, monasteries and chapels were found to be used for other purposes, such as mosques, cultural centres or museums, and to appear under different names in the sources (Vergül, 2024). This page lists the ${n} buildings recorded as repurposed in the working table of the thesis, grouped by their present-day use. The information dates from 2024 or earlier, when the thesis was completed, and the current situation may have changed.`),
      gruplar: [
        { k: "cami", ad: L("Cami", "Mosques"), acik: L("Bugün cami olarak kullanılan yapılar.", "Buildings used as mosques today.") },
        { k: "muze", ad: L("Müze", "Museums"), acik: L("Müze olarak ziyarete açılan yapılar.", "Buildings opened to visitors as museums.") },
        { k: "kultur", ad: L("Kültür, sanat ve eğitim", "Culture, arts and education"), acik: L("Kültür merkezi, kütüphane, galeri, atölye ya da eğitim merkezi olarak kullanılan yapılar.", "Buildings used as cultural centres, libraries, galleries, workshops or education centres.") },
        { k: "oren", ad: L("Ören yeri", "Archaeological sites"), acik: L("Ören yeri olarak korunan yapı toplulukları.", "Building complexes preserved as archaeological sites.") }
      ],
      grup: o => o.kat,
      ek: o => o.not_ ? `<p class="yk-not"><b>${esc(L("Çalışma tablosundaki not", "Note in the working table"))}:</b> <span lang="tr">${esc(o.not_)}</span></p>` : "",
      kaynakNot: L("Kaynak: A. Mecid Vergül, tez çalışması kapsamındaki çalışma tablosu (2024 ve öncesi). Kaynak bağlantıları bu tablodan alınmıştır ve bazılarına artık erişilemeyebilir.",
        "Source: A. Mecid Vergül, working table of the thesis research (2024 and earlier). The source links come from this table, and some of them may no longer be accessible.")
    },
    tur: {
      veri: window.TUR_PROG || [],
      baslik: L("Tur programlarındaki yapılar", "Buildings in tour programmes"),
      alt: n => L(`Seyahat acentalarının tur programlarında yer alan ${n} yapı`, `${n} buildings included in the programmes of travel agencies`),
      yontem: n => L(
        `Tez çalışmasında yerli ve yabancı seyahat acentalarının tur programları incelenmiştir. Tezde, yabancı Hristiyan gruplara yönelik "Biblical tour" programlarının birbirine benzediği ve alternatif yapılara yer vermediği, yerli acentaların ise kültür turizmi ile inanç turizmini harmanladığı belirtilmektedir (Vergül, 2024). Bu sayfada, çalışma tablosunda en az bir acentanın tur programında yer aldığı kaydedilen ${n} yapı ve bu yapıları programına alan acentalar yer alır. Bilgiler 2024 yılı ve öncesine aittir.`,
        `The thesis examined the tour programmes of domestic and international travel agencies. It notes that "Biblical tour" programmes for foreign Christian groups resemble one another and leave out alternative sites, while domestic agencies combine cultural and faith tourism (Vergül, 2024). This page lists the ${n} buildings recorded in the working table as part of at least one agency's tour programme, together with those agencies. The information dates from 2024 or earlier.`),
      gruplar: null,
      ek: o => o.acenta.length ? `<p class="yk-not"><b>${esc(L("Programına alan acentalar", "Agencies including it"))} (${o.acenta.length}):</b> ${esc(o.acenta.join(", "))}</p>` : "",
      kaynakNot: L("Kaynak: A. Mecid Vergül, tez çalışması kapsamındaki çalışma tablosu (2024 ve öncesi). Acenta adları tablodaki biçimiyle aktarılmıştır. Kaynak bağlantıları bu tablodan alınmıştır ve bazılarına artık erişilemeyebilir.",
        "Source: A. Mecid Vergül, working table of the thesis research (2024 and earlier). Agency names are given as recorded in the table. The source links come from this table, and some of them may no longer be accessible.")
    }
  };
  const S = SAYFALAR[document.body.dataset.liste];
  if (!S) return;

  function miniHarita(liste) {
    return `<svg class="mini-harita kalabalik" viewBox="0 0 ${T.w} ${T.h}" role="img" aria-label="${esc(L("Bu listedeki yapıların Türkiye haritasındaki yerleri", "Locations of the buildings in this list on the map of Türkiye"))}">
      <path class="mh-il" d="${T.d}"/>
      ${liste.map((o, i) => { const [x, y] = proj(o.lng, o.lat); return `<g class="mh-nokta" data-no="${o.no}" tabindex="0" aria-label="${esc(o.ad)}"><title>${i + 1}. ${esc(o.ad)}</title><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9"/></g>`; }).join("")}
    </svg>`;
  }

  function kart(o, i) {
    const etiket = [tur(o.tur), o.topluluk ? topluluk(o.topluluk) : "", islev(o.islev)].filter(Boolean).filter((v, j, a) => a.indexOf(v) === j);
    const d = durum(o.durum);
    const enAd = EN && AD_EN[o.no] ? `<p class="yk-en">${esc(AD_EN[o.no][0])}</p>` : "";
    return `<article class="yk" id="yapi-${o.no}" data-no="${o.no}">
      <span class="yk-no" aria-hidden="true">${i + 1}</span>
      <h3 lang="tr">${esc(o.ad)}</h3>${enAd}
      <p class="yk-konum">${esc(o.konum)}</p>
      <div class="yk-etiket">${etiket.map(e => `<span>${esc(e)}</span>`).join("")}</div>
      ${S.ek(o)}
      ${o.durum ? `<p class="yk-durum"><b>${esc(L("Korunma durumu", "Protection status"))}:</b> <span${d.tam ? "" : ' lang="tr"'}>${esc(d.metin)}</span></p>` : ""}
      ${o.adres ? `<p class="yk-alt"><b>${esc(L("Adres", "Address"))}:</b> ${esc(o.adres)}</p>` : ""}
      <div class="yk-dugmeler">
        <a class="harita-git" href="harita.html${EN ? "?lang=en" : ""}#yapi-${o.no}"><svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s6-5.6 6-10.2A6 6 0 0 0 4 7.8C4 12.4 10 18 10 18Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="8" r="2.2" fill="currentColor"/></svg>${esc(L("Haritada göster", "Show on map"))}</a>
        ${o.kaynak.length ? `<details><summary>${esc(L("Kaynaklar", "Sources"))} (${o.kaynak.length})</summary><ul>${o.kaynak.map(k => `<li><a href="${esc(k.u)}" target="_blank" rel="noopener">${esc(k.a)}</a></li>`).join("")}</ul></details>` : ""}
      </div>
    </article>`;
  }

  function goster(k, odak) {
    const g = S.gruplar ? (S.gruplar.find(x => x.k === k) || S.gruplar[0]) : null;
    const liste = g ? S.veri.filter(o => S.grup(o) === g.k) : S.veri;
    document.querySelectorAll(".tema-sekmeler button").forEach(b => b.setAttribute("aria-selected", String(!!g && b.dataset.tema === g.k)));
    const alan = document.getElementById("tema-alan");
    const bas = g ? `<div><h2>${esc(g.ad)}</h2><p>${esc(g.acik)}</p></div>` : `<div><h2>${esc(L("Yapıların yerleri", "Where they are"))}</h2><p>${esc(L("Haritadaki bir noktanın üstüne gelince ya da tıklayınca ilgili yapı vurgulanır.", "Hover over or click a point on the map to highlight its building."))}</p></div>`;
    alan.innerHTML = `<div class="tema-bas">${bas}${miniHarita(liste)}</div><div class="yapi-kartlar">${liste.map(kart).join("")}</div>`;
    alan.querySelectorAll(".mh-nokta").forEach(n => {
      const k2 = alan.querySelector(`.yk[data-no="${n.dataset.no}"]`);
      const vurgu = v => { n.classList.toggle("vurgu", v); k2.classList.toggle("vurgu", v); };
      n.addEventListener("mouseenter", () => vurgu(true)); n.addEventListener("mouseleave", () => vurgu(false));
      const git = () => k2.scrollIntoView({ behavior: "smooth", block: "center" });
      n.addEventListener("click", git); n.addEventListener("keydown", e => { if (e.key === "Enter") git(); });
    });
    alan.querySelectorAll(".yk").forEach(k2 => {
      const n = alan.querySelector(`.mh-nokta[data-no="${k2.dataset.no}"]`);
      k2.addEventListener("mouseenter", () => n.classList.add("vurgu")); k2.addEventListener("mouseleave", () => n.classList.remove("vurgu"));
    });
    if (odak) { const el = document.getElementById("yapi-" + odak); if (el) setTimeout(() => { el.scrollIntoView({ block: "center" }); el.classList.add("vurgu"); }, 1300); }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const n = S.veri.length;
    document.title = `${S.baslik} | ${L("Türkiye İnanç Turizmi Yaşayan Envanter Projesi", "Religious Tourism of Türkiye: Living Inventory Project")}`;
    document.querySelector(".rulo h1").textContent = S.baslik;
    document.querySelector(".rulo .alt-baslik").textContent = S.alt(n);
    document.querySelector(".rulo .yontem").textContent = S.yontem(n);
    document.querySelector(".rulo .kaynak-not").textContent = S.kaynakNot;
    const sek = document.querySelector(".tema-sekmeler");
    if (S.gruplar) {
      sek.setAttribute("aria-label", L("Gruplar", "Groups"));
      sek.innerHTML = S.gruplar.map(g => `<button type="button" role="tab" data-tema="${g.k}" aria-selected="false">${esc(g.ad)} <b>${S.veri.filter(o => S.grup(o) === g.k).length}</b></button>`).join("");
      sek.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { goster(b.dataset.tema); history.replaceState(null, "", "#" + b.dataset.tema); } });
    } else sek.remove();
    const h = location.hash.slice(1), m = h.match(/^yapi-(\d+)$/);
    if (m) { const o = S.veri.find(x => x.no === +m[1]); goster(o && S.gruplar ? S.grup(o) : null, m[1]); }
    else goster(S.gruplar && S.gruplar.some(g => g.k === h) ? h : S.gruplar ? S.gruplar[0].k : null);
  });
})();
