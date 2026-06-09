# Progress — Applyze Geliştirme Günlüğü

Yapılan işlerin, alınan kararların ve karşılaşılan hataların kaydı. Yeni girişler en üstte.

---

## Faz 3 — Yayın & Sertleştirme (Haziran 2026)

Uygulamayı gerçek anlamda **canlıya almak** ve teslime hazırlamak.

### Yayın (deploy)
- **Web canlıya alındı:** Vercel'e bağlandı (Root: `frontend`, Build: `npx expo export -p web`, Output: `dist`). Canlı: **applyze.vercel.app**.
- **Karar:** Mobil (App/Play Store) yayın sonraya bırakıldı; brief web deploy'u yeterli görüyor, mobil yol haritasında.

### Çözülen hatalar (bu fazda)
- **Derin link 404 (Vercel):** `/login` gibi rotalar doğrudan açılınca/yenilenince 404 veriyordu. → `frontend/vercel.json` ile tüm rotalar `index.html`'e yönlendirildi (SPA fallback). Çözüldü.
- **Tarayıcı önbelleği eski sürümü gösteriyordu:** Test gizli pencerede yapılınca doğrulandı; merge sonrası sert yenileme alışkanlığı edinildi.
- **Gemini 429 (kota doldu):** Edge Function logunda `429 / quota` görüldü. AI özelliği "veri az" gibi yanıltıcı mesaj veriyordu. → (1) Önbellek eklendi (veri değişmedikçe Gemini çağrılmaz), (2) kota hatasında doğru mesaj gösterildi, (3) faturalandırma kullanım arttığında açılacak şekilde ertelendi.
- **Toplu içe aktarmada çift kayıt:** Aynı dosya iki kez yüklenince kayıtlar çiftleniyordu. → Şirket+pozisyon bazlı tekrar kontrolü (hem dosya içi hem mevcut kayıtlara karşı). Ayrıca içe aktarma sonrası liste otomatik tazeleniyor.
- **Kayıt akışı UX:** Var olan e-postayla kayıt olunca "hesap oluşturuldu" deniyordu (yanıltıcı). → Supabase'in boş `identities` davranışı yakalanıp "zaten hesabın var" mesajı + e-posta format doğrulaması eklendi.

### Eklenen / iyileştirilen özellikler
- **Google ile giriş** (OAuth) eklendi.
- **Onboarding** sırası düzeltildi: tanıtım artık girişten **önce** gösteriliyor.
- **Yolculuğum / Eşikler** ekranı: eski sabit "kutlama" ekranı, gerçek istatistik ekranına dönüştürüldü (eşikler + huni/dönüşüm + öne çıkanlar); rahatsız edici otomatik pop-up kaldırıldı.
- **CORS sertleştirildi:** Edge Function'lar `*` yerine allowlist'e (il9u.com, applyze.vercel.app, localhost) çevrildi; Supabase CLI ile yeniden deploy edildi.

### Altyapı kararları
- **Custom SMTP:** Supabase varsayılan e-postası saatte ~2 mail (proje geneli) ile sınırlı → gerçek kullanıcılar için engel. **il9u.com** alan adı (Cloudflare) alındı; **Resend** ile `noreply@il9u.com` doğrulandı; Supabase SMTP buna bağlandı. İletişim için **Cloudflare Email Routing** ile `support@il9u.com` gerçek kutuya yönlendirildi.
- **Domain stratejisi:** Tek "çatı" alan adı → tüm uygulamalar alt alanlarda + tek e-posta altyapısı.
- **Güvenlik:** Repo public; gizli anahtarların koda/`.env`'e sızmadığı doğrulandı (`.env` gitignore'da, kodda gömülü anahtar yok).

---

## Faz 2 — Yapay Zekâ Özellikleri

- **Pusula (ai-suggestions):** Başvuru verisinden gizliliğe uygun sayısal teşhis (huni, darboğaz, güçlü alan/sektör, momentum) hesaplanıp Gemini'ye yorumlatıldı. Başlık + 3-4 somut öneri.
- **CV ↔ ilan uyum analizi (analyze-fit):** PDF CV `inline_data` ile okunup ilanla karşılaştırıldı; uyum skoru + gerekçe.
- **İlan linkinden otomatik form doldurma (parse-job).**
- **Karar:** AI çağrıları **istemciden değil Edge Function'dan** yapılır → API anahtarı gizli. AI'a şirket adı gönderilmez.
- **Hata/karar:** `gemini-2.5-flash`'a geçince boş yanıt sorunu → `thinkingBudget: 0` ile çözüldü; ana model + `flash-lite` yedek kuruldu.

---

## Faz 1 — Temel Ürün (MVP)

- **Veri modeli:** `applications`, `stages`, `stage_history`, `notes`, `profiles` tabloları; **RLS** ile kullanıcı bazlı izolasyon. Migration'lar `backend/supabase/migrations/`.
- **Kimlik:** E-posta + şifre ile giriş; şifre sıfırlama; hesap silme (Edge Function).
- **Çekirdek ekranlar:** Liste, başvuru detayı + aşama zaman çizelgesi, Özet (dashboard), Profil.
- **Özellikler:** Başvuru ekle/düzenle, aşama güncelleme, özel aşamalar, notlar, favoriler, arama & sıralama, Excel/CSV toplu içe aktarma, takvim seçici, verileri dışa aktarma.
- **P0 yayın bloklayıcılar:** Gizlilik Politikası + Kullanım Koşulları sayfaları, uygulama içi hesap silme, e-posta doğrulama akışı.

---

## Genel Öğrenimler

- Önce gerçek üretim ortamında test etmek (gizli pencere, canlı URL) hayalet hataları (önbellek) ayıklamayı kolaylaştırdı.
- Ücretsiz katman sınırları (Gemini kota, Supabase mail) erken fark edilip mimariye (önbellek, custom SMTP) yansıtıldı.
- Güvenlik kararları (CORS, token-auth, gizli anahtar yönetimi) "yapılmış olsun" değil, gerçek risk üzerinden verildi.
