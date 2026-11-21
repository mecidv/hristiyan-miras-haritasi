# Envanter verisi / Inventory data

`envanter.csv`: Türkiye İnanç Turizmi Yaşayan Envanter Projesi'nin kayıtları. UTF-8, virgülle ayrılmış, ilk satır alan adlarıdır. Her yayında e-tablodaki güncel kayıtlardan yeniden üretilir. Ziyaretçi gönderilerindeki kişisel bilgiler (ad, e-posta) bu dosyada yer almaz.

`envanter.csv` holds the records of the Religious Tourism of Türkiye Living Inventory Project. UTF-8, comma-separated, first row = field names. Regenerated from the live spreadsheet at each release. No personal data from visitor submissions is included.

| Alan / Field | Açıklama | Description |
|---|---|---|
| `no` | Kayıt numarası | Record number |
| `ad` | Yapının adı (varsa diğer adlarıyla) | Name of the building (with alternative names) |
| `tur` | Yapı türü: Kilise, Manastır, Şapel | Building type: church, monastery, chapel |
| `il`, `ilce`, `yer` | İl, ilçe, köy / mahalle / mevki | Province, district, village / neighbourhood / locality |
| `lat`, `lng` | Kayıtlı koordinat (WGS84, ondalık derece) | Recorded coordinate (WGS84, decimal degrees) |
| `hassasiyet` | Koordinatın neyi gösterdiği: il merkezi, ilçe merkezi, köy / mahalle ya da yapının kendisi | What the coordinate represents: province centre, district centre, village / neighbourhood, or the building itself |
| `topluluk` | Kayıtta belirtilen topluluk (boşsa belirtilmemiştir) | Community stated in the record (blank if not stated) |
| `islev` | Bugünkü işlevi, kaynaktaki ifadesiyle | Present-day use, as worded in the source |
| `islevKat` | Bugünkü işlevin sitedeki filtre kategorisi | Present-day use grouped into the site's filter categories |
| `durum` | Koruma ve fiziksel durum, kaynaktaki ifadesiyle | Conservation and physical condition, as worded in the source |
| `unesco` | UNESCO durumu: Dünya Mirası, Geçici Liste ya da boş | UNESCO status: World Heritage, Tentative List, or blank |
| `kaynak`, `sayfa` | Kaydın kaynağı ve kaynaktaki sayfa | Source of the record and page in that source |
| `ad_en` | Yapının İngilizce adı; yalnızca İngilizce Vikipedi'de maddesi bulunan yapılar için doldurulur | English name of the building; filled in only for buildings with an English Wikipedia article |
| `wikipedia_en` | Bu adın alındığı İngilizce Vikipedi maddesi | English Wikipedia article the name is taken from |
| `wikidata` | Eşleştirmenin dayandığı Wikidata kaydı | Wikidata item the match is based on |

İngilizce adlar Wikidata kayıtlarıyla eşleştirilmiştir: ad ve konum birlikte denetlenmiş (18 Kasım 2026), belirsiz eşleşmeler ve birden çok yapıyı tek kayıtta toplayan kayıtlar dışarıda bırakılmıştır. Boş bırakılan yapıların adları özel isim olarak Türkçe kullanılır.

English names were matched against Wikidata items, checking both name and location (18 November 2026). Ambiguous matches and records that group several buildings were left out. Buildings without an English name keep their Turkish name as a proper noun.

Konumlar yaklaşıktır; `hassasiyet` alanına göre değerlendirilmelidir. Sitede, kayıtlı koordinatı il sınırının biraz dışında kalan az sayıdaki kayıt en yakın kara noktasında gösterilir; bu dosyadaki koordinatlar kayıtlı değerlerdir.

Locations are approximate and should be read together with `hassasiyet`. On the website, the few records whose coordinate falls just outside the province boundary are displayed at the nearest point on land; this file keeps the recorded values.

DOI (tüm sürümler / all versions): https://doi.org/10.5281/zenodo.24338235

Lisans / Licence: CC BY 4.0 ([LISANS.md](../LISANS.md)).
