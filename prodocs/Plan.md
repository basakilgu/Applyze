# Applyze — Geliştirme Planı (plan.md)

**Versiyon:** v1.3
**Son Güncelleme:** Haziran 2026 — **Platform yönü kararı:** MVP **web** olarak canlıya alındı (applyze.vercel.app); **mobil (iOS/Android) yayını v2'ye ertelendi.** AI özellikleri (Pusula, CV↔ilan uyumu, ilan→form) çekirdek kapsamda tamamlandı.
**Kaynak Dokümanlar:** PRD v2.1, MVP Kapsam v2.0, README v1.0
**Hedef Süre:** 10 Hafta (Sprint 1–4)
**Platform:** **Web (MVP, canlı)** · Mobil iOS 16+ / Android 10+ **v2'ye ertelendi**
**Mimari:** Backend (Supabase) ve Frontend (Expo) ayrı servisler olarak ele alınır. Backend, platformdan bağımsız bir API katmanıdır: bugün web istemcisine, yarın mobile aynı uçları sunar.

> **Platform notu (v1.3):** Bu plan başlangıçta mobil-öncelikli (App Store/Play Store) tasarlandı. Geliştirme sürecinde, bitirme teslimi için web deploy'un yeterli olması ve odağı korumak adına **web MVP** öncelikli hale getirildi; **mobil mağaza adımları (Faz 6.3–6.6, EAS, TestFlight) v2'ye ertelendi.** Aşağıda `📱 v2` etiketli adımlar mobil sürümle birlikte ele alınacaktır. Web yayın akışı **Faz 6-Web** bölümünde tamamlanmıştır.

> Bu plan, atomik görevlere bölünmüştür. Her görev tek bir çıktı üretir ve bir sonrakini engellemeyecek şekilde tamamlanabilir olmalıdır. Görev sıralaması bağımlılıklara göre belirlenmiştir.

---

## İçindekiler

