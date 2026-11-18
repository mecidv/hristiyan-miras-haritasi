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
    if (!HARITA || !dar()) return false;
    if (ac && !panelAcik()) { document.getElementById("panel-toggle")?.click(); return true; }
    if (!ac && panelAcik()) { document.getElementById("panel-close")?.click(); return true; }
    return false;
  }

  const ADIMLAR_GIRIS = [
    { baslik: L("Hoş geldiniz", "Welcome"), metin: L("Bu site, Türkiye'deki kilise, manastır ve şapelleri tek bir haritada toplayan, ziyaretçi katkılarıyla güncellenen yaşayan bir envanterdir. Bir dakikada başlıca bölümleri gösterelim.", "This site brings together the churches, monasteries and chapels of Türkiye on a single map, as a living inventory updated with visitors' contributions. Here are the main parts in about a minute.") },
    { hedef: [".ust nav", ".menu-dugme"], baslik: L("Üst menü", "Top menu"), metin: L("Proje, ekip, harita, tarihsel bağlam, tasarım dili, sık sorulan sorular, atıf ve iletişim bölümlerine buradan ulaşırsınız. Menü, sayfayı kaydırsanız da üstte kalır.", "The project, team, map, historical context, design language, FAQ, citation and contact sections are all reachable from here. The menu stays at the top as you scroll.") },
    { hedef: ".ust [data-tema-dugme]", baslik: L("Gündüz ve gece", "Day and night"), metin: L("Açık tema Piri Reis haritasından, koyu tema lapis lazuli taşından ilham alır. Seçiminiz bir sonraki ziyaretinizde de hatırlanır.", "The light theme is inspired by the Piri Reis map, the dark theme by lapis lazuli. Your choice is remembered for your next visit.") },
    { hedef: ".ust .dil-sec", baslik: L("Türkçe ve İngilizce", "Turkish and English"), metin: L("Sitenin tamamı iki dilde okunabilir.", "The whole site can be read in both languages.") },
    { hedef: "#tur-rakam", baslik: L("Envanter bir bakışta", "The inventory at a glance"), metin: L("Kayıtlı yapıların türlere göre sayısı ve bugün nasıl kullanıldıkları. Rakamlar e-tablodaki güncel veriden gelir.", "How many buildings are recorded by type, and how they are used today. The figures come from the live spreadsheet.") },
    { hedef: "#atif-kutu", baslik: L("Atıf", "Citation"), metin: L("Siteyi, tezi ya da makaleyi kaynak gösterecekseniz APA, Chicago gibi biçimlerde hazır künyeleri buradan kopyalayabilirsiniz.", "If you cite the site, the thesis or the article, ready-made references in APA, Chicago and other styles can be copied here.") },
    { hedef: ".kartus-dugmeler .btn-ana", baslik: L("Haritayı açın", "Open the map"), metin: L("Envanterin asıl yeri harita. Harita turuyla devam ederek il, ilçe ve yapı kartlarının nasıl kullanıldığını görebilirsiniz.", "The map is where the inventory lives. Continue with the map tour to see how provinces, districts and building cards work."), son: { etiket: L("Harita turuna geç", "Continue on the map"), git: "harita.html?tur=1" + (EN ? "&lang=en" : "") } },
  ];
  const ADIMLAR_HARITA = [
    { panel: false, baslik: L("Harita", "The map"), metin: L("Haritadaki her işaret bir yapıdır: kilise, manastır ya da şapel. Birkaç adımda nasıl kullanılacağını gösterelim.", "Every marker on the map is a building: a church, a monastery or a chapel. Here is how to use it in a few steps.") },
    { panel: false, hedef: "#map", baslik: L("İller ve ilçeler", "Provinces and districts"), metin: L("Bir ile tıklayınca harita o ile yaklaşır ve ilçe sınırları açılır; bir ilçeye tıklayınca o ilçenin yapıları listelenir. Sayılı daireler birbirine yakın yapıları bir arada gösterir, tıklayınca açılır. Bir yapıya tıklayınca bilgi kartı açılır.", "Click a province to zoom in and show its districts; click a district to list its buildings. Numbered circles group nearby buildings and open when clicked. Click a building to open its information card.") },
    { panel: false, hedef: "#legend", baslik: L("Lejant", "Legend"), metin: L("İkonların anlamı ve il renklerinin gösterdiği kayıt sayısı burada. Köşedeki okla açıp kapatabilirsiniz.", "What the icons mean and how many records each province colour stands for. Use the arrow to open or close it.") },
    { panel: true, hedef: "#f-ara", baslik: L("Arama", "Search"), metin: L("Bir yapıyı, ili ya da ilçeyi adıyla arayın.", "Search for a building, province or district by name.") },
    { panel: true, hedef: "#f-turler", baslik: L("Filtreler", "Filters"), metin: L("Yapı türüne, bugünkü işlevine, topluluğa, bölgeye ya da ile göre süzün. Hemen altındaki seçeneklerle UNESCO listesindeki yapıları ayrıca gösterebilirsiniz.", "Filter by building type, present-day use, community, region or province. The options just below also let you show UNESCO-listed sites.") },
    { panel: true, hedef: ".provinces", baslik: L("Liste", "List"), metin: L("Seçtiğiniz il ya da ilçedeki yapılar burada sıralanır. Bilgi kartında yapının işlevi, durumu, kaynağı ve konumu yer alır; oradan bilgi düzeltmesi ya da fotoğraf gönderebilirsiniz.", "Buildings in the selected province or district are listed here. The information card shows each building's use, condition, source and location, and lets you send a correction or a photo.") },
    { panel: true, hedef: "#btn-yeni", baslik: L("Katkıda bulunun", "Contribute"), metin: L("Haritada olmayan bir yapıyı buradan önerebilirsiniz. Gönderiler incelendikten sonra haritaya eklenir.", "Suggest a building that is missing from the map. Submissions are reviewed before they are added.") },
    { panel: true, hedef: ".foot-links", baslik: L("Kılavuz ve atıf", "Guide and citation"), metin: L("Haritayı okuma kılavuzu ve atıf bilgileri burada. Bu turu da \"Site turu\" bağlantısıyla dilediğiniz zaman yeniden başlatabilirsiniz.", "The map reading guide and citation details are here. You can restart this tour any time with the \"Site tour\" link.") },
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
    const degisti = HARITA && "panel" in a ? panel(a.panel) : false;
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
    const bekle = degisti ? 280 : 0;   // panelin kayma süresi
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
      const kah = document.querySelector(".kahraman"), kar = document.querySelector(".kartus");
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
