// Site ayarları.
window.SITE_CONFIG = {
  // Google Apps Script "Web uygulaması" adresi (…/exec ile biter).
  // Boş bırakılırsa formlar gönderim yapmaz, kullanıcıya bilgi verir.
  // Sitenin kodunda yapılan son güncellemenin tarihi (YYYY-AA-GG). E-tablodaki değişiklikler ayrıca otomatik izlenir.
  SITE_GUNCELLEME: "2026-11-16",

  FEEDBACK_ENDPOINT: "https://script.google.com/macros/s/AKfycbxsZ6p3pDxFvDhFiRDb6bQ-YJRdtOh725mLm-oaTh2aCBuAP7j9w-prfquVjqE9tLwO/exec",

  // İsteğe bağlı: Uç nokta yokken kullanıcıya gösterilecek e-posta adresi.
  FEEDBACK_EMAIL: "",

  // Onaylanan fotoğrafları yapı kartında göster (Apps Script kuruluysa).
  SHOW_APPROVED_PHOTOS: true,

  // Fotoğraf başına en fazla boyut (sıkıştırma sonrası uzun kenar, piksel)
  PHOTO_MAX_EDGE: 1600,
  PHOTO_MAX_COUNT: 3
};
