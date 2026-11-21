/* Site turu: ilk ziyarette küçük bir davet kutusu, kabul edilirse sitenin gerçek öğeleri sırayla vurgulanır.
   Ana sayfa turu haritaya geçişle biter; harita turu ?tur=1 ile kendiliğinden başlar.
   Davet bir kez gösterilir (yerel depolama); "Site turu" bağlantıları turu her zaman yeniden açar. */
(function () {
  "use strict";
  const EN = !!(window.I18N && window.I18N.en);
  const L = (tr, en) => (EN ? en : tr);
  const kok = document.documentElement, govde = document.body;
  const HARITA = !!document.getElementById("map");
  const GIRIS = govde.classList.contains("giris");
  if (!HARITA && !GIRIS) return;
  const AZALT = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dar = () => window.matchMedia("(max-width: 860px)").matches;
  const gorunur = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
  const bul = (secici) => { for (const s of [].concat(secici || [])) { const el = document.querySelector(s); if (gorunur(el)) return el; } return null; };
  const depo = { al(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, koy(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* yoksay */ } } };

  // ---- Paneli dar ekranda açıp kapatma (harita) ----
  const panelAcik = () => { const p = document.getElementById("panel"); return !!p && p.classList.contains("open"); };
  function panel(ac) {
    if (!HARITA) return false;
    // Geniş ekranda panel gizlenmişse panel adımlarında yeniden açılır
    if (!dar()) { const app = document.querySelector(".app"), g = document.getElementById("panel-gizle"); if (ac && app && app.classList.contains("panel-sarili") && g) { g.click(); return true; } return false; }
    if (ac && !panelAcik()) { document.getElementById("panel-toggle")?.click(); return true; }
    if (!ac && panelAcik()) { document.getElementById("panel-close")?.click(); return true; }
    return false;
  }

  // Tur metinleri kısa tutulur ve yalnızca temel işlevleri anlatır
  const ADIMLAR_GIRIS = [
    { baslik: L("Hoş geldiniz", "Welcome"), metin: L("Bu site, Türkiye’deki kilise, manastır ve şapelleri tek bir haritada toplar ve ziyaretçi katkılarıyla güncellenir. Kısa bir turla başlıca bölümleri tanıyabilirsiniz.", "This site brings together the churches, monasteries and chapels of Türkiye on a single map and is updated with visitors’ contributions. A short tour introduces its main sections.") },
    { hedef: [".ust nav", ".menu-dugme"], baslik: L("Üst menü", "Top menu"), metin: L("Proje bilgileri, harita, tarihsel bağlam ve atıf bilgileri üst menüde yer alır.", "The top menu leads to the project information, the map, the historical context and the citation details.") },
    { hedef: ".ust [data-tema-dugme]", baslik: L("Gündüz ve gece", "Day and night"), metin: L("Bu düğmeyle açık ve koyu tema arasında geçiş yapabilirsiniz. Seçiminiz sonraki ziyaretinizde de korunur.", "This button switches between the light and dark themes. Your choice is kept for your next visit.") },
    { hedef: ".ust .dil-sec", baslik: L("Türkçe ve İngilizce", "Turkish and English"), metin: L("Sitenin tamamı Türkçe ve İngilizce okunabilir.", "The whole site is available in Turkish and English.") },
    { hedef: "#tur-rakam", baslik: L("Envanter bir bakışta", "The inventory at a glance"), metin: L("Bu bölüm, kayıtlı yapıların türlerine göre sayısını ve bugünkü kullanımlarını gösterir. Rakamlar güncel veriden otomatik olarak alınır.", "This section shows how many buildings are recorded by type and how they are used today. The figures are drawn automatically from the current data.") },
    { hedef: "#atif-kutu", baslik: L("Atıf", "Citation"), metin: L("Siteyi, tezi ya da makaleyi kaynak gösterirken hazır künyeleri buradan kopyalayabilirsiniz.", "Ready-made references for citing the site, the thesis or the article can be copied here.") },
    { hedef: ".kartus-dugmeler .btn-ana", baslik: L("Haritayı açın", "Open the map"), metin: L("Envanterin asıl yeri haritadır. Harita turu, il, ilçe ve yapı kartlarının kullanımını gösterir.", "The inventory lives on the map. The map tour shows how to use provinces, districts and building cards."), son: { etiket: L("Harita turuna geç", "Continue on the map"), git: "harita.html?tur=1" + (EN ? "&lang=en" : "") } },
  ];
  const ADIMLAR_HARITA = [
    { panel: false, baslik: L("Harita", "The map"), metin: L("Haritadaki her işaret bir kilise, manastır ya da şapeli gösterir.", "Each marker on the map stands for a church, a monastery or a chapel.") },
    { panel: false, hedef: "#map", baslik: L("İller ve ilçeler", "Provinces and districts"), metin: L("Bir ile tıkladığınızda harita o ile yaklaşır ve ilçeler görünür. Sayılı daireler yakın yapıları bir arada gösterir. Bir yapıya tıkladığınızda bilgi kartı açılır.", "Clicking a province zooms in and shows its districts. Numbered circles group nearby buildings. Clicking a building opens its information card.") },
    { panel: false, hedef: "#legend", baslik: L("Lejant", "Legend"), metin: L("Lejant, ikonların ve il renklerinin anlamını açıklar. Bir yapı türüne tıklayarak o türü haritada gizleyebilir ya da yeniden gösterebilirsiniz.", "The legend explains the icons and province colours. Click a building type to hide it on the map or show it again.") },
    { panel: true, hedef: "#f-ara", baslik: L("Arama", "Search"), metin: L("Bir yapıyı, ili ya da ilçeyi adıyla arayabilirsiniz.", "Search for a building, province or district by name.") },
    { panel: true, hedef: "#f-turler", baslik: L("Filtreler", "Filters"), metin: L("Yapıları türe, bugünkü işleve, topluluğa, bölgeye ve ile göre süzebilirsiniz.", "Filter the buildings by type, present-day use, community, region and province.") },
    { panel: true, hedef: ".provinces", baslik: L("Liste", "List"), metin: L("Seçilen il ya da ilçedeki yapılar burada listelenir.", "Buildings in the selected province or district are listed here.") },
    { panel: true, hedef: "#btn-yeni", baslik: L("Katkıda bulunun", "Contribute"), metin: L("Haritada bulunmayan bir yapıyı buradan önerebilirsiniz. Kayıtlı yapılar için düzeltme ve fotoğrafları bilgi kartından gönderebilirsiniz.", "You can suggest a building that is missing from the map here. Corrections and photos for recorded buildings can be sent from their information cards.") },
    { panel: true, hedef: "#foot-daha", baslik: L("Kılavuz ve atıf", "Guide and citation"), metin: L("Haritayı okuma kılavuzu, atıf bilgileri ve site turu bu bölümde yer alır.", "The map reading guide, the citation details and this tour are in this section.") },
  ];
  const ADIMLAR = HARITA ? ADIMLAR_HARITA : ADIMLAR_GIRIS;

  // ---- Tur katmanları ----
  let i = 0, kat = null, isik = null, balon = null, oncekiOdak = null, hedefEl = null;
  function kur() {
    kat = document.createElement("div"); kat.className = "tur-kat"; kat.setAttribute("aria-hidden", "true");
    isik = document.createElement("div"); isik.className = "tur-isik"; isik.setAttribute("aria-hidden", "true");
    balon = document.createElement("div"); balon.className = "tur-balon"; balon.setAttribute("role", "dialog"); balon.setAttribute("aria-modal", "true"); balon.setAttribute("aria-labelledby", "tur-baslik");
    govde.append(kat, isik, balon);
    window.addEventListener("resize", yerlestir); window.addEventListener("scroll", yerlestir, true);
    document.addEventListener("keydown", tus, true);
    // Kaydırmaya bağlı hareketler (paralaks, yapışkan öğeler) kaydırma olayından sonra gelebilir; tur açıkken her karede hizalanır
    const dongu = () => { if (!balon) return; yerlestir(); requestAnimationFrame(dongu); };
    requestAnimationFrame(dongu);
  }
  function tus(e) {
    if (!balon) return;
    if (e.key === "Escape") { e.preventDefault(); kapat(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); ileri(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); geri(); }
  }
  function goster() {
    const a = ADIMLAR[i];
    let degisti = HARITA && "panel" in a ? panel(a.panel) : false;
    // Hedef kapalı bir panel bölümündeyse bölüm açılır
    [].concat(a.hedef).forEach(sec => { const h = document.querySelector(sec); const d = h && h.closest("details.p-grup"); if (d && !d.open) { d.open = true; degisti = true; } });
    balon.innerHTML = `<p class="tur-sira">${i + 1} / ${ADIMLAR.length}</p>
      <h2 id="tur-baslik">${a.baslik}</h2><p class="tur-metin">${a.metin}</p>
      <div class="tur-dugmeler">
        <button type="button" class="link-btn tur-kapat">${L("Turu kapat", "Close tour")}</button>
        <span>${i > 0 ? `<button type="button" class="btn btn-ghost tur-geri">${L("Geri", "Back")}</button>` : ""}
        ${a.son ? `<a class="btn btn-ana tur-git" href="${a.son.git}">${a.son.etiket}</a>` : `<button type="button" class="btn btn-ana tur-ileri">${i === ADIMLAR.length - 1 ? L("Bitir", "Finish") : L("İleri", "Next")}</button>`}</span>
      </div>`;
    balon.querySelector(".tur-kapat").addEventListener("click", kapat);
    balon.querySelector(".tur-geri")?.addEventListener("click", geri);
    balon.querySelector(".tur-ileri")?.addEventListener("click", ileri);
    const git = balon.querySelector(".tur-git");
    if (git) git.addEventListener("click", () => kapat(true));
    const bekle = degisti ? 620 : 0;   // panelin kayma süresi
    balon.classList.add("tur-gizli");
    setTimeout(() => {
      hedefEl = bul(a.hedef);
      if (hedefEl) hedefEl.scrollIntoView({ block: "center", inline: "nearest", behavior: AZALT ? "auto" : "smooth" });
      setTimeout(() => { yerlestir(); balon.classList.remove("tur-gizli"); (balon.querySelector(".tur-ileri, .tur-git") || balon).focus({ preventScroll: true }); }, hedefEl && !AZALT ? 380 : 30);
    }, bekle);
  }
  function yerlestir() {
    if (!balon) return;
    const W = window.innerWidth, H = window.innerHeight, pay = 8, bosluk = 14;
    if (!hedefEl || !gorunur(hedefEl)) {
      isik.style.cssText = `left:${W / 2}px;top:${H / 2}px;width:0;height:0;`; isik.classList.add("tur-isiksiz");
      balon.style.left = Math.max(12, (W - balon.offsetWidth) / 2) + "px"; balon.style.top = Math.max(12, (H - balon.offsetHeight) / 2) + "px"; return;
    }
    isik.classList.remove("tur-isiksiz");
    const r = hedefEl.getBoundingClientRect();
    const x = Math.max(4, r.left - pay), y = Math.max(4, r.top - pay), w = Math.min(W - 8, r.right + pay) - x, h = Math.min(H - 8, r.bottom + pay) - y;
    isik.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;
    const bw = balon.offsetWidth, bh = balon.offsetHeight;
    let bx, by;
    if (y + h + bosluk + bh < H - 8) { by = y + h + bosluk; bx = x + w / 2 - bw / 2; }           // altına
    else if (y - bosluk - bh > 8) { by = y - bosluk - bh; bx = x + w / 2 - bw / 2; }            // üstüne
    else if (x + w + bosluk + bw < W - 8) { bx = x + w + bosluk; by = y + h / 2 - bh / 2; }     // sağına
    else if (x - bosluk - bw > 8) { bx = x - bosluk - bw; by = y + h / 2 - bh / 2; }            // soluna
    else { bx = x + w / 2 - bw / 2; by = y + h - bh - 18; }                                    // büyük hedefin içine, alta
    balon.style.left = Math.min(W - bw - 10, Math.max(10, bx)) + "px";
    balon.style.top = Math.min(H - bh - 10, Math.max(10, by)) + "px";
  }
  function ileri() { if (i < ADIMLAR.length - 1) { i++; goster(); } else kapat(); }
  function geri() { if (i > 0) { i--; goster(); } }
  function kapat(gecis) {
    if (!balon) return;
    window.removeEventListener("resize", yerlestir); window.removeEventListener("scroll", yerlestir, true);
    document.removeEventListener("keydown", tus, true);
    [kat, isik, balon].forEach(e => e && e.remove()); kat = isik = balon = hedefEl = null;
    kok.classList.remove("tur-acik");
    if (HARITA && gecis !== true) panel(false);
    if (oncekiOdak && oncekiOdak.focus) try { oncekiOdak.focus({ preventScroll: true }); } catch (e) { /* yoksay */ }
  }
  function baslat() {
    davetKapat(); depo.koy("tur_davet", "1");
    if (balon) return;
    oncekiOdak = document.activeElement; i = 0; kok.classList.add("tur-acik"); kur(); goster();
  }

  // ---- İlk ziyaret daveti ----
  let davet = null;
  function davetKapat() { if (davet) { davet.remove(); davet = null; } }
  function davetGoster() {
    davet = document.createElement("div"); davet.className = "tur-davet"; davet.setAttribute("role", "region"); davet.setAttribute("aria-label", L("Site turu", "Site tour"));
    davet.innerHTML = `<p><b>${L("Siteyi bir dakikada tanıyın", "Get to know the site in a minute")}</b>${HARITA ? L("Haritanın nasıl kullanıldığını birkaç adımda gösterelim.", "A few steps on how to use the map.") : L("Başlıca bölümleri ve haritayı kısaca gösterelim.", "A short look at the main sections and the map.")}</p>
      <div class="tur-dugmeler"><button type="button" class="link-btn tur-sonra">${L("Şimdi değil", "Not now")}</button><button type="button" class="btn btn-ana tur-basla">${L("Turu başlat", "Start the tour")}</button></div>`;
    // Davet boş bir yere yerleşir: ana sayfada kahraman alanının sağ üst köşesindeki boş alana (Karadeniz kıyısının üstü) (dar ekranda künye kutusunun içine),
    // haritada panelin başına (dar ekranda haritanın üst kısmına)
    if (GIRIS) {
      const kah = document.querySelector(".kahraman"), kar = document.querySelector(".kartus .rulo-yaprak") || document.querySelector(".kartus");
      if (!dar() && kah) { davet.classList.add("tur-davet--kose"); kah.appendChild(davet); }
      else if (kar) { davet.classList.add("tur-davet--akis"); kar.appendChild(davet); }
      else govde.appendChild(davet);
    } else {
      const bas = document.querySelector("#panel .panel-head");
      if (!dar() && bas) { davet.classList.add("tur-davet--akis", "tur-davet--panel"); bas.after(davet); }
      else { davet.classList.add("tur-davet--ust"); govde.appendChild(davet); }
    }
    davet.querySelector(".tur-basla").addEventListener("click", baslat);
    davet.querySelector(".tur-sonra").addEventListener("click", () => { depo.koy("tur_davet", "1"); davetKapat(); });
  }

  // "Site turu" bağlantıları
  document.addEventListener("click", e => { const b = e.target.closest("[data-site-turu]"); if (!b) return; e.preventDefault(); baslat(); });
  window.SiteTuru = { baslat };

  const istek = new URLSearchParams(location.search).get("tur") === "1";
  if (istek) {
    depo.koy("tur_davet", "1");
    setTimeout(baslat, HARITA ? 1600 : 600);
    try { const u = new URL(location.href); u.searchParams.delete("tur"); history.replaceState(null, "", u.toString()); } catch (e) { /* yoksay */ }
  } else if (new URLSearchParams(location.search).get("davet") === "1" || (!depo.al("tur_davet") && !location.hash)) {   // ?davet=1: önizleme için daveti yeniden göster
    setTimeout(() => { if (!balon && !davet) davetGoster(); }, 2600);
  }
})();
