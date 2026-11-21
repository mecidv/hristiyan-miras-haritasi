"""Canlı e-tablodaki envanteri (Apps Script) okuyup data/yapilar.json ve data/envanter.csv dosyalarını yeniler.
GitHub Actions'taki "Veri sürümü" iş akışı tarafından çalıştırılır; elle de çalıştırılabilir:
    python araclar/veri_aktar.py
Kişisel veri içermez: Apps Script yalnızca sitede herkese açık gösterilen alanları verir."""
import csv, json, re, sys, urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
ALANLAR = ["no", "ad", "tur", "il", "ilce", "yer", "lat", "lng", "hassasiyet", "topluluk",
           "islev", "islevKat", "durum", "unesco", "kaynak", "sayfa", "ad_en", "wikipedia_en", "wikidata"]

def ingilizce_adlar():
    """data/ad-en.js: İngilizce Vikipedi'de maddesi olan yapıların Wikidata ile eşleştirilmiş İngilizce adları.
    Biçim: kayıt no: [görünen ad, Vikipedi maddesi, Wikidata kimliği]"""
    metin = (KOK / "data" / "ad-en.js").read_text(encoding="utf-8")
    return {int(no): (ad, madde, q) for no, ad, madde, q in
            re.findall(r'^\s*(\d+):\s*\["((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*"(Q\d+)"\]', metin, re.M)}

def en_alanlari(b, adlar):
    ad, madde, q = adlar.get(int(b["no"]), ("", "", ""))
    return {"ad_en": ad, "wikipedia_en": ("https://en.wikipedia.org/wiki/" + madde.replace(" ", "_")) if madde else "",
            "wikidata": ("https://www.wikidata.org/wiki/" + q) if q else ""}

def adres():
    m = re.search(r'FEEDBACK_ENDPOINT:\s*"([^"]+)"', (KOK / "js" / "config.js").read_text(encoding="utf-8"))
    if not m: sys.exit("config.js içinde FEEDBACK_ENDPOINT bulunamadı")
    return m.group(1) + "?islem=veri"

def main():
    with urllib.request.urlopen(adres(), timeout=90) as y:
        veri = json.load(y)
    yapilar = veri.get("yapilar") or []
    if len(yapilar) < 100:   # güvenlik: yarım ya da hatalı yanıtla dosyaların üzerine yazılmasın
        sys.exit(f"Beklenenden az kayıt geldi ({len(yapilar)}); dosyalar değiştirilmedi")
    yapilar.sort(key=lambda b: b["no"])
    (KOK / "data" / "yapilar.json").write_text(json.dumps(yapilar, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with open(KOK / "data" / "envanter.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f); w.writerow(ALANLAR); adlar = ingilizce_adlar()
        for b in yapilar: b2 = dict(b, **en_alanlari(b, adlar)); w.writerow([b2.get(k, "") for k in ALANLAR])
    print(f"{len(yapilar)} kayıt yazıldı")

if __name__ == "__main__":
    main()
