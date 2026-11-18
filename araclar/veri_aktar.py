"""Canlı e-tablodaki envanteri (Apps Script) okuyup data/yapilar.json ve data/envanter.csv dosyalarını yeniler.
GitHub Actions'taki "Veri sürümü" iş akışı tarafından çalıştırılır; elle de çalıştırılabilir:
    python araclar/veri_aktar.py
Kişisel veri içermez: Apps Script yalnızca sitede herkese açık gösterilen alanları verir."""
import csv, json, re, sys, urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
ALANLAR = ["no", "ad", "tur", "il", "ilce", "yer", "lat", "lng", "hassasiyet", "topluluk",
           "islev", "islevKat", "durum", "unesco", "kaynak", "sayfa"]

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
        w = csv.writer(f); w.writerow(ALANLAR)
        for b in yapilar: w.writerow([b.get(k, "") for k in ALANLAR])
    print(f"{len(yapilar)} kayıt yazıldı")

if __name__ == "__main__":
    main()
