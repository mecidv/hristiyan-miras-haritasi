"""Envanter verisinin yeni sürümünü Zenodo'ya, mevcut DOI çatısı (10.5281/zenodo.24338235) altında yükler.
Yalnızca veri dosyaları yüklenir: data/envanter.csv ve data/VERI.md. Kaynak kod Zenodo'ya gönderilmez.

GitHub Actions'taki "Veri sürümü" iş akışı çalıştırır. Gerekenler:
  - ZENODO_TOKEN ortam değişkeni (GitHub'da deponun gizli anahtarı; kapsamlar: deposit:write, deposit:actions)
  - YAYIMLA=true ise taslak yayımlanır; değilse Zenodo'da gözden geçirilmek üzere taslak olarak bırakılır.
Künye bilgileri .zenodo.json dosyasından alınır."""
import json, os, sys, urllib.error, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
API = "https://zenodo.org/api"
KAYIT = "24338236"            # bu çatıdaki herhangi bir sürümün kayıt numarası (ilk sürüm)
DOSYALAR = ["data/envanter.csv", "data/VERI.md"]
TOKEN = os.environ.get("ZENODO_TOKEN", "").strip()

def istek(yontem, url, veri=None, tur="application/json", ham=False):
    basliklar = {"Authorization": f"Bearer {TOKEN}"}
    govde = None
    if veri is not None:
        govde = veri if isinstance(veri, (bytes, bytearray)) else json.dumps(veri).encode("utf-8")
        basliklar["Content-Type"] = tur
    r = urllib.request.Request(url, data=govde, method=yontem, headers=basliklar)
    try:
        with urllib.request.urlopen(r, timeout=120) as y:
            icerik = y.read()
            return icerik if ham else (json.loads(icerik) if icerik else {})
    except urllib.error.HTTPError as h:
        sys.exit(f"Zenodo {yontem} {url} -> {h.code}: {h.read().decode('utf-8', 'replace')[:800]}")

def son_surum():
    # InvenioRDM: bir sürümden çatının en son yayımlanmış sürümüne; kayıt numarası ve sürüm adı döner
    r = urllib.request.Request(f"{API}/records/{KAYIT}/versions/latest", headers={"Authorization": f"Bearer {TOKEN}"})
    with urllib.request.urlopen(r, timeout=60) as y:
        j = json.load(y)
        return str(j["id"]), str((j.get("metadata") or {}).get("version") or "")

def main():
    if not TOKEN:
        print("ZENODO_TOKEN tanımlı değil; Zenodo yüklemesi atlandı."); return
    tr = timezone(timedelta(hours=3))
    gun = datetime.now(tr).strftime("%Y-%m-%d")
    son, son_ad = son_surum()
    print("En son yayımlanmış sürüm:", son, son_ad)
    # Yeni sürüm taslağı (önceden kalmış bir taslak varsa onu kullan)
    dep = istek("GET", f"{API}/deposit/depositions/{son}")
    taslak_url = dep.get("links", {}).get("latest_draft")
    if not taslak_url or taslak_url.rstrip("/").endswith("/" + son):
        yeni = istek("POST", f"{API}/deposit/depositions/{son}/actions/newversion")
        taslak_url = yeni["links"]["latest_draft"]
    taslak = istek("GET", taslak_url)
    tid = str(taslak["id"])
    print("Taslak:", tid)
    # Önceki sürümden devralınan dosyaları kaldır (ilk sürümdeki depo arşivi dahil)
    for f in taslak.get("files", []):
        istek("DELETE", f"{API}/deposit/depositions/{tid}/files/{f['id']}")
    kova = taslak["links"]["bucket"]
    for yol in DOSYALAR:
        ad = Path(yol).name
        istek("PUT", f"{kova}/{ad}", (KOK / yol).read_bytes(), tur="application/octet-stream")
        print("Yüklendi:", ad)
    kunye = json.loads((KOK / ".zenodo.json").read_text(encoding="utf-8"))
    kayit_sayisi = sum(1 for _ in open(KOK / "data/envanter.csv", encoding="utf-8-sig")) - 1
    # Sürüm adı tarihtir; aynı gün ikinci kez yüklenirse sonuna sıra eklenir (veri-2026-11-18-2)
    ad = f"veri-{gun}"
    if son_ad == ad or son_ad.startswith(ad + "-"):
        ek = son_ad[len(ad) + 1:] if son_ad != ad else "1"
        ad = f"{ad}-{int(ek) + 1 if ek.isdigit() else 2}"
    kunye.update({"version": ad, "publication_date": gun})
    kunye["notes"] = f"Bu sürüm {kayit_sayisi} kayıt içerir. / This version contains {kayit_sayisi} records."
    istek("PUT", f"{API}/deposit/depositions/{tid}", {"metadata": kunye})
    if os.environ.get("YAYIMLA", "true").lower() == "true":
        s = istek("POST", f"{API}/deposit/depositions/{tid}/actions/publish")
        print("Yayımlandı:", s.get("doi"), s.get("links", {}).get("html"))
    else:
        print("Taslak Zenodo'da gözden geçirilmeyi bekliyor:", taslak.get("links", {}).get("html"))

if __name__ == "__main__":
    main()
