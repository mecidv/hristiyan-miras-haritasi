/* İngilizce sürüm için kayıt verisinin çevirisi.
   Yapı adları özel isim olduğu için Türkçe bırakılır; işlev, durum ve kategori alanları çevrilir.
   Çevrilemeyen bir cümle olursa özgün Türkçe metin korunur. */
(function () {
  "use strict";

  const TUR = { "Kilise": "Church", "Manastır": "Monastery", "Şapel": "Chapel" };
  const ISLEV_KAT = {
    "İbadete açık": "Open for worship", "Müze / ören yeri": "Museum / archaeological site", "Cami": "Mosque",
    "Kültür-sanat / kütüphane": "Cultural centre / library", "Terk edilmiş / harabe": "Abandoned / in ruins", "Diğer / bilinmiyor": "Other / unknown"
  };
  const TOPLULUK = {
    "Rum / Yunan": "Greek Orthodox", "Ermeni": "Armenian", "Süryani": "Syriac", "Katolik": "Catholic", "Protestan": "Protestant",
    "Bulgar": "Bulgarian", "Keldani": "Chaldean", "Rus": "Russian", "Nesturi": "Nestorian (Church of the East)", "Gürcü": "Georgian"
  };
  const BOLGE = {
    "Marmara": "Marmara", "Ege": "Aegean", "Akdeniz": "Mediterranean", "İç Anadolu": "Central Anatolia",
    "Karadeniz": "Black Sea", "Doğu Anadolu": "Eastern Anatolia", "Güneydoğu Anadolu": "Southeastern Anatolia"
  };
  const HASSASIYET = {
    "Yapı / ören yeri": "Building / site", "Köy / mahalle": "Village / neighbourhood", "İlçe merkezi": "District centre",
    "İl merkezi": "Province centre", "Ziyaretçi işaretlemesi": "Marked by a visitor"
  };
  const ISLEV = {
    "Arkeolojik Sit Alanı": "Archaeological site", "Arkeolojik Sit Alanı - Ziyarete açık": "Archaeological site, open to visitors",
    "Arkeolojik kazı alanı": "Excavation site", "Arkeolojik çalışma alanı": "Archaeological research site", "Ayazma": "Holy spring (ayazma)",
    "Bilinmiyor": "Unknown", "Bina tahribata uğramış ancak ziyaret ediliyor.": "Damaged but still visited",
    "Büyük çoğunluğu aktif olarak hizmet vermeye devam etmektedir.": "Most remain in active use",
    "Cami": "Mosque", "Cami ve Müze": "Mosque and museum", "Camii": "Mosque", "Depo": "Storage", "Depo (Samanlık veya ahır)": "Storage (barn or stable)",
    "Depo veya Ahır": "Storage or stable", "Depo veya ahır": "Storage or stable", "Dijital Kütüphane": "Digital library", "Doğa Tarihi Müzesi": "Natural history museum",
    "Eğitim Merkezi": "Education centre", "Halı Dokuma Atölyesi": "Carpet-weaving workshop", "Harabe durumdadır.": "In ruins", "Harabe durumunda": "In ruins",
    "Harabe şeklindedir": "In ruins", "Kale": "Fortress", "Kilise": "Church", "Kilise - Ayazma Şapeli": "Church and holy-spring chapel", "Kilise - Cami": "Church / mosque",
    "Kilise - Katedral": "Church (cathedral)", "Kilise - Kültür ve Sanat Merkezi": "Church and cultural centre", "Kilise - Şapel": "Church and chapel",
    "Kilise - Şapel - Ayazma - Ayazma Şapeli": "Church, chapel, holy spring and holy-spring chapel", "Kilise olarak kullanılmıyor.": "No longer used as a church",
    "Kilise ve kültür merkezi": "Church and cultural centre", "Kitaplık": "Library", "Konut": "Residence", "Kullanılmıyor": "Not in use", "Külliye": "Mosque complex (külliye)",
    "Kültür Merkezi": "Cultural centre", "Kültür Merkezi ve Müze": "Cultural centre and museum", "Kültür Sanat Evi": "Arts and culture house",
    "Kültür Sanat Merkezi": "Arts and culture centre", "Kültür evi": "Culture house", "Kültür merkezi": "Cultural centre", "Kültür ve Sanat Merkezi": "Arts and culture centre",
    "Kütüphane": "Library", "Manastır": "Monastery", "Manastır veya Konut": "Monastery or residence", "Mağara": "Cave", "Müze": "Museum", "Otopark": "Car park",
    "Patrikhane": "Patriarchate", "Patrikhane - Kilise - Şapel - Ayazma - Ayazma Şapeli": "Patriarchate, church, chapel, holy spring and holy-spring chapel",
    "Restorasyon sürecindedir": "Under restoration", "Restore edilmektedir": "Under restoration", "Sahne": "Stage / theatre", "Sanat Galerisi": "Art gallery",
    "Terk edilmiş": "Abandoned", "Terk edilmiş.": "Abandoned", "Ziyarete açık": "Open to visitors",
    "Ziyarete açık. Bazıları depo veya güvercinlik olarak kullanılmaktadır.": "Open to visitors; some are used as storage or dovecotes",
    "Ziyarete açıktır.": "Open to visitors", "Çocuk Kütüphanesi": "Children’s library", "Çok amaçlı salon": "Multi-purpose hall", "Örenyeri": "Archaeological site",
    "Özel Konut - Müze": "Private residence / museum", "Özel mülk": "Private property", "Şahıs kullanımında": "In private use", "Şapel": "Chapel"
  };

  // Kurum adları
  const KURUM = [
    [/Vakıflar Genel Müdürlüğü/g, "the General Directorate of Foundations"],
    [/Vakıflar Bölge Müdürlüğü(nce)?/g, "the Regional Directorate of Foundations"],
    [/Diyarbakır Vakıflar Bölge Müdürlüğü(nce)?/g, "the Diyarbakır Regional Directorate of Foundations"],
    [/Kültür ve Turizm [Bb]akanlığı/g, "the Ministry of Culture and Tourism"],
    [/Kültür Varlıkları ve Müzeler Genel Müdürlüğü/g, "the General Directorate of Cultural Heritage and Museums"],
    [/Diyanet İşleri Başkanlığı/g, "the Presidency of Religious Affairs"],
    [/Fener Rum Patrikhanesi/g, "the Ecumenical Patriarchate (Fener)"],
    [/Ermeni Patrikhanesi/g, "the Armenian Patriarchate"],
    [/\bPatrikhane(si)?\b/g, "the Patriarchate"],
    [/([A-ZÇĞİÖŞÜ][\wçğıöşü]+) Büyükşehir Belediyesi/g, "$1 Metropolitan Municipality"],
    [/([A-ZÇĞİÖŞÜ][\wçğıöşü]+) Belediyesi/g, "$1 Municipality"],
    [/([A-ZÇĞİÖŞÜ][\wçğıöşü]+) Valiliği/g, "the Governorship of $1"]
  ];
  const kurum = (s) => { KURUM.forEach(([r, v]) => { s = s.replace(r, v); }); return s.replace(/’(na|ne|ya|ye|nin|nın|in|ın|ı|i|nce|nca)\b/g, ""); };
  const bas = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Tam cümle eşlemeleri ve kalıplar (sırayla denenir)
  const KALIP = [
    [/^-?$/, ""],
    [/^Bilinmiyor\.?$/, "Unknown."],
    [/^Bilinmiyor, son onarım (\d{4}) yılında yapılmıştır\.$/, "Unknown; last repaired in $1."],
    [/^Bilinmiyor, tahribata uğramış\.?$/, "Unknown; damaged."],
    [/^Harabe (hal|şekl)inde(dir|dirler)\.?$/, "In ruins."], [/^Harabe halde(dir|dirler)\.$/, "In ruins."],
    [/^Bir kilise Harabe şeklindedir\.$/, "One church is in ruins."],
    [/^(\d+) kilise de harabe halindedir\.$/, "All $1 churches are in ruins."],
    [/^(\d+) kilise de tahribata uğramış\.$/, "Both churches have been damaged."],
    [/^Koruma altında değil(dir)?\.?$/, "Not under legal protection."],
    [/^Koruma altında değil, [Tt]ahribata uğramış\.?$/, "Not under legal protection; damaged."],
    [/^Koruma altındadır\.$/, "Under legal protection."],
    [/^Koruma altındadır, harabe halindedir\.$/, "Under legal protection; in ruins."],
    [/^Koruma altında olduğu biliniyor ancak kurum ismine ulaşılamadı\.$/, "Known to be protected, but the responsible institution could not be identified."],
    [/^Koruma programıyla ilgili güvenilir bir bilgiye ulaşılamadı\.$/, "No reliable information on a conservation programme was found."],
    [/^Koruma çalışmaları ile ilgili bir bilgi yer almamaktadır\.$/, "No information on conservation work is available."],
    [/^Onarım görmüş, koruma altında$/, "Repaired; under protection."],
    [/^Tah?ribata uğramış(tır|lardır)?\.?$/, "Damaged."], [/^Tahribata maruz kalmaktadır\.$/, "Exposed to deterioration."],
    [/^Yapıda tahribat oluşmuştur\.$/, "The building has been damaged."], [/^Yapılarda tahribat bulunmaktadır\.$/, "The buildings show damage."],
    [/^İç kısmı tahribata maruz kalmıştır\.$/, "The interior has been damaged."],
    [/^Ancak tahribata açık bir durumda olduğu görülmüştür\.$/, "However, it was observed to be vulnerable to deterioration."],
    [/^Te?s?cilli yapı(dır|lardır)\.$/, "Registered heritage structure."], [/^Tecilli yapıdır\.$/, "Registered heritage structure."],
    [/^Tescilli yapı(dır)?, harabe (hal|şekl)inde(dir)?\.$/, "Registered heritage structure; in ruins."],
    [/^Tescilli yapılardır\. Tahribata uğramışlardır\.$/, "Registered heritage structures; damaged."],
    [/^Üçü de tescilli yapıdır\.$/, "All three are registered heritage structures."],
    [/^Yapıların tamamı tescillidir\.$/, "All of the buildings are registered."],
    [/^Yapıların tamamı terk edilmiştir\.$/, "All of the buildings are abandoned."],
    [/^Terk edilmiş\.?$/, "Abandoned."],
    [/^Sağlam durumdadır\.$/, "In good condition."],
    [/^Yapı koruma altında değildir, ancak sağlam durumdadır\.$/, "Not under protection, but in good condition."],
    [/^Yapı sağlamdır ancak koruma altında değildir\.$/, "In good condition but not under protection."],
    [/^Kilise sağlam durumda ve hizmet vermeye devam etmektedir\.$/, "The church is in good condition and remains in use."],
    [/^Kilise sağlam durumda ve ibadete açıktır\.$/, "The church is in good condition and open for worship."],
    [/^Bina sağlam vaziyette ve aktif bir kilisedir\.$/, "The building is in good condition and is an active church."],
    [/^Aktif bir kilise(dir| olarak hizmet vermeye devam etmektedir)\.$/, "An active church."], [/^Aktif kiliselerdir\.$/, "Active churches."],
    [/^Aktif olarak hizmet verme(ktedir|ye devam etmektedir)\.$/, "In active use."],
    [/^Patri(khane|klik) himayesinde hizmet ve(rmektedir|riyor)\.$/, "Serves under the auspices of the Patriarchate."],
    [/^Ziyarete açıktır\.$/, "Open to visitors."], [/^Ziyarete kapalıdır\.$/, "Closed to visitors."], [/^Ziyarete kapatılmış durumdadır\.$/, "Closed to visitors."],
    [/^Restore edilmiştir, ziyarete açıktır\.$/, "Restored; open to visitors."],
    [/^Restorasyon sürecindedir\.$/, "Under restoration."],
    [/^Restore edilerek ibadete açılmıştır\.$/, "Restored and reopened for worship."],
    [/^Restore edilerek kültür merkezine dönüştürülmüştür\.$/, "Restored and converted into a cultural centre."],
    [/^Arkeolojik [Ss]it [Aa]lanı(dır)?\.?$/, "Archaeological site."], [/^Arkeolojik ve doğal sit alanıdır\.$/, "Archaeological and natural conservation site."],
    [/^Arkeolojik olarak tescil edilmiştir\.$/, "Registered as an archaeological site."], [/^Arkeolojik kazı alanı, ziyarete açıktır\.$/, "Excavation site, open to visitors."],
    [/^Arkeolojik çalışmalar sürdürülmektedir\.$/, "Archaeological work is ongoing."],
    [/^Sit alanı(dır| içerisinde yer almaktadır)\.$/, "Located within a conservation site."], [/^Örenyeri içerisinde yer almaktadır\.$/, "Located within an archaeological site."],
    [/^Mağara yapısıdır\.$/, "A cave structure."], [/^Özel mülkiyete aittir\.$/, "Privately owned."], [/^Bazıları özel mülkiyet kapsamındadır\.$/, "Some are privately owned."],
    [/^Bazı ikonalar halen görülebilmektedir\.$/, "Some icons are still visible."], [/^İkonalar iyi derecede muhafaza edilmiştir\.$/, "The icons are well preserved."],
    [/^Yapı, camiye dönüştürülürken aslına sadık kalınarak dönüştürülmüştür\.$/, "The building was converted into a mosque while preserving its original fabric."],
    [/^Yapının kalıntıları günümüze ulaşmıştır\.$/, "Remains of the building survive."], [/^Yapının orijinal ismine ulaşılamadı\.$/, "The original name of the building could not be determined."],
    [/^Yapılar hakkında detaylı bilgi bilinmiyor\.$/, "No detailed information on the buildings is available."],
    [/^Yapının 3 bölümden oluşurken, 2 bölümü günümüze ulaşmıştır\.$/, "Of its original three sections, two survive."],
    [/^Detaylı bilgi için web sitesini ziyaret ediniz\.$/, "See the institution’s website for details."],
    [/^Geniş bir bölgeye yayılmış birçok kilise mevcuttur\.$/, "Many churches are spread over a wide area."],
    [/^Bu vadide (\d+) adet tescilli kilise bulunmaktadır\.$/, "There are $1 registered churches in this valley."],
    [/^Vadi [Bb]oyunca (\d+) adet kaya oyma kilise bulunmaktadır\.$/, "There are $1 rock-cut churches along the valley."],
    [/^Bölgede tescillenmiş (\d+) adet kilise ve şapel bulunmaktadır\.$/, "There are $1 registered churches and chapels in the area."],
    [/^(\d+) mahallenin her birinde en az bir kilise olduğu belirtilmektedir\.$/, "Each of the $1 neighbourhoods is reported to have at least one church."],
    [/^Kilisenin bakımı, kilisenin kendi cemaati tarafından karşılanmaktadır\.$/, "Maintenance is covered by the church’s own congregation."],
    [/^Kilise, bir caminin lojmanının bahçesinde yer almaktadır\.$/, "The church stands in the garden of a mosque’s staff residence."],
    [/^Lojmanı kullanan din görevlisi tarafından bakımı yapılmaktadır\.$/, "It is maintained by the imam living in the residence."],
    [/^Kilisenin kalıntıları muhafaza edilerek restore edilmiş ve kütüphane oluşturulmuştur\.$/, "The church remains were preserved and restored, and a library was created."],
    [/^Zaman zaman çeşitli etkinliklere de ev sahipliği yapmaktadır\.$/, "It also hosts events from time to time."],
    [/^Çalışmaların (\d+) yıl süreceği öngörülmüştür\.$/, "The work is expected to take $1 years."],
    [/^(\d{4}) itibariyle restorasyon çalışmaları başlamıştır\.$/, "Restoration work began in $1."],
    [/^(\d{4}) Nisan itibariyle restorasyonu devam etmektedir\.$/, "Restoration ongoing as of April $1."],
    [/^(\d{4}) yılındaki depremde ağır hasar almıştır\.$/, "Heavily damaged in the $1 earthquake."],
    [/^(\d{4}) yılında özelleşmiş ve otoparka dönüştürülmüştür\.$/, "Privatised in $1 and converted into a car park."],
    [/^(\d{4}) yılında restore edilerek camiye çevrilmiştir\.$/, "Restored and converted into a mosque in $1."],
    [/^(\d{4}) yılında restore edilerek hizmete açılmıştır\.$/, "Restored and opened in $1."],
    [/^(\d{4}) yılında tescillenerek koruma altına alınmıştır\.$/, "Registered and placed under protection in $1."],
    [/^(\d{4}) yılında köy halkı tarafından onarılmıştır\.$/, "Repaired by the villagers in $1."],
    [/^(\d{4})(?: yılında|’de|’lu yıllarda)? restor(?:e edilmiştir|asyon geçirmiştir)\.$/, "Restored in $1."],
    [/^(\d{4})’lu yıllarda restore edilmiştir\.$/, "Restored in the $1s."],
    [/^(\d{4}) yılında onarım görmüştür\.$/, "Repaired in $1."],
    [/^(\d{4})’dan sonra (.+?) desteği ile restore edilmiştir\.$/, (m, y, k) => `Restored after ${y} with the support of ${kurum(k)}.`],
    [/^Son restorasyon (\d{4}) yılında,? (.+?) tarafından (?:yapılmıştır|gerçekleştiri?lmiştir)\.$/, (m, y, k) => `Last restored in ${y} by ${kurum(k)}.`],
    [/^Son restorasyon (\d{4}) yılında Patrikhane bünyesinde hayırseverlerin yardımıyla yapılmıştır\.$/, "Last restored in $1 by the Patriarchate with the help of benefactors."],
    [/^Son restorasyon 1998 yılında, hayırsever Kalust Gülbengyan’ın sağladığı fon ile yapılmıştır\.$/, "Last restored in 1998 with funds provided by the benefactor Calouste Gulbenkian."],
    [/^(\d{4}) yılından sonra değişik tarihlerde Patrikhane ve hayırseverler tarafından onarım görmüştür\.$/, "Repaired on various dates after $1 by the Patriarchate and benefactors."],
    [/^(\d{4}) yılında (.+?) tarafından (?:aslına uygun )?(?:restore edilmiştir|restorasyon(?:u)? yapılmıştır)\.$/, (m, y, k) => `Restored in ${y} by ${kurum(k)}.`],
    [/^(.+?) tarafından (\d{4}) yılında restore edilmiştir\.$/, (m, k, y) => `Restored by ${kurum(k)} in ${y}.`],
    [/^(.+?) tarafından restore edilmiştir\.$/, (m, k) => `Restored by ${kurum(k)}.`],
    [/^(.+?) tarafından restore edilip (müze olarak )?hizmete (açılmıştır|sunulmuştur)\.$/, (m, k, muze) => `Restored by ${kurum(k)} and opened${muze ? " as a museum" : ""}.`],
    [/^(.+?) tarafından restore edileceği (belirtilmiştir|bilinmektedir)\.$/, (m, k) => `Restoration by ${kurum(k)} has been announced.`],
    [/^(.+?) tarafından restorasyon çalışmaları sürdürülmektedir\.$/, (m, k) => `Restoration by ${kurum(k)} is ongoing.`],
    [/^(.+?) tarafında restorasyonu devam ettirilmektedir\.$/, (m, k) => `Restoration by ${kurum(k)} is ongoing.`],
    [/^(.+?) tarafından (?:koruma altındadır|korunmaktadır)\.$/, (m, k) => `Protected by ${kurum(k)}.`],
    [/^(.+?) [Kk]oruması altındadır\.$/, (m, k) => `Under the protection of ${kurum(k)}.`],
    [/^(.+?) tarafından kültür merkezi olarak kullanılmaktadır\.$/, (m, k) => `Used as a cultural centre by ${kurum(k)}.`],
    [/^(.+?)’na bağlı müzedir\.$/, (m, k) => `A museum of ${kurum(k)}.`],
    [/^(.+?) Vakfı’na (bağlıdır|aittir)\.$/, (m, k) => `Belongs to the ${k} Foundation.`],
    [/^Mülkiyeti (.+?) Vakfı’na bağlıdır\.$/, (m, k) => `Owned by the ${k} Foundation.`],
    [/^Mülkiyeti (.+?)’ne aittir\.$/, (m, k) => `Owned by ${kurum(k)}.`],
    [/^(.+?)’(?:na|ne|ya|ye) bağlıdır\.$/, (m, k) => `Affiliated with ${kurum(k)}.`],
    [/^(.+?)’nin (?:kullanımındadır)\.$/, (m, k) => `In use by ${kurum(k)}.`],
    [/^(.+?) kullanımındadır\.$/, (m, k) => `In use by ${kurum(k)}.`],
    [/^(.+?)’nin merkezidir\.$/, (m, k) => `Seat of ${k}.`],
    [/^Kültür ve Turizm Bakanlığı$/, "Ministry of Culture and Tourism."], [/^Vakıflar Genel Müdürlüğü$/, "General Directorate of Foundations."],
    [/^Dünya Mirası Listesi’nde yer almıyor\.$/, "Not on the UNESCO World Heritage List."],
    [/^(?:UNESCO )?Dünya Mirası Geçici Listesi’nde yer al(?:ıyor|maktadır)[:.]\s*(.*)$/, (m, a) => `On the UNESCO World Heritage Tentative List${a ? ": " + a.replace(/ Ve /g, " and ") : "."}`],
    [/^(?:UNESCO )?Dünya Mirası Listesi’nde yer al(?:ıyor|maktadır)[:.]\s*(.*)$/, (m, a) => `Inscribed on the UNESCO World Heritage List${a ? ": " + a.replace(/\(Karma Miras Alanı\)/, "(mixed site)") : "."}`],
    [/^Yapı (\d{4}) yılında Protestan cemaatinin kullanımı amacıyla asli işlevine döndürülmüştür\.$/, "In $1 the building was returned to its original function for use by the Protestant congregation."],
    [/^(\d{4}) yılında Güney Kore Kwong Lim Metodist Kilisesi tarafından Protestan Kilisesi olarak tanınmıştır\.$/, "Recognised as a Protestant church by the Kwang Lim Methodist Church (South Korea) in $1."],
    [/^Haliç Köprüsü yapımı sırasında.*$/, "The building was expropriated during the construction of the Golden Horn Bridge; it survives through a chapel built in Halıcıoğlu cemetery in 2007."],
    [/^Kaledibi İlköğretim Okulu’na bağlı çok amaçlı salon olarak kullanılmaktadır\.$/, "Used as a multi-purpose hall of Kaledibi Primary School."],
    [/^Kültür ve Turizm Bakanlığı tarafından restore edildikten sonra.*$/, "Planned to operate as an arts and culture centre after restoration by the Ministry of Culture and Tourism."],
    [/^(\d{4}) yılında restorasyonu tamamlanan yapı, (.+?)’ne bağlı müze olarak hizmet vermektedir\.$/, (m, y, k) => `Restored in ${y}; now a museum of ${kurum(k)}.`],
    [/^(\d{4}) yılında Avrupa Kültür Başkenti İstanbul projesi kapsamında (.+?)’nin restorasyonu yapılmıştır\.$/, "Restoration of $2 was carried out in $1 as part of the Istanbul European Capital of Culture project."],
    [/^(\d{4}) yılında (.+?) Koruma Bölge Kurulu tarafından tescil edilmiştir\.$/, "Registered in $1 by the regional conservation council."],
    [/^Trabzon Kültür ve Tabiat Varlıklarını Koruma Kurulu tarafından tescillen(erek koruma altına alınmıştır|miş yapıdır)\.$/, "Registered and protected by the Trabzon Conservation Council for Cultural and Natural Heritage."],
    [/^Akşehir Belediyesi ve KOP idaresi iş birliği ile (\d{4}) yılında restore edilmiştir\.$/, "Restored in $1 in cooperation with Akşehir Municipality and the KOP Regional Development Administration."],
    [/^Göller Bölgesi Araştırma Projesi kapsamında restorasyon yapılmıştır\.$/, "Restored as part of the Lake District Research Project."],
    [/^Kalenin DAP Projesi kapsamında restore edileceği belirtilmiştir\.$/, "Restoration of the castle is planned under the DAP project."],
    [/^Ayvalık Belediyesi’nin yapıyı kurtarmak için çalışma yapacağı belirtilmiştir\.$/, "Ayvalık Municipality has announced plans to save the building."],
    [/^Ermeni Patrikhanesi’nin web sitesinde harabe durumda olduğu belirtilmiştir\.$/, "Reported as in ruins on the Armenian Patriarchate’s website."],
    [/^Ancak binanın çatısı (\d{4}) yılında onarılmıştır\.$/, "However, the roof was repaired in $1."],
    [/^Bazıları Rum cemaatince, bazıları Vakıflar Bölge Müdürlüğünce koruma altındadır\.$/, "Some are protected by the Greek Orthodox community, others by the Regional Directorate of Foundations."],
    [/^Bu kilise günümüzde Fener - Rum Patrkihanesi’ne bağlı olarak hizmet vermektedir\.$/, "Today the church serves under the Ecumenical Patriarchate (Fener)."],
    [/^Küre Dağları Milli Parkı içerisinde yer almaktadır\.$/, "Located within Küre Mountains National Park."],
    [/^Ihlara Vadisi Ihlara Kasabası mevkii\.$/, "Ihlara Valley, near the town of Ihlara."],
    [/^Ihlara Vadisi içerisinde Belisırma mevkiinde yer almaktadır\.$/, "Located in the Ihlara Valley near Belisırma."],
    [/^Ihlara Vadisi’nin bitiş noktasında yer almaktadır\.$/, "Located at the end of the Ihlara Valley."],
    [/^Çalışmalar (.+?) tarafından sürdürülmektedir\.$/, "Work is carried out by the Afyonkarahisar Museum Directorate."],
    [/^Yapıları konu edinen yüksek lisans tezi: (.*)$/, "Master’s thesis on these buildings: $1"],
    [/^Yapıyı konu edinen makale: (.*)$/, "Article on this building: $1"],
    [/^Rahmi M\. Koç Müzecilik ve Kültür Vakfı'na bağlıdır\.$/, "Belongs to the Rahmi M. Koç Museum and Culture Foundation."],
    [/^Diyarbakır Keldani Katolik Kilisesi Vakfı$/, "Diyarbakır Chaldean Catholic Church Foundation."],
    [/^(\d{4}) yılında Diyarbakır Vakıflar Bölge Müdürlüğünce restore edilmiştir\.$/, "Restored in $1 by the Diyarbakır Regional Directorate of Foundations."],
    [/^The Church of England’a bağlıdır\.$/, "Affiliated with the Church of England."],
    [/^Restore edilerek 75\. Yıl Cumhuriyet Sahnesi olarak hizmete vermeye başlamıştır\.$/, "Restored and reopened as the 75th Anniversary Republic Stage."],
    [/^Protestan Baptist Kiliseler Vakfı bünyesinde hizmet vermektedir\.$/, "Serves within the Protestant Baptist Churches Foundation."],
    [/^Harabe şeklindedirler\. Yapıları konu edinen yüksek lisans tezi: (.*?) Van Gevaş – Bitlis Hizan ilçelerinde bulunan Gargar \/Karkar bölgesi kiliseleri\.$/, "In ruins. Master’s thesis on these buildings: $1 Churches of the Gargar/Karkar area in the Gevaş (Van) and Hizan (Bitlis) districts."],
    [/^Van Gevaş – Bitlis Hizan ilçelerinde bulunan Gargar \/Karkar bölgesi kiliseleri\.$/, "Churches of the Gargar/Karkar area in the Gevaş (Van) and Hizan (Bitlis) districts."]
  ];

  function cumleler(s) {
    // "St.", "M.", "Hz." gibi kısaltmalarda bölme
    return String(s).split(/(?<=[a-zçğıöşü\)]{2,}\.)\s+(?=[A-ZÇĞİÖŞÜ0-9])/).map(x => x.trim()).filter(Boolean);
  }
  function cumleCevir(c) {
    for (const [r, v] of KALIP) {
      if (r.test(c)) { const out = c.replace(r, v); return bas(out); }
    }
    return null;
  }
  function durum(s) {
    if (!s) return { metin: "", tam: true };
    const tum = cumleCevir(s.trim());
    if (tum !== null) return { metin: tum, tam: true };
    let tam = true;
    const parcalar = cumleler(s).map(c => { const t = cumleCevir(c); if (t === null) { tam = false; return c; } return t; });
    return { metin: parcalar.join(" ").trim(), tam };
  }
  function islev(s) {
    if (ISLEV[s] != null) return ISLEV[s];
    const d = durum(s); return d.tam ? d.metin.replace(/\.$/, "") : s;
  }

  window.CEVIRI_EN = { TUR, ISLEV_KAT, TOPLULUK, BOLGE, HASSASIYET, islev, durum };
})();
