/* Dil sistemi: Türkçe / İngilizce.
   Seçim ?lang=en adres parametresinden ya da tarayıcıda hatırlanan tercihten gelir. */
(function () {
  "use strict";
  const S = {
    // Ortak
    marka_baslik: ["Türkiye İnanç Turizmi Yaşayan Envanter Projesi", "Religious Tourism of Türkiye: Living Inventory Project"],
    marka_alt: ["Kilise, manastır ve şapel envanteri", "An inventory of churches, monasteries and chapels"],
    nav_proje: ["Proje", "Project"], nav_ekip: ["Ekip", "Team"], nav_atif: ["Atıf", "Cite"], nav_harita: ["Harita", "Map"], nav_iletisim: ["İletişim", "Contact"],
    dil_etiket: ["Dil seçimi", "Language"],
    kapat: ["Kapat", "Close"], vazgec: ["Vazgeç", "Cancel"], tumu: ["Tümü", "All"],
    tur_Kilise: ["Kilise", "Church"], tur_Manastır: ["Manastır", "Monastery"], tur_Şapel: ["Şapel", "Chapel"],
    tur_cok_Kilise: ["kilise", "churches"], tur_cok_Manastır: ["manastır", "monasteries"], tur_cok_Şapel: ["şapel", "chapels"],
    kayit: ["kayıt", "records"], il_kucuk: ["il", "provinces"],

    // Harita sayfası
    harita_title: ["Harita | Türkiye İnanç Turizmi Yaşayan Envanter Projesi", "Map | Religious Tourism of Türkiye: Living Inventory Project"],
    panel_kapat: ["Haritaya dön", "Back to map"], panel_baslik: ["Haritada keşfet", "Explore the map"],
    kayit_gosteriliyor: ["kayıt gösteriliyor", "records shown"],
    ara_ph: ["Yapı, il veya ilçe ara", "Search by name, province or district"],
    yapi_turu: ["Yapı türü", "Building type"], guncel_islevi: ["Güncel işlevi", "Current use"], topluluk: ["Topluluk", "Community"],
    bolge: ["Bölge", "Region"], il: ["İl", "Province"], ilce: ["İlçe", "District"],
    yalniz_unesco: ["Yalnızca UNESCO listelerindekiler", "UNESCO-listed only"],
    yapilari_goster: ["Yapıları göster", "Show buildings"], il_yogunluk_goster: ["İl yoğunluğunu göster", "Show density by province"],
    filtre_temizle: ["Filtreleri temizle", "Clear filters"], illere_gore: ["İllere göre", "By province"],
    yeni_oner: ["Listede olmayan bir yapı öner", "Suggest a missing building"],
    kilavuz: ["Haritayı okuma kılavuzu", "How to read the map"], atif_nasil: ["Nasıl atıf yapılır?", "How to cite"],
    veri_indir: ["Veriyi indir (CSV)", "Download data (CSV)"], filtreler_btn: ["Filtreler", "Filters"],
    pick_banner: ["Haritada yapının bulunduğu yere tıklayın", "Click the building’s location on the map"],
    lejant: ["Lejant", "Legend"], ildeki_kayit: ["İldeki kayıt sayısı", "Records per province"],
    daire_not: ["Daire büyüklüğü kayıt sayısını gösterir.", "Circle size shows the number of records."],
    konum_yaklasik_not: ["Noktaların konumu yaklaşıktır.", "Locations are approximate."],
    altlik_sade: ["Sade harita", "Plain map"], altlik_ayrintili: ["Ayrıntılı harita (OpenStreetMap)", "Detailed map (OpenStreetMap)"],
    tip_konum: ["Konum", "Location"], tip_korunma: ["Korunma", "Protection"],
    tip_hint: ["Ayrıntılar ve geribildirim için tıklayın", "Click for details and feedback"],
    il_tip_yok: ["Bu filtrelerle kayıt yok", "No records with these filters"],
    liste_bos: ["Bu filtrelerle eşleşen kayıt yok. Filtreleri genişletmeyi deneyin.", "No records match these filters. Try widening them."],

    // Ayrıntı kartı
    d_kayitta: ["kayıtta {x} geçiyor", "the record also mentions {x}"],
    d_korunma: ["Korunma durumu ve UNESCO", "Protection status and UNESCO"],
    d_topluluk: ["Topluluk / mezhep", "Community / denomination"], belirtilmemis: ["Belirtilmemiş", "Not specified"],
    d_yaklasik: ["Konum yaklaşıktır.", "Approximate location."],
    d_duzelt_cagri: ["Doğru yeri biliyorsanız düzeltme gönderin.", "If you know the exact location, please send a correction."],
    hass_Yapı: ["Nokta, yapının veya ören yerinin yaklaşık konumundadır.", "The marker shows the approximate position of the building or site."],
    hass_Köy: ["Nokta, tezde belirtilen köy veya mahallenin yaklaşık merkezindedir; yapının tam yeri değildir.", "The marker is at the approximate centre of the village or neighbourhood given in the thesis, not at the building itself."],
    hass_İlçe: ["Tezde köy düzeyinde konum verilmediği için nokta ilçe merkezine yakın konulmuştur; yapının tam yeri değildir.", "The thesis gives no village-level location, so the marker is placed near the district centre."],
    hass_İl: ["Tezde ilçe belirtilmediği için nokta il merkezine yakın konulmuştur.", "The thesis gives no district, so the marker is placed near the province centre."],
    hass_Ziyaretçi: ["Konum bir ziyaretçi tarafından işaretlenmiş ve proje yürütücüsünce onaylanmıştır.", "The location was marked by a visitor and approved by the project team."],
    btn_duzelt: ["Bilgi düzeltmesi gönder", "Send a correction"], btn_foto: ["Fotoğraf gönder", "Send a photo"],
    btn_gmaps: ["Google Haritalar’da ara", "Search on Google Maps"],
    d_kaynak_tez: ["Kaynak: Tez Ek C, Tablo 6", "Source: thesis, Appendix C, Table 6"], d_s: ["s.", "p."], d_kayit_no: ["Kayıt no", "Record no."],
    d_ozgun: ["Özgün Türkçe kayıt", "Original Turkish record"],
    d_ceviri_not: ["", "Use and status information is translated from the Turkish inventory; building names are given in their original form."],
    unesco_dunya: ["UNESCO Dünya Mirası", "UNESCO World Heritage"], unesco_gecici: ["UNESCO Geçici Liste", "UNESCO Tentative List"],
    foto_kredi: ["Fotoğraf", "Photo"],

    // Formlar
    f_ad: ["Adınız", "Your name"], f_eposta: ["E-posta", "Email"], f_istege: ["İsteğe bağlı", "Optional"],
    f_eposta_not: ["İsteğe bağlı, yalnızca size dönüş için", "Optional, only used to reply to you"],
    f_hp: ["Bu alanı boş bırakın", "Leave this field empty"],
    f_kvkk: ["Gönderdiğim bilgilerin bu çalışmada değerlendirilmesini kabul ediyorum. Ad ve e-posta yayımlanmaz.", "I agree that the information I submit may be used in this project. Names and emails are never published."],
    f_kapali: ["Geribildirim gönderimi henüz açılmadı.", "Submissions are not open yet."],
    f_kapali_eposta: ["Bilgileri {e} adresine e-postayla iletebilirsiniz.", "You can email the information to {e}."],
    duz_baslik: ["Bilgi düzeltmesi gönder", "Send a correction"],
    duz_lead: ["<b>{ad}</b> ({yer}) için hatalı veya eksik gördüğünüz bilgiyi yazın.", "Tell us what is wrong or missing for <b>{ad}</b> ({yer})."],
    duz_alan: ["Hangi bilgi?", "Which information?"],
    duz_alanlar: [["Konum", "Yapının adı", "Güncel işlevi", "Korunma / restorasyon durumu", "Topluluk / mezhep", "Yapı artık yok / yıkılmış", "Diğer"],
      ["Location", "Name", "Current use", "Protection / restoration status", "Community / denomination", "Building no longer exists", "Other"]],
    duz_dogrusu: ["Doğrusu nedir?", "What is correct?"],
    duz_ph: ["Örneğin: Kilise 2023’te restore edilerek müze olarak açıldı.", "For example: the church was restored in 2023 and opened as a museum."],
    dogru_konum: ["Doğru konum", "Correct location"], haritada_isaretle: ["Haritada işaretle", "Mark on map"], isaretlenmedi: ["İşaretlenmedi", "Not marked"],
    kaynak_alan: ["Kaynak", "Source"], kaynak_not: ["Bağlantı, yayın veya “yerinde gördüm”", "Link, publication or “seen on site”"],
    duz_gonder: ["Düzeltmeyi gönder", "Send correction"], duz_ok_b: ["Düzeltme gönderildi", "Correction sent"],
    duz_ok_m: ["Teşekkürler. Düzeltme incelendikten sonra haritaya yansıtılacak.", "Thank you. Your correction will be reviewed and applied to the map."],
    yeni_baslik: ["Listede olmayan bir yapı öner", "Suggest a missing building"],
    yeni_lead: ["Haritada göremediğiniz bir kilise, manastır veya şapel biliyorsanız bildirin. İncelendikten sonra envantere eklenir.", "If you know a church, monastery or chapel that is not on the map, let us know. It will be added after review."],
    yeni_ad: ["Yapının adı", "Name of the building"], turu: ["Türü", "Type"], emin_degilim: ["Emin değilim", "Not sure"],
    koy: ["Köy / mahalle", "Village / neighbourhood"], secin: ["Seçin", "Choose"], konum: ["Konum", "Location"],
    aciklama: ["Açıklama", "Description"], aciklama_not: ["Tarihi, durumu, nasıl ulaşılır", "History, condition, how to get there"],
    kaynak_not2: ["Bağlantı veya yayın", "Link or publication"],
    fotograf: ["Fotoğraf", "Photo"], foto_not: ["İsteğe bağlı, en fazla {n}", "Optional, up to {n}"],
    foto_izin: ["Fotoğrafları ben çektim; sitede adımla birlikte yayımlanmasına izin veriyorum.", "I took these photos and allow them to be published on the site with my name."],
    yeni_gonder: ["Öneriyi gönder", "Send suggestion"], yeni_ok_b: ["Öneri gönderildi", "Suggestion sent"],
    yeni_ok_m: ["Teşekkürler. Önerdiğiniz yapı incelendikten sonra envantere eklenecek.", "Thank you. The building you suggested will be added after review."],
    yeni_konum_hata: ["Yapının yerini haritada işaretleyin. Tam yeri bilmiyorsanız köy veya ilçe merkezini işaretlemeniz yeterli.", "Mark the building’s location on the map. If you don’t know the exact spot, the village or district centre is enough."],
    foto_baslik: ["Fotoğraf gönder", "Send a photo"],
    foto_lead: ["<b>{ad}</b> ({yer}) için güncel fotoğraf gönderin. Onaylanan fotoğraflar bu yapının kartında görünür.", "Send a recent photo of <b>{ad}</b> ({yer}). Approved photos appear on the building’s card."],
    fotograflar: ["Fotoğraflar", "Photos"], foto_not2: ["En fazla {n}; büyük dosyalar otomatik küçültülür", "Up to {n}; large files are resized automatically"],
    cekim_tarihi: ["Çekim tarihi", "Date taken"], cekim_not: ["Yaklaşık olabilir", "Approximate is fine"], cekim_ph: ["Örneğin: Ağustos 2024", "For example: August 2024"],
    not_alan: ["Not", "Note"], not_ph: ["Fotoğraf hakkında eklemek istedikleriniz", "Anything you would like to add"],
    foto_gonder: ["Fotoğrafları gönder", "Send photos"], foto_ok_b: ["Fotoğraflar gönderildi", "Photos sent"],
    foto_ok_m: ["Teşekkürler. Fotoğraflar onaylandıktan sonra yapının kartında görünecek.", "Thank you. Your photos will appear on the card once approved."],
    h_foto_sec: ["En az bir fotoğraf seçin.", "Choose at least one photo."], h_foto_izin: ["Fotoğrafların size ait olduğunu onaylayın.", "Please confirm that you took the photos."],
    h_foto_oku: ["Fotoğraflardan biri okunamadı. JPEG veya PNG biçiminde başka bir dosya deneyin.", "One of the photos could not be read. Try a JPEG or PNG file."],
    h_kapali: ["Gönderim kapalı: site sahibi henüz geribildirim adresini ayarlamadı.", "Submissions are closed: the site owner has not set up the feedback address yet."],
    h_onay: ["Göndermek için onay kutusunu işaretleyin.", "Tick the consent box to submit."], h_eksik: ["Eksik alanları doldurun.", "Please fill in the missing fields."],
    h_ag: ["Gönderilemedi. İnternet bağlantınızı kontrol edip yeniden deneyin.", "Could not send. Check your connection and try again."],
    gonderiliyor: ["Gönderiliyor…", "Sending…"], haritaya_don: ["Haritaya dön", "Back to the map"],

    // Kılavuz ve atıf penceresi
    kil_baslik: ["Haritayı okuma kılavuzu", "How to read the map"],
    kil_nokta_b: ["Simgeler", "Symbols"],
    kil_nokta_1: ["Her simge, tezdeki envanter tablosunun bir satırını temsil etmektedir. Aynı yerleşkedeki veya aynı köydeki birden fazla yapı tezde tek satırda verildiğinden tek simgeyle gösterilmekte, il sayıları da bu satırlara göre hesaplanmaktadır.", "Each symbol represents one row of the inventory table in the thesis. Several buildings in the same complex or village are listed in a single row and therefore share one symbol; province totals are calculated from these rows."],
    kil_nokta_2: ["Yapı türü kaydın adından belirlenmiştir; adında “manastır” geçen kayıtlar manastır olarak sınıflandırılmıştır.", "Building type was derived from each record’s name; records whose name includes “monastery” are classified as monasteries."],
    kil_konum_b: ["Konumlar", "Locations"],
    kil_konum_1: ["Tezde koordinat bulunmadığından simgeler il, ilçe ve köy bilgisinden yaklaşık olarak yerleştirilmiştir. Her yapının kartında konumun hangi düzeyde belirlendiği belirtilmektedir.", "As the thesis does not include coordinates, symbols were placed approximately from province, district and village information. Each card states the level at which the location was determined."],
    kil_katki_b: ["Katkıda bulunun", "Contribute"],
    kil_katki_1: ["Bir yapının kartından düzeltme veya fotoğraf, panelin altındaki düğmeden de listede olmayan bir yapıyı önerebilirsiniz. Gönderiler incelendikten sonra haritaya yansıtılır.", "You can send corrections or photos from a building’s card, and suggest a missing building from the button at the bottom of the panel. Submissions are reviewed before they appear on the map."],
    kil_proje_link: ["Proje, yöntem ve ekip hakkında bilgi için tanıtım sayfasına gidin.", "See the project page for the aims, method and team."],
    atif_lead: ["Bu haritayı veya verilerini bir çalışmada, haberde ya da sunumda kullanıyorsanız lütfen kaynak gösterin.", "If you use this map or its data in research, news or presentations, please cite it."],

    // Atıf
    atif_bicim: ["Atıf biçimi", "Citation style"], atif_kopyala: ["Atfı kopyala", "Copy citation"], kopyalandi: ["Kopyalandı", "Copied"],
    kopyalanamadi: ["Kopyalanamadı, metni seçip kopyalayın", "Could not copy; please select the text"],
    atif_indir: ["Dosya olarak indir", "Download file"],
    atif_makale: ["Makale", "Journal article"], atif_tez: ["Yüksek lisans tezi", "Master’s thesis"], atif_site: ["Harita ve veri seti", "Map and dataset"],
    atif_makale_once: ["Bu veriyi veya haritayı kullanırken lütfen öncelikle bu makaleye atıf yapın.", "When using this map or data, please cite this article first."],
    atif_makale_yakinda: ["Bu çalışmanın bulguları {dergi} dergisinde makale olarak yayımlanmak üzeredir.", "The findings of this study are forthcoming as an article in {dergi}."],
    atif_makale_yakinda2: ["Künyesi yayımlandığında burada yer alacak; o zamana kadar lütfen aşağıdaki teze atıf yapın.", "The full reference will appear here upon publication; until then, please cite the thesis below."],
    tez_turu: ["Yüksek lisans tezi", "Master’s thesis"], site_turu: ["İnteraktif harita ve veri seti", "Interactive map and dataset"],
    erisim: ["Erişim tarihi", "Accessed"],

    // Tanıtım sayfası
    giris_title: ["Türkiye İnanç Turizmi Yaşayan Envanter Projesi", "Religious Tourism of Türkiye: Living Inventory Project"],
    h_alt: ["Anadolu’nun {il} ilinde {kayit} kilise, manastır ve şapel kaydı; tek bir haritada.", "{kayit} records of churches, monasteries and chapels across {il} provinces of Anatolia, on a single map."],
    h_metin: ["Roma, Doğu Roma ve Osmanlı dönemlerinden günümüze ulaşan bu yapılar, Türkiye’nin çok katmanlı kültürel mirasının ayrılmaz bir parçasını oluşturmaktadır. Harita, her yapının konumunu, güncel kullanımını ve koruma durumunu bir arada sunmaktadır.", "Surviving from the Roman, Eastern Roman and Ottoman periods, these buildings form an integral part of Türkiye’s multi-layered cultural heritage. The map presents the location, current use and conservation status of each building."],
    h_harita_ac: ["Haritayı aç", "Open the map"], h_proje: ["Proje hakkında", "About the project"],
    r_kullanim: ["Bu yapılar bugün nasıl kullanılıyor?", "How are these buildings used today?"],
    p_baslik: ["Proje hakkında", "About the project"], p_yontem: ["Veriler nasıl toplandı?", "Data collection"],
    p_yasayan: ["Envanter, ilk olarak yüksek lisans tezinin ekinde yayımlanmıştır. Bu site, söz konusu envanteri herkesin erişebileceği ve ziyaretçi katkılarıyla güncellenen yaşayan bir kaynağa dönüştürmektedir.", "The inventory was first published as an appendix to the master’s thesis. This website turns it into a living, openly accessible resource that is updated through visitor contributions."],
    p_iller: ["En çok kayıt bulunan iller", "Provinces with the most records"], p_tum_iller: ["Tüm illeri haritada gör", "See all provinces on the map"],
    e_baslik: ["Ekip", "Team"], e_profil: ["Akademik profil", "Academic profile"],
    a_baslik: ["Nasıl atıf yapılır?", "How to cite"],
    l_baslik: ["Kullanım koşulları", "Terms of use"],
    l_metin: ["Haritadaki veriler ve metinler {lisans} lisansıyla paylaşılmaktadır. Kaynak gösterilmesi koşuluyla veriler kullanılabilir, paylaşılabilir ve uyarlanabilir.", "The data and texts are shared under the {lisans} licence. You may use, share and adapt them provided that the source is cited."],
    l_lisans: ["Creative Commons Atıf 4.0 (CC BY 4.0)", "Creative Commons Attribution 4.0 (CC BY 4.0)"],
    l_indir: ["Tüm kayıtlar haritadaki “Veriyi indir (CSV)” bağlantısından indirilebilir.", "All records can be downloaded from the “Download data (CSV)” link on the map."],
    k_baslik: ["Haritayı birlikte geliştirelim", "Help us improve the map"],
    k1_b: ["Bilgiyi düzeltin", "Correct information"], k1_m: ["Bir yapının konumu, işlevi veya koruma durumu değiştiyse yapının kartından düzeltme gönderin.", "If a building’s location, use or conservation status has changed, send a correction from its card."],
    k2_b: ["Fotoğraf paylaşın", "Share photos"], k2_m: ["Ziyaret ettiğiniz yapıların güncel fotoğrafları, onaylandıktan sonra adınızla birlikte haritada yer alır.", "Recent photos of buildings you have visited appear on the map with your name once approved."],
    k3_b: ["Eksik yapıyı bildirin", "Report a missing building"], k3_m: ["Listede olmayan bir kilise, manastır veya şapel biliyorsanız yerini haritada işaretleyerek önerin.", "If you know a church, monastery or chapel that is not listed, mark its location on the map."],
    k_git: ["Haritaya git", "Go to the map"],
    f_bagimsiz_b: ["Bu site bağımsız bir akademik çalışmadır.", "This website is an independent academic project."],
    f_bagimsiz_m: ["Herhangi bir kamu kurumunun veya dini kurumun resmi yayını değildir. Amaç, Türkiye’nin kültürel mirasının belgelenmesine ve tanıtılmasına katkı sunmaktır.", "It is not an official publication of any public or religious institution. Its aim is to contribute to the documentation and promotion of Türkiye’s cultural heritage."],
    f_kvkk: ["Kişisel verilerin korunması", "Personal data protection"],
    f_krediler: ["Harita altlığı: Esri, OpenStreetMap katkıcıları. İl ve ilçe sınırları: geoBoundaries, © OpenStreetMap katkıcıları (ODbL). Komşu ülke sınırları: Natural Earth (world-atlas).", "Basemap: Esri, OpenStreetMap contributors. Province and district boundaries: geoBoundaries, © OpenStreetMap contributors (ODbL). Neighbouring country borders: Natural Earth (world-atlas)."],
    iletisim: ["İletişim", "Contact"],
    deniz_karadeniz: ["KARADENİZ", "BLACK SEA"], deniz_akdeniz: ["AKDENİZ", "MEDITERRANEAN SEA"], deniz_ege: ["EGE", "AEGEAN"],

    geri_turkiye: ["Türkiye haritasına dön", "Back to the map of Türkiye"],
    tam_ekran: ["Tam ekran", "Full screen"],
    ziyaret: ["ziyaret", "visits"],
    son_guncelleme: ["Son güncelleme", "Last updated"],
    tema_koyu: ["Lapis Lazuli (gece) temasına geç", "Switch to the Lapis Lazuli (night) theme"],
    tema_acik: ["Piri Reis (gündüz) temasına geç", "Switch to the Piri Reis (day) theme"],
    il_yapilari: ["{il} içindeki yapılar", "Buildings in {il}"],
    ilce_yapilari: ["{ilce} ilçesindeki yapılar", "Buildings in {ilce} district"],
    geri_il: ["{il} haritasına dön", "Back to the {il} map"],
    ilce_tip_kayit: ["{n} kayıt", "{n} records"],
    ilce_tip_ipucu: ["Ayrıntı için tıklayın", "Click for details"],
    ilce_tip_yok: ["Bu ilçede kayıt yok", "No records in this district"],
    ilce_not: ["İlçe, kaynaktaki ilçe adına göre; ad yoksa haritadaki konuma göre belirlenir.", "District is taken from the source record; where it is missing, from the map position."],
    nav_tasarim: ["Tasarım dili", "Design language"],
    nav_sss: ["SSS", "FAQ"],
    nav_tarih: ["Tarihsel bağlam", "Historical context"],
    demo2_serit: ["Demo 2: sırlı çini denemesi.", "Demo 2: glazed tile trial."], demo2_bir: ["Demo 1", "Demo 1"],
    menu: ["Menü", "Menu"], menu_kapat: ["Menüyü kapat", "Close menu"],
    lejant_gizle: ["Lejantı gizle", "Hide legend"],
    lejant_goster: ["Lejantı göster", "Show legend"],
    basa_don: ["Başa dön", "Back to top"],
    demo_serit: ["Demo sürümü: yeni tasarım deneniyor.", "Demo version: a new design is being tested."],
    demo_canli: ["Yayındaki siteye git", "Go to the live site"],
    tum_iller: ["Tüm iller", "All provinces"],
    il_baslik: ["İletişim", "Contact"],
    il_metin: ["Proje, veriler ya da iş birliği hakkındaki sorularınız için bana yazabilirsiniz.", "For questions about the project, the data or collaboration, please get in touch."],
    il_eposta: ["E-posta", "Email"], il_site: ["Kişisel web sitesi", "Personal website"], il_akademik: ["Akademik profil", "Academic profile"],
    f_tez_temel: ["Bu site, aşağıdaki yüksek lisans tezi temel alınarak geliştirilmektedir:", "This website is developed on the basis of the following master’s thesis:"],
    gelistiren: ["Bu site, A. Mecid Vergül’ün yönlendirmesiyle Claude Opus 5.5 (Anthropic) tarafından tasarlanıp kodlanmıştır.", "Designed and coded by Claude Opus 5.5 (Anthropic) under the direction of A. Mecid Vergül."],
    gelistiren_kisa: ["Claude Opus 5.5 ile tasarlanıp kodlandı", "Designed and coded with Claude Opus 5.5"],
    ara_kapsam_il: ["{il} içinde", "In {il}"], ara_kapsam_tum: ["Tüm Türkiye’de ara", "Search all of Türkiye"], ara_kapsam_etiket: ["Arama kapsamı", "Search scope"],
    arama_sonuc: ["Arama sonuçları", "Search results"],
    kume_not: ["Sayılı daireler birbirine yakın yapıları bir arada gösterir; tıklayınca açılır.", "Numbered circles group nearby buildings; click to expand."]
  };

  function dilBul() {
    const p = new URLSearchParams(location.search).get("lang");
    if (p === "en" || p === "tr") { try { localStorage.setItem("dil", p); } catch (e) {} return p; }
    try { const k = localStorage.getItem("dil"); if (k === "en" || k === "tr") return k; } catch (e) {}
    return (navigator.language || "tr").toLowerCase().startsWith("tr") ? "tr" : "en";
  }
  const dil = dilBul();
  const i = dil === "en" ? 1 : 0;

  function t(k, v) {
    const e = S[k]; if (!e) return k;
    let s = e[i];
    if (v) Object.keys(v).forEach(x => { s = s.split("{" + x + "}").join(v[x]); });
    return s;
  }
  function uygula(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.getAttribute("data-i18n")); });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach(el => { el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph"))); });
    (root || document).querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    document.documentElement.lang = dil;
    document.querySelectorAll(".dil-sec button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.dil === dil)));
  }
  function degistir(d) {
    try { localStorage.setItem("dil", d); } catch (e) {}
    const u = new URL(location.href); u.searchParams.set("lang", d); location.href = u.toString();
  }
  document.addEventListener("click", e => { const b = e.target.closest(".dil-sec button[data-dil]"); if (b && b.dataset.dil !== dil) degistir(b.dataset.dil); });

  // Sayfalar arası bağlantılarda dil korunur
  function baglantiDil() {
    if (dil !== "en") return;
    document.querySelectorAll('a[href$=".html"], a[href*=".html?"], a[href*=".html#"]').forEach(a => {
      const h = a.getAttribute("href"); if (/^https?:/.test(h)) return;
      const [yol, hash] = h.split("#"); a.setAttribute("href", yol + (yol.includes("?") ? "&" : "?") + "lang=en" + (hash ? "#" + hash : ""));
    });
  }

  window.I18N = { dil, en: dil === "en", t, uygula, baglantiDil, S };
})();