- [Faz 0 — Ön Hazırlık](#faz-0--ön-hazırlık-hafta-0-sprint-başlamadan)
- [Faz 1 — Proje Kurulumu (Gün 1–2)](#faz-1--proje-kurulumu-gün-12)
- [Faz 2 — Veritabanı ve API Şeması (Gün 2–3)](#faz-2--veritabanı-ve-api-şeması-gün-23)
- [Faz 3 — Sprint 1: Temel (Gün 3–21)](#faz-3--sprint-1-temel-gün-321)
- [Faz 4 — Sprint 2: Tamamlama (Gün 22–42)](#faz-4--sprint-2-tamamlama-gün-2242)
- [Faz 5 — Sprint 3: Etkileşim + AI (Gün 43–56)](#faz-5--sprint-3-etkileşim--ai-gün-4356)
- [Faz 6-Web — Web Yayın & Sertleştirme (tamamlandı)](#faz-6-web--web-yayın--sertleştirme-tamamlandı)
- [Faz 6-Mobil — 📱 v2: Mağaza Yayını](#faz-6-mobil--v2-mağaza-yayını)
- [Faz 7 — Yayın Sonrası İzleme](#faz-7--yayın-sonrası-izleme)

---

## Faz 0 — Ön Hazırlık (Hafta 0, Sprint başlamadan)

### 0.1 Hesap ve Lisans Kurulumu

- [ ] 📱 **v2:** Apple Developer hesabı aç ($99/yıl) — mobil yayın için, v2'ye ertelendi.
- [ ] 📱 **v2:** Google Play Console hesabı aç ($25 tek seferlik) — v2'ye ertelendi.
- [x] Supabase hesabı oluştur ve proje aç.
- [x] Google Cloud Console'da OAuth 2.0 Client ID oluştur (Web + ileride mobil).
- [x] Vercel hesabı + GitHub bağlantısı (web deploy için).
- [x] Google Gemini API anahtarı al (AI özellikleri için).

### 0.2 Teknik Uygunluk Araştırması (Scraping — Risk #1) — TAMAMLANDI

> **Sonuç (14 Mayıs 2026):** Kariyer.net ilan sayfaları server-side render edilmiş HTML üretiyor ama sunucu, PerimeterX bot koruması ile Supabase Edge Function IP'lerini HTTP 403 ile engelliyor. **🔴 Kırmızı senaryo gerçekleşti.** Otomatik scraping MVP'den çıkarıldı. **Yerine:** kullanıcının yapıştırdığı ilan metnini **AI ile çözümleyip formu dolduran** akış (parse-job) geliştirildi — bu scraping değildir.

### 0.3 Repo ve Dal Yapısı

- [x] GitHub'da `applyze` reposu (sonradan public yapıldı; gizli anahtar sızmadığı doğrulandı).
- [x] `.gitignore`: `node_modules`, `.env`, `ios/`, `android/`, `.expo/`, `dist/`.
- [x] `main` + `feature/*` dal stratejisi.

---

## Faz 1 — Proje Kurulumu (Gün 1–2)

### 1.1 Backend Servisi — Supabase

- [x] Supabase CLI kurulumu ve `supabase init`.
- [x] `supabase/config.toml` yerel portları (54321 API, 54322 DB).
- [x] Supabase Auth: Google + Email sağlayıcıları açık.
- [x] `supabase/migrations/` klasörü.

### 1.2 Frontend Servisi — Expo (Web + Mobil tek kod tabanı)

- [x] Expo + TypeScript template.
- [x] Expo Router'a geçiş; `main` = `expo-router/entry`.
- [x] `@supabase/supabase-js` + `react-native-url-polyfill`.
- [x] NativeWind + Tailwind kurulumu.
- [x] `lib/supabase.ts` — Supabase client (web'de localStorage, native'de SecureStore).
- [x] `.env.example` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- [x] `.env` değerleri (commit edilmez).
- [ ] 📱 **v2:** `eas build:configure`, bundle identifier, ikon/splash mağaza varlıkları.

> **Not:** `npx expo start --web` ile web tarayıcıda açıldı ve `hello` Edge Function'a istek atıp doğru cevabı aldı. Web akışı doğrulandı; mobil simulator testleri v2'ye bırakıldı.

---

## Faz 2 — Veritabanı ve API Şeması (Gün 2–3)

### 2.1 Veritabanı Şeması

- [x] `applications`, `stages`, `stage_history`, `notes`, `profiles` tabloları (PRD §9).
- [x] Performans indeksleri (`user_id`, `source_url`, `application_id`).
- [x] `updated_at` trigger'ı.

### 2.2 Satır Bazlı Erişim Kontrolü (RLS)

- [x] Tüm tablolarda RLS aktif; `auth.uid() = user_id` politikaları.
- [x] `stage_history` ve `notes` için subquery politikaları.
- [x] RLS izolasyonu iki kullanıcı ile doğrulandı (smoke test).

### 2.3 Varsayılan Veri (Seed)

- [x] Yeni kayıtta 6 varsayılan aşamayı ekleyen trigger.

### 2.4 Edge Function API Sözleşmesi

> Edge Functions `backend/supabase/functions/<n>/index.ts` altında yazılır. Tümünde JWT doğrulaması ve CORS allowlist aktif.

- [x] `ai-suggestions` (Pusula içgörü — Gemini).
- [x] `analyze-fit` (CV ↔ ilan uyumu — Gemini, PDF inline_data).
- [x] `parse-job` (ilan metni → form alanları — Gemini).
- [x] `extract-cv` (PDF metin çıkarımı).
- [x] `check-duplicate` (tekrar başvuru kontrolü).
- [x] `delete-account` (hesap + veri imhası).
- [x] `send-inactivity-notifications` (cron — bildirim adayı; 📱 push gönderimi v2).
- [x] `_shared/cors.ts` ortak CORS helper'ı.

---

## Faz 3 — Sprint 1: Temel (Gün 3–21)

### 3.1 Kimlik Doğrulama (F-01 → F-04)

- [x] Login / signup / forgot-password ekranları.
- [x] Google ile giriş (OAuth).
- [x] `store/auth.ts` (session, user, login/logout/signup).
- [x] Form hataları Toast ile.

### 3.2 Karşılama Akışı (Onboarding)

- [x] Tanıtım ekranları; **onboarding girişten önce** gösteriliyor (sıra düzeltildi).
- [x] "Atla" / "Devam"; görüldü bayrağı yerel saklanır.

### 3.3 Manuel Başvuru Ekleme (F-10)

- [x] Başvuru formu (şirket + pozisyon zorunlu; platform/lokasyon/URL/tarih opsiyonel).
- [x] `store/applications.ts` (fetchAll, create, update, softDelete).
- [x] Kaydet → default "Başvuruldu" aşaması.

### 3.4 İlan Linkinden AI Otomatik Doldurma (parse-job) — Scraping yerine

> Otomatik scraping iptal edildi (Faz 0.2). Yerine kullanıcının yapıştırdığı ilan metni Gemini ile çözümlenip form alanları doldurulur.

- [x] `parse-job` Edge Function + form entegrasyonu.

### 3.5 Görsel Takip / Liste Görünümü (F-18 → F-21)

- [x] Aşama bazlı görünüm + başvuru kartları (şirket kalın, pozisyon, platform noktası, göreli tarih).
- [x] Aşama güncelleme (alt sayfa/seçim) + `stage_history` kaydı.
- [ ] 📱 **v2:** Sürükle-bırak + native dokunsal geri bildirim (web'de seçim/alt sayfa ile çözüldü).

### 3.6 Başvuru Arşivi / Liste (F-22, F-23)

- [x] Tüm başvurular `applied_at DESC`; anlık arama (şirket + pozisyon).
- [x] Satıra tıklama → başvuru detayı.

---

## Faz 4 — Sprint 2: Tamamlama (Gün 22–42)

### 4.1 Başvuru Detay Sayfası (F-27 → F-30)

- [x] Detay: şirket + pozisyon + aşama + platform.
- [x] Aşama değiştirme (alt sayfa) + `stage_history`.
- [x] Notlar (ekle/düzenle/sil, max 2000).
- [x] Aşama geçmişi zaman çizelgesi.
- [x] "İlana git" (`source_url`).

### 4.2 Başvuru Silme (F-12)

- [x] `softDelete(id)` → `deleted_at = now()`.
- [x] Onay dialogu ("Bu işlem geri alınamaz").
- [x] Tüm sorgular `deleted_at IS NULL` filtreli.

### 4.3 Özelleştirilebilir Aşamalar (F-16)

- [x] Aşama ekle/yeniden adlandır/sil; varsayılanlar silinemez.

### 4.4 Arşiv Filtreleri (F-24 → F-26)

- [x] Platform + aşama filtresi, tarih sıralaması.

### 4.5 Excel/CSV Toplu İçe Aktarma (F-40)

- [x] Excel/CSV ile toplu ekleme; **çift kayıt kontrolü** (dosya içi + mevcut kayıtlara karşı); içe aktarma sonrası liste tazelenir.

### 4.6 Gösterge Paneli — Metrikler & Grafik (F-31, F-32)

- [x] 4 metrik kartı (toplam aktif, yanıt bekleyen, mülakat, teklif).
- [x] Aşama dağılımı grafiği; boş durum mesajı.

### 4.7 Tasarım Cilası — Boş / Yükleme / Hata

- [x] Standart EmptyState, skeleton yükleme, tutarlı hata Toast'u.

---

## Faz 5 — Sprint 3: Etkileşim + AI (Gün 43–56)

### 5.1 Yolculuğum / Elenme Analizi — Aşamalı Açılım (F-33)

- [x] 0–4 / 5–9 / 10+ modları; eşikler + huni/dönüşüm istatistikleri.
- [x] Silinen başvurular dışlanır (`deleted_at IS NULL`).
- [x] Eski sabit "kutlama" ekranı gerçek istatistik ekranına dönüştürüldü; rahatsız edici pop-up kaldırıldı.

### 5.2 AI Pusula — İçgörü (F-38, ai-suggestions)

- [x] Gizliliğe uygun sayısal teşhis hesaplanıp Gemini'ye gönderiliyor (şirket adı YOK).
- [x] Başlık + 3-4 somut öneri; `thinkingBudget: 0` ile boş yanıt sorunu çözüldü.
- [x] Ana model + `flash-lite` yedek; önbellek (24 saat) ile kota koruması.

### 5.3 CV ↔ İlan Uyum Analizi (F-39, analyze-fit)

- [x] CV PDF `inline_data` ile okunup ilanla karşılaştırılıyor; uyum skoru + gerekçe.

### 5.4 Tekrarlayan Başvuru Uyarısı (F-13)

- [x] `check-duplicate` ile kontrol; uyarı gösterilir, engellenmez.

### 5.5 Bildirim Altyapısı — 📱 v2

- [x] Backend: `send-inactivity-notifications` cron sorgusu hazır.
- [ ] 📱 **v2:** Push token kaydı, kilit ekranı gizlilik önizlemesi, bildirim ayarları ekranı (mobil ile gelir).

---

## Faz 6-Web — Web Yayın & Sertleştirme (tamamlandı)

> Bitirme teslimi için **canlı web** yayın akışı. Brief web deploy'u yeterli görüyor.

### 6W.1 Web Deploy (Vercel)

- [x] Vercel'e bağlandı: Root `frontend`, Build `npx expo export -p web`, Output `dist`.
- [x] Canlı: **applyze.vercel.app**. Her `main` merge'i otomatik deploy.
- [x] Derin link/yenileme 404'ları `frontend/vercel.json` (SPA fallback) ile çözüldü.

### 6W.2 Sertleştirme

- [x] **CORS** `*` → allowlist (il9u.com, applyze.vercel.app, localhost); Supabase CLI ile yeniden deploy.
- [x] **Gemini 429 kota:** önbellek + doğru hata mesajı + faturalandırma ertelendi.
- [x] **Kayıt akışı UX:** "zaten hesabın var" durumu (Supabase `identities`) yakalandı.
- [x] **Custom SMTP:** il9u.com (Cloudflare) + Resend (`noreply@il9u.com`); Supabase mail limiti aşıldı.
- [x] **Güvenlik:** Repo public; `.env` gitignore'da, kodda gömülü anahtar yok — doğrulandı.

### 6W.3 Yayın Bloklayıcılar (P0)

- [x] Gizlilik Politikası + Kullanım Koşulları sayfaları.
- [x] Uygulama içi hesap silme (`delete-account`).
- [x] E-posta doğrulama akışı.

---

## Faz 6-Mobil — 📱 v2: Mağaza Yayını

> Aşağıdaki adımlar mobil sürümle birlikte ele alınacaktır. Kod tabanı (Expo) hazır; mağaza süreçleri v2 kapsamında.

- [ ] EAS build yapılandırması, bundle identifier, ikon/splash.
- [ ] TestFlight (iOS) + Google Play dahili test.
- [ ] App Store / Play Store varlıkları (ekran görüntüleri, açıklama, gizlilik formu).
- [ ] Production build + mağaza incelemesi.
- [ ] Push bildirim uçtan uca (token, kilit ekranı gizliliği, ayarlar).

---

## Faz 7 — Yayın Sonrası İzleme

### 7.1 İlk 7 Gün

- [ ] Edge Function başarı oranı (ai-suggestions, analyze-fit, parse-job, check-duplicate).
- [ ] Gemini kota kullanımı izleme.
- [ ] Supabase veritabanı yükü.

### 7.2 İlk 30 Gün

- [ ] Aktiflik metrikleri (7. gün > %50, 30. gün > %30 hedef).
- [ ] AI öneri yararlılığı (kullanıcı geri bildirimi).

### 7.3 v2 Yol Haritası

- [ ] Mobil mağaza yayını (EAS).
- [ ] Push bildirim.
- [ ] Scraping/resmi API ile otomatik bilgi çekme.
- [ ] Çoklu dil; premium katman (Gemini faturalandırma).

---

## Ek A — Görev Bağımlılıkları (Kritik Yol)

1. ~~Faz 0.2 (Scraping araştırması) → Faz 3.4~~ — Tamamlandı; scraping iptal, yerine AI parse-job.
2. **Faz 2 (Şema + RLS)** → Tüm Faz 3+ görevleri.
3. **Faz 3.1 (Auth)** → Tüm başvuru görevleri.
4. **Faz 5.2 (AI Pusula)** → Yolculuğum ekranı içgörü entegrasyonu.
5. **Faz 6-Web** → Bitirme teslimi (tamamlandı).
6. 📱 **Faz 0.1 (Apple/Google hesap)** → Faz 6-Mobil (v2).

---

## Ek B — Kapsam Dışı (Bu Plana Dahil Değil)

- Mobil mağaza yayını (v2 — Faz 6-Mobil)
- Push bildirim (v2)
- Scraping ile otomatik bilgi çekme (v2)
- İlan toplama (v3)
- AI ilan tavsiye/öneri motoru (v2) — *AI içgörü ve CV uyumu MVP'de vardır*
- Seri/streak sistemi (kalıcı red)
- Sosyal özellikler (v3)
- CV oluşturucu (bağımsız ürün)

---

*Applyze plan.md — v1.3 | PRD v2.1 temel alınarak hazırlandı. Web MVP canlı; mobil v2'ye ertelendi.*
