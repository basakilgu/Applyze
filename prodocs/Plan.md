# Applyze — Geliştirme Planı (plan.md)

**Versiyon:** v1.2
**Son Güncelleme:** 14 Mayıs 2026 — Faz 0.2 sonucu (🔴 Kırmızı), otomatik bilgi çekme v2'ye ertelendi — Faz 1 kısmen tamamlandı (backend + frontend bağlantısı kuruldu)
**Kaynak Dokümanlar:** PRD v2.0, MVP Kapsam v2.0, README v1.0
**Hedef Süre:** 10 Hafta (Sprint 1–4)
**Platform:** iOS 16+ / Android 10+
**Mimari:** Backend (Supabase) ve Frontend (Expo) ayrı servisler olarak ele alınır.

> Bu plan, atomik görevlere bölünmüştür. Her görev tek bir çıktı üretir ve bir sonrakini engellemeyecek şekilde tamamlanabilir olmalıdır. Görev sıralaması bağımlılıklara göre belirlenmiştir — yukarıdan aşağıya ilerlemek zorunludur.

---

## İçindekiler

- [Faz 0 — Ön Hazırlık (Hafta 0, Sprint başlamadan)](#faz-0--ön-hazırlık-hafta-0-sprint-başlamadan)
- [Faz 1 — Proje Kurulumu (Gün 1–2)](#faz-1--proje-kurulumu-gün-12)
- [Faz 2 — Veritabanı ve API Şeması (Gün 2–3)](#faz-2--veritabanı-ve-api-şeması-gün-23)
- [Faz 3 — Sprint 1: Temel (Gün 3–21)](#faz-3--sprint-1-temel-gün-321)
- [Faz 4 — Sprint 2: Tamamlama (Gün 22–42)](#faz-4--sprint-2-tamamlama-gün-2242)
- [Faz 5 — Sprint 3: Etkileşim (Gün 43–56)](#faz-5--sprint-3-etkileşim-gün-4356)
- [Faz 6 — Sprint 4: Test ve Yayına Alım (Gün 57–70)](#faz-6--sprint-4-test-ve-yayına-alım-gün-5770)
- [Faz 7 — Yayın Sonrası İzleme](#faz-7--yayın-sonrası-izleme)

---

## Faz 0 — Ön Hazırlık (Hafta 0, Sprint başlamadan)

> Bu faz tamamlanmadan Sprint 1 kodlaması başlatılmaz. Faz 0 çıktısı Sprint 1 kapsamını etkileyebilir (bkz. PRD §11 Kısıtlama #1).

### 0.1 Hesap ve Lisans Kurulumu

- [ ] Apple Developer hesabı aç ($99/yıl). Sprint 1 öncesi; inceleme 24–48 saat sürebilir.
- [ ] Google Play Console hesabı aç ($25 tek seferlik).
- [ ] Supabase hesabı oluştur ve `applyze-dev` adında ücretsiz proje aç.
- [ ] Amplitude hesabı aç ve yeni bir "Applyze" projesi oluştur.
- [ ] Expo (EAS) hesabı oluştur ve `eas login` ile yerel CLI'ya bağlan.
- [ ] Google Cloud Console'da OAuth 2.0 Client ID oluştur (iOS + Android + Web için ayrı istemciler).

### 0.2 Teknik Uygunluk Araştırması (Kritik — Risk #1) — TAMAMLANDI

> **Sonuç (14 Mayıs 2026):** Kariyer.net ilan sayfaları server-side render edilmiş HTML üretiyor (`og:title`, `<h1 data-test="job-title">`, `<span data-test="company-location">` hepsi mevcut). Ancak sunucu, PerimeterX bot koruması (`client.px-cloud.net`) ile Supabase Edge Function IP'lerini HTTP 403 ile engelliyor. **🔴 Kırmızı senaryo gerçekleşti.** Otomatik bilgi çekme MVP'den çıkarıldı, manuel ekleme öne çekildi. Detay için MVP_KAPSAM §12 ve PRD §13.

- [ ] 20–30 farklı Kariyer.net ilan sayfasını tarayıcı geliştirici araçlarıyla incele. HTML'in sunucu taraflı mı yoksa JS ağırlıklı mı render edildiğini tespit et.
- [ ] Youthall için aynı inceleme: 15–20 farklı ilan.
- [ ] Anbean için aynı inceleme: 10–15 farklı ilan.
- [ ] Hız sınırı testi: Aynı IP'den 10+ istek at, cevap süresi ve engelleme davranışını kaydet.
- [ ] Her üç platformun meta tag yapısını (`og:title`, `og:description`, JSON-LD) belgele.
- [ ] Sonuç raporunu `docs/scraping-research.md` olarak yaz. Seçeneklerden biri işaretlensin:
  - [ ] 🟢 **Yeşil:** HTML sunucu taraflı + tutarlı → Sprint 1'de yaz.
  - [ ] 🟡 **Sarı:** JS ağırlıklı → Puppeteer/Playwright + ek 3–5 gün.
  - [ ] 🔴 **Kırmızı:** Engelleme + güvenilmez → Otomatik bilgi çekme MVP'den çıkar, manuel ekleme öne alınır.
- [ ] Başarı hedefi yüzdesi araştırma sonucuna göre belirle ve `docs/scraping-research.md`'e ekle.

### 0.3 Repo ve Dal Yapısı

- [x] GitHub'da `applyze` adında private repo oluştur.
- [ ] `main`, `develop`, `feature/*` dal stratejisini README'ye yaz.
- [ ] Dal koruma kuralları: `main` sadece PR ile, `develop`'a merge en az 1 onay.
- [x] `.gitignore`: `node_modules`, `.env`, `ios/`, `android/`, `.expo/`, `dist/` ekle.
- [ ] `LICENSE` (MIT) dosyasını ekle.

---

## Faz 1 — Proje Kurulumu (Gün 1–2)

### 1.1 Backend Servisi — Supabase

- [x] Supabase CLI'yı kur: `brew install supabase/tap/supabase`.
- [x] Yerel çalışma dizininde `supabase/` alt klasörünü başlat: `supabase init`.
- [ ] Supabase projesini yerel CLI'ya bağla: `supabase link --project-ref <proje-ref>`.
- [x] `supabase/config.toml` dosyasında yerel geliştirme portlarını (54321 API, 54322 DB) doğrula.
- [ ] Supabase Auth panelinde Google sağlayıcısını aç; Client ID ve Secret'ı Google Cloud'dan al.
- [ ] Supabase Auth panelinde Email sağlayıcısını aç; e-posta doğrulamasını açık bırak.
- [ ] Supabase Auth panelinde şifre sıfırlama e-posta şablonunu Türkçeye çevir.
- [ ] JWT süresini 1 saat, refresh token süresini 30 gün olarak ayarla (Auth > Settings).
- [x] `supabase/migrations/` klasörünü oluştur, boş bir `0000_init.sql` dosyası yerleştir (Faz 2'de doldurulacak).

### 1.2 Frontend Servisi — Expo

- [x] Expo projesini Typescript template ile başlat: `npx create-expo-app@latest applyze --template expo-template-blank-typescript`.
- [x] Expo Router'a geçiş yap: `npx expo install expo-router react-native-safe-area-context react-native-screens`.
- [x] `package.json` → `main` alanını `"expo-router/entry"` yap.
- [ ] `app.json` → `scheme: "applyze"` ayarla (derin bağlantı için).
- [ ] Temel bağımlılıkları kur:
  - [x] `npx expo install @supabase/supabase-js react-native-url-polyfill`
  - [ ] `npm install zustand`
  - [ ] `npx expo install expo-notifications expo-device expo-constants`
  - [ ] `npx expo install expo-secure-store` (oturum saklama için)
  - [ ] `npm install @amplitude/analytics-react-native`
  - [ ] `npm install react-native-gesture-handler react-native-reanimated` (sürükle-bırak için)
  - [ ] `npm install date-fns` (göreli tarih için)
- [ ] Klasör yapısını kur (README'deki şablona göre):
  - [ ] `app/(auth)/`, `app/(tabs)/`, `app/application/`
  - [ ] `components/`, `store/`, `lib/`, `assets/`
- [x] `lib/supabase.ts` oluştur: Supabase client'ı SecureStore ile başlat.
- [ ] `.env.example` dosyasını oluştur: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_AMPLITUDE_API_KEY`.
- [x] `.env` dosyasını ilgili değerlerle doldur (commit edilmeyecek).
- [ ] EAS yapılandırması: `eas build:configure` çalıştır, `eas.json` üret.
- [ ] iOS bundle identifier: `com.applyze.app`. Android package: `com.applyze.app`.
- [ ] Uygulama ikonu (1024x1024), splash screen ve adaptive icon şablonlarını `assets/`'e yerleştir (placeholder olabilir).
- [ ] `npx expo start` ile hem iOS simulator hem de Android emulator'da boş ekranın açıldığını doğrula.

> **Not (22 Nis 2026):** `npx expo start --web` ile web tarayıcıda açıldı ve `hello` Edge Function'a istek atıp `"Merhaba Başak — backend ayakta."` cevabını başarıyla aldı. iOS simulator ve Android emulator testleri henüz yapılmadı.

### 1.3 CI ve Kalite Altyapısı

- [ ] ESLint + Prettier kur: `npm install -D eslint prettier eslint-config-prettier eslint-plugin-react`.
- [ ] `.eslintrc.js`, `.prettierrc` dosyalarını oluştur.
- [ ] Husky + lint-staged kur; commit öncesi lint + format çalıştır.
- [ ] GitHub Actions workflow'u: `.github/workflows/ci.yml`. Her PR'da lint + type-check + test çalıştırsın.
- [ ] Jest + React Native Testing Library kur: `npm install -D jest @testing-library/react-native @testing-library/jest-native`.
- [ ] `jest.config.js` oluştur ve smoke test olarak bir `App.test.tsx` yaz.

---

## Faz 2 — Veritabanı ve API Şeması (Gün 2–3)

### 2.1 Veritabanı Şeması (Migration 0001)

> Tüm tablolar `supabase/migrations/0001_schema.sql` içinde tek bir migration olarak yazılır.

- [ ] `applications` tablosunu oluştur (PRD §9):
  - `id UUID PK`, `user_id UUID FK → auth.users`, `company_name TEXT NOT NULL`, `position TEXT NOT NULL`, `platform TEXT`, `source_url TEXT`, `location TEXT`, `current_stage_id UUID FK → stages`, `applied_at TIMESTAMPTZ DEFAULT now()`, `created_at`, `updated_at`, `deleted_at TIMESTAMPTZ`.
- [ ] `stages` tablosunu oluştur:
  - `id UUID PK`, `user_id UUID FK`, `name TEXT NOT NULL`, `color TEXT`, `order INT`, `is_terminal BOOLEAN DEFAULT false`, `is_default BOOLEAN DEFAULT false`.
- [ ] `stage_history` tablosunu oluştur:
  - `id UUID PK`, `application_id UUID FK ON DELETE CASCADE`, `stage_id UUID FK`, `changed_at TIMESTAMPTZ DEFAULT now()`.
- [ ] `notes` tablosunu oluştur:
  - `id UUID PK`, `application_id UUID FK ON DELETE CASCADE`, `content TEXT CHECK (char_length(content) <= 2000)`, `created_at`.
- [ ] `notifications_log` tablosunu oluştur (bildirim izleme için):
  - `id UUID PK`, `user_id UUID FK`, `application_id UUID FK`, `notification_type TEXT`, `sent_at TIMESTAMPTZ`, `opened BOOLEAN DEFAULT false`.
- [ ] Performans için indeksler oluştur:
  - `CREATE INDEX idx_applications_user_id ON applications(user_id) WHERE deleted_at IS NULL;`
  - `CREATE INDEX idx_applications_source_url ON applications(user_id, source_url) WHERE deleted_at IS NULL;` (tekrar uyarısı için)
  - `CREATE INDEX idx_stage_history_app_id ON stage_history(application_id);`
- [ ] `updated_at` kolonu için trigger fonksiyonu oluştur ve `applications` tablosuna bağla.

### 2.2 Satır Bazlı Erişim Kontrolü (RLS)

- [ ] `ALTER TABLE applications ENABLE ROW LEVEL SECURITY;`
- [ ] `CREATE POLICY "own_applications" ON applications FOR ALL USING (auth.uid() = user_id);`
- [ ] Aynı politikayı `stages` tablosuna uygula.
- [ ] `stage_history` ve `notes` için subquery politikaları: `application_id`'nin sahibi `auth.uid()` olmalı.
- [ ] `notifications_log` için: `auth.uid() = user_id`.
- [ ] RLS testleri yaz: İki farklı kullanıcı oluştur, birinin diğerinin verilerine erişemediğini doğrula.

### 2.3 Varsayılan Veri (Seed)

- [ ] Yeni kullanıcı kaydında `stages` tablosuna 6 varsayılan aşamayı ekleyen trigger fonksiyonu yaz:
  1. Başvuruldu (`#3B82F6`, order=1, is_default=true)
  2. İnsan Kaynakları Görüşmesi (`#8B5CF6`, order=2)
  3. Teknik Mülakat (`#F59E0B`, order=3)
  4. Yönetici Görüşmesi (`#EC4899`, order=4)
  5. Teklif (`#059669`, order=5, is_terminal=true)
  6. Elenildi (`#6B7280`, order=6, is_terminal=true, is_default=true)
- [ ] `on_auth_user_created` trigger'ını `auth.users` tablosuna bağla.

### 2.4 Edge Function API Sözleşmesi

> Edge Functions `supabase/functions/<n>/index.ts` altında yazılır.

- [ ] `scrape-url` Edge Function iskeletini oluştur:
  - **Input:** `{ url: string }` + Bearer token.
  - **Output:** `{ company_name, position, location, platform, success: boolean, error?: string }`.
  - **Hedef süre:** < 2000ms sayfa getirme + < 200ms parse.
  - **Güvenlik:** Domain beyaz listesi (`kariyer.net`, `youthall.com`, `anbean.com`); diğerleri 400 döner.
- [ ] `check-duplicate` Edge Function iskeletini oluştur:
  - **Input:** `{ source_url: string }`.
  - **Output:** `{ is_duplicate: boolean, existing_application_id?: string }`.
- [ ] `send-inactivity-notifications` Scheduled Function iskeletini oluştur:
  - Her gün saat 10:00 TRT'de çalışır.
  - `applications.updated_at < now() - interval '14 days'` ve aşama terminal değil olanları bulur.
  - Expo Push Token ile bildirim gönderir.
  - `notifications_log`'a yazar.
- [ ] Her fonksiyon için `--no-verify-jwt` yerine JWT doğrulaması aktif bırakılsın.
- [ ] `supabase/functions/_shared/` altında domain whitelist ve Supabase admin client helper'ı oluştur.

### 2.5 Cron Job Kaydı

- [ ] Supabase Dashboard → Database → Cron Jobs bölümünde `send-inactivity-notifications`'ı günlük olarak zamanla.
- [ ] Zamanlamanın UTC olduğunu unutma: TRT 10:00 = UTC 07:00. Cron: `0 7 * * *`.

---

## Faz 3 — Sprint 1: Temel (Gün 3–21)

> Hedef: Kullanıcı kaydolabilir, başvuru ekleyebilir (manuel + otomatik), görsel tahtada görebilir, arşivde arayabilir.

### 3.1 Kimlik Doğrulama (F-01 → F-04) — Gün 3–5

#### Frontend

- [ ] `app/(auth)/_layout.tsx` içinde oturum yoksa `app/(auth)` yığınına yönlendiren koruma mantığı yaz.
- [ ] `app/(auth)/login.tsx` ekranı oluştur: email + şifre alanları, "Giriş yap" butonu, "Şifremi unuttum" ve "Kayıt ol" bağlantıları.
- [ ] `app/(auth)/signup.tsx` ekranı oluştur: email + şifre + şifre onayı.
- [ ] `app/(auth)/forgot-password.tsx` ekranı oluştur: email alanı → sıfırlama linki.
- [ ] Google ile giriş butonu ekle; `expo-auth-session/providers/google` kullan.
- [ ] `store/auth.ts` Zustand store oluştur: `session`, `user`, `loading`, `login()`, `logout()`, `signup()`.
- [ ] Oturum açıldığında `(tabs)` grubuna `router.replace` ile geçiş yap.
- [ ] Form hatalarını kırmızı `Toast` bileşeni ile göster (tasarım §8: 3 sn, alt kısım).
- [ ] Email doğrulama bekleyen kullanıcıya bilgilendirme ekranı.

#### Kabul Kriterleri (PRD §6)

- [ ] Email + şifre ile kayıt ve giriş çalışıyor.
- [ ] Google OAuth iOS ve Android'de ayrı ayrı çalışıyor.
- [ ] Şifre sıfırlama e-postası ulaşıyor ve link çalışıyor.
- [ ] Oturum 30 gün boyunca yenileniyor (refresh token).

### 3.2 Karşılama Akışı — Gün 6–8

- [ ] `app/(onboarding)/` grubunu oluştur ve 3 ekran ekle:
  - [ ] `welcome.tsx`: "Başvurularını Excel'e yazmayı bırak."
  - [ ] `platforms.tsx`: Desteklenen platformlar (Kariyer.net, LinkedIn, Youthall, Anbean).
  - [ ] `privacy.tsx`: "Bildirimlerinde şirket adı görünmez."
- [ ] Her ekranda "Atla" butonu sağ üst köşede; "Devam" butonu altta.
- [ ] `AsyncStorage` ile `hasSeenOnboarding` bayrağını sakla.
- [ ] Son ekranda "İlk başvurunu ekle" butonu → doğrudan manuel ekleme formuna yönlendirir.

### 3.3 Manuel Başvuru Ekleme (F-10) — Gün 9–10

#### Frontend

- [ ] `app/application/new.tsx` formunu oluştur.
- [ ] Alanlar: Şirket adı (zorunlu), pozisyon (zorunlu), platform (seçmeli: LinkedIn/Kariyer.net/Youthall/Anbean/Diğer), lokasyon (opsiyonel), ilan URL (opsiyonel), başvuru tarihi (opsiyonel, varsayılan bugün).
- [ ] Kaydet butonu: Supabase'e `applications` tablosuna insert. Default `current_stage_id` = "Başvuruldu" aşamasının ID'si.
- [ ] `store/applications.ts` Zustand store'u oluştur: `applications`, `fetchAll()`, `create()`, `update()`, `softDelete()`.
- [ ] Form 10 saniyeden kısa sürede doldurulabilir olmalı (kullanıcı testi).
- [ ] Hata durumunda Toast ile bilgilendir.

#### Kabul Kriterleri

- [ ] Şirket adı ve pozisyon zorunlu; boşken "Kaydet" butonu devre dışı.
- [ ] Kaydet sonrası kart görsel tahtada "Başvuruldu" sütununda görünür.

### 3.4 Otomatik Bilgi Çekme — KAPSAM DIŞI

> Faz 0.2 sonucu (🔴 Kırmızı senaryo): MVP'den çıkarıldı. v2'de proxy servisi veya resmi API ile yeniden değerlendirilecek. Bu adımda planlanan tüm görevler iptal edildi; kazanılan zaman Faz 3.3 Manuel Ekleme akışının kullanıcı deneyimini güçlendirmek için harcanacak.

### 3.5 Görsel Takip Tahtası (F-18 → F-21) — Gün 15–18

- [ ] `app/(tabs)/kanban.tsx` ekranını oluştur.
- [ ] Yatay kaydırma (FlatList horizontal) ile sütunlar; her sütun bir aşama.
- [ ] Her sütun içinde dikey FlatList ile başvuru kartları.
- [ ] Kart bileşeni `components/ApplicationCard.tsx`:
  - Şirket adı (kalın, 17pt)
  - Pozisyon (14pt)
  - Platform renk noktası (§8 renk sistemi)
  - Göreli tarih (`date-fns` `formatDistanceToNow`, tr locale)
- [ ] Kart min yükseklik 80pt (erişilebilirlik).
- [ ] `react-native-draggable-flatlist` veya Reanimated ile sürükle-bırak aşamalar arası.
- [ ] Sürüklerken `Haptics.impactAsync(Heavy)` ile dokunsal geri bildirim.
- [ ] Bırakıldığında `applications.current_stage_id` güncelle + `stage_history` tablosuna kayıt ekle.
- [ ] Uzun basma (LongPress) ile hızlı menü aç: "Aşama değiştir", "Sil", "Detaya git".
- [ ] Boş tahta durumu: Maskot + "İlk başvurunu ekle" butonu (§8 boş ekran kuralı).

#### Kabul Kriterleri

- [ ] 50 kartla tahta 2 saniye içinde açılır.
- [ ] Tüm aşama kombinasyonları arasında sürükle-bırak çalışır.
- [ ] Aşama değişikliği anında veritabanına yazılır.
- [ ] `stage_history` her değişiklikte kayıt tutar.

### 3.6 Başvuru Arşivi — İlk Sürüm (F-22, F-23) — Gün 19–21

- [ ] `app/(tabs)/archive.tsx` ekranını oluştur.
- [ ] Tüm başvuruları `applied_at DESC` sırasıyla listele.
- [ ] Üst kısımda arama çubuğu: Şirket adı ve pozisyonda anlık (debounce 300ms) filtreleme.
- [ ] Her satır: Şirket + pozisyon + aşama rozeti + platform noktası + göreli tarih.
- [ ] Satıra dokunma → `app/application/[id].tsx`'e derin bağlantı (bu ekran Sprint 2'de yazılacak, geçici iskelet koy).
- [ ] 100+ başvuruda arama anlık olmalı — gerekirse client-side filter.
- [ ] Boş arşiv durumu için §8 boş ekran.

#### Sprint 1 Çıkış Kriterleri

- [ ] Kullanıcı kaydolup giriş yapabiliyor.
- [ ] Manuel başvuru ekleyebiliyor.
- [ ] Görsel tahtada sürükle-bırak ile aşama değiştirebiliyor.
- [ ] Arşivde arama yapabiliyor.
- [ ] Tüm ekranlar iOS ve Android'de çökmeden çalışıyor.
- [ ] Sprint 1 sonunda iç TestFlight build'i alınıyor.

---

## Faz 4 — Sprint 2: Tamamlama (Gün 22–42)

### 4.1 Başvuru Detay Sayfası (F-06, F-27 → F-30) — Gün 22–28

- [ ] `app/application/[id].tsx` tam sayfayı yaz (Sprint 1 iskeletini değiştir).
- [ ] Üst bölüm: Şirket + pozisyon + platform noktası + aşama rozeti.
- [ ] Aşama değiştirme: Alt sayfa (bottom sheet) aç, aşamaları listele; tıklandığında güncelle + `stage_history`'e yaz.
- [ ] Notlar bölümü: Mevcut notları listele + yeni not ekleme TextArea (max 2000 karakter).
- [ ] Not düzenleme: Uzun basma → düzenle / sil.
- [ ] Aşama geçmişi bölümü: `stage_history` tablosundan zaman tünelle liste.
- [ ] İletişim kişisi alanı: Ad + telefon + email (opsiyonel) — `applications` tablosuna 3 yeni kolon ekle (migration 0002).
- [ ] "İlana git" butonu: `source_url` varsa `Linking.openURL`.
- [ ] Sağ üst köşede "Sil" butonu → onay dialogu (F-12, §4.2).

### 4.2 Başvuru Silme (F-12) — Gün 26–28 (paralel)

- [ ] Migration 0002'de `applications.deleted_at` kolonunun indekslerde filtre olarak kullanıldığını doğrula.
- [ ] `store/applications.ts` → `softDelete(id)` → `UPDATE applications SET deleted_at = now() WHERE id = ?`.
- [ ] Silme dialogu: "Bu işlem geri alınamaz. <Şirket> — <Pozisyon> başvurusu silinsin mi?" + İptal / Sil butonları.
- [ ] Silme sonrası kart görsel tahta ve arşivden anında kaybolur.
- [ ] Tüm sorgular (tahta, arşiv, analiz) `deleted_at IS NULL` filtresiyle yazılmalı.
- [ ] RLS politikası yumuşak silinmiş kayıtlara erişimi kısıtlamaz; frontend filtreler.

#### Kabul Kriterleri

- [ ] Silme seçeneği detay sayfasında ve uzun basma menüsünde bulunur.
- [ ] Onay dialogu gösterilir.
- [ ] Silinen başvuru anında görsel tahtadan ve arşivden kaybolur.
- [ ] Silinen başvuru elenme analizi hesabına girmez (Sprint 3'te doğrulanacak).

### 4.3 Özelleştirilebilir Aşamalar (F-16) — Gün 29–31

- [ ] `app/(tabs)/settings.tsx` altında "Aşamaları Yönet" ekranı ekle.
- [ ] Mevcut aşamaları sürükle-bırak ile sıralama (`order` kolonu güncellenir).
- [ ] "Aşama ekle" butonu: Ad + renk seçici + terminal mi? alanları.
- [ ] Aşama yeniden adlandırma: Satırın yanındaki kalem ikonu.
- [ ] Aşama silme: Sadece `is_default = false` olanlar silinebilir. Silmeden önce "Bu aşamada X başvurun var — hangi aşamaya taşıyalım?" onayı.
- [ ] Varsayılan aşamalar yeniden adlandırılabilir ama silinemez (UI'da silme butonu devre dışı).

### 4.4 Arşiv Filtreleri (F-24, F-25, F-26) — Gün 32–33

- [ ] `app/(tabs)/archive.tsx`'e üst kısımda filtre çubuğu ekle.
- [ ] Platform filtresi: Çoklu seçim chip'leri (LinkedIn, Kariyer.net, Youthall, Anbean, Diğer).
- [ ] Aşama filtresi: Tüm aşamalar + "Sadece aktifler" kısayolu (terminal olmayanlar).
- [ ] Tarih sıralaması: En yeni / en eski / şirket adı alfabetik.
- [ ] Filtreler `store/filters.ts` Zustand store'unda tutulur.

### 4.5 Gösterge Paneli — Metrik Kartları (F-31) — Gün 34–36

- [ ] `app/(tabs)/dashboard.tsx` ekranı.
- [ ] Üst karşılama mesajı: Dinamik — "Bu hafta <n> başvuru, <m>'i mülakata geçti."
- [ ] 4 metrik kartı grid düzeninde:
  - Toplam aktif başvuru
  - Yanıt bekleyen (Başvuruldu aşamasında > 3 gün)
  - Mülakat aşamasında
  - Alınan teklif
- [ ] Kart tıklanınca ilgili filtrelenmiş arşive git (derin bağlantı).

### 4.6 Gösterge Paneli — Aşama Dağılımı Grafiği (F-32) — Gün 37–38

- [ ] `react-native-svg` + `victory-native` kur.
- [ ] Yatay çubuk grafik: Her aşamada kaç başvuru var.
- [ ] Platform bazlı pasta grafik (ikincil): Hangi platformdan kaç başvuru.
- [ ] Boş durum: "5 başvuru eklediğinde grafikler canlanacak."

### 4.7 Tasarım Cilası — Boş ve Yükleme Ekranları — Gün 39–42

- [ ] `components/EmptyState.tsx` standart bileşeni oluştur: ikon + başlık + açıklama + yönlendirici buton.
- [ ] Tüm boş ekranlarda bu bileşeni kullan (tahta, arşiv, detay, analiz, gösterge).
- [ ] `components/Skeleton.tsx`: İskelet yükleme animasyonu (kart formu).
- [ ] Tüm yükleme durumlarında döner simge yerine skeleton kullan.
- [ ] Hata Toast bileşenini tüm ekranlarda tutarlı uygula.

#### Sprint 2 Çıkış Kriterleri

- [ ] Başvuru detayı tamamen çalışıyor (notlar, aşama geçmişi, iletişim).
- [ ] Kullanıcı aşama ekleyip silebiliyor.
- [ ] Gösterge paneli metrikleri ve grafikleri doğru.
- [ ] Tüm boş / yükleme / hata durumları tasarım sistemine uygun.

---

## Faz 5 — Sprint 3: Etkileşim (Gün 43–56)

### 5.1 Elenme Analizi Ekranı — Aşamalı Açılım (F-33) — Gün 43–46

- [ ] `app/(tabs)/analysis.tsx` ekranı.
- [ ] `store/analytics.ts`'te başvuru sayısına göre üç mod hesapla: 0–4 / 5–9 / 10+.
- [ ] **Mod 1 (0–4 başvuru):** Bilgilendirici boş ekran — "Henüz örüntü oluşmadı. Her başvuru bu ekranı zenginleştirir. <n>/5 başvuru."
- [ ] **Mod 2 (5–9 başvuru):** Basit aşama dağılımı grafiği + "Daha fazla veri için 5 başvuru daha ekle."
- [ ] **Mod 3 (10+ başvuru):** Tam elenme hunisi:
  - Her aşamadan bir sonrakine geçiş oranı (%)
  - Her aşamada elenen sayısı (terminal "Elenildi" dışında kalan)
  - Ortalama aşamada kalma süresi (gün)
- [ ] Platform bazlı başarı oranı (F-34, Olsa İyi): Hangi platformdan başvurularda teklif oranı daha yüksek.
- [ ] Silinen başvurular analizden dışlanır (`deleted_at IS NULL`).

#### Kabul Kriterleri

- [ ] 0–4 başvuruda bilgilendirici mesaj gösterilir.
- [ ] 5–9 başvuruda aşama dağılımı görünür.
- [ ] 10+ başvuruda tam elenme hunisi görünür.
- [ ] Silinen başvurular hesabın dışında.

### 5.2 Bildirim Altyapısı — Gün 47–49

#### Frontend

- [ ] `expo-notifications` ile izin akışı; ilk açılışta sorulmaz, kullanıcı ayarlardan aktive eder.
- [ ] `lib/push.ts`: Push token al, Supabase `profiles` tablosuna yaz (migration 0003 ile `profiles` tablosunu oluştur: `user_id, expo_push_token, notifications_enabled, notification_hours_start, notification_hours_end`).
- [ ] Uygulama derin bağlantı: `applyze://application/:id` bildirimden açılınca detaya gitsin.
- [ ] iOS için `UNNotificationContent` başlık = "Applyze", gövde = "Hatırlatıcın var" (şirket adı yok).
- [ ] Android için bildirim kanalı oluştur: `reminders`, önem seviyesi `default`, önizleme gizli.

#### Backend

- [ ] `send-inactivity-notifications` Edge Function'ı tamamla:
  - `updated_at < now() - interval '14 days'` ve terminal olmayan aşamadaki başvuruları bul.
  - Kullanıcının `notifications_enabled = true` olmasını kontrol et.
  - Saat aralığını (`notification_hours_start` – `notification_hours_end`) kontrol et.
  - Günde kullanıcı başına en fazla 1 bildirim (`notifications_log`'a bak).
  - Expo Push API'ye POST isteği at.
  - `notifications_log`'a kayıt düş.

#### Kabul Kriterleri

- [ ] Test bildirimi iOS ve Android'e ulaşıyor.
- [ ] Kilit ekranı önizlemesinde şirket adı GÖRÜNMÜYOR (3/3 test kullanıcısında doğrulama).
- [ ] 14 günlük başvuru ile cron tetiklendiğinde bildirim gidiyor.
- [ ] Günlük maksimum 1 bildirim limiti çalışıyor.
- [ ] Bildirim tıklanınca doğru başvuru detayı açılıyor.

### 5.3 Bildirim Ayarları (F-37) — Gün 50

- [ ] `app/(tabs)/settings.tsx`'e "Bildirimler" bölümü ekle.
- [ ] Açma/kapama switch'i → `profiles.notifications_enabled`.
- [ ] Saat aralığı seçici: iki `DateTimePicker` (09:00–21:00 varsayılan).
- [ ] Değişiklik anında Supabase'e yazılır.

### 5.4 Tekrarlayan Başvuru Uyarısı (F-13) — Gün 51–52

- [ ] `app/application/new.tsx`'te URL alanına her girişte debounced olarak `check-duplicate` Edge Function'ı çağır.
- [ ] `is_duplicate = true` ise modal göster: "Bu ilana <n> gün önce başvurmuştun. Yine eklemek istiyor musun?"
- [ ] "Evet, ekle" / "Mevcut başvuruma git" butonları.
- [ ] "Mevcut başvuruma git" → `app/application/[existing_id].tsx`.
- [ ] Engellenmez, sadece uyarılır (PRD §5 FR-10).

### 5.5 Tasarım Cilası — Animasyon ve Dokunsal Geri Bildirim — Gün 53–56

- [ ] Sürükle-bırak sırasında `Haptics.impactAsync(Medium)` — başlangıçta.
- [ ] Bırakma anında `Haptics.notificationAsync(Success)`.
- [ ] Ekran geçişlerinde yumuşak `fade + slide` animasyonu (Reanimated `withTiming`).
- [ ] Buton basma ölçek animasyonu (`scale: 0.96` → `1`).
- [ ] Boş ekranlarda yumuşak fade-in animasyonu.
- [ ] iOS'ta iOS dili, Android'de Material 3 bileşenleri (Platform.select ile).
- [ ] Minimum 44pt dokunma hedefi tüm bileşenlerde doğrulanır.

#### Sprint 3 Çıkış Kriterleri

- [ ] Elenme analizi üç modda da doğru çalışıyor.
- [ ] Bildirimler gizlilik öncelikli biçimde iOS + Android'e ulaşıyor.
- [ ] Tekrarlayan URL uyarısı doğru tetikleniyor.
- [ ] Uygulama native hissettiriyor (dokunsal + animasyon + platform uyumu).

---

## Faz 6 — Sprint 4: Test ve Yayına Alım (Gün 57–70)

### 6.1 Kapalı Beta (Gün 57–59)

- [ ] 10–15 beta kullanıcısı listesi oluştur (birincil persona profiline uygun — 22–27 yaş yeni mezunlar).
- [ ] TestFlight'a beta build gönder: `eas build --platform ios --profile preview`.
- [ ] Google Play dahili test kanalına build gönder: `eas build --platform android --profile preview`.
- [ ] Beta geri bildirim formu (Google Forms veya Typeform): Kullanılabilirlik, hata raporu, öneri.
- [ ] Amplitude'da beta grup etkinliklerini izle: Ekran görüntülenme, özellik kullanımı.
- [ ] 7 gün boyunca çökme ve ciddi hata toplandığı özel Slack/Discord kanalı aç.

### 6.2 Kritik Hata Düzeltme (Gün 60–62)

- [ ] Toplanan hataları GitHub Issues'a öncelikle etiketle: `P0` (çökme/veri kaybı), `P1` (özellik kırık), `P2` (görsel/UX).
- [ ] Tüm `P0` hataları kapat (0 tolerans).
- [ ] `P1` hataların en az %80'ini kapat.
- [ ] Tüm hata düzeltmeleri için regresyon testi yaz (Jest).
- [ ] Yeni build beta kullanıcılarına dağıt, son onayı al.

### 6.3 App Store Varlıkları (Gün 63–64)

- [ ] Uygulama ikonu final sürümü (1024x1024, no alpha).
- [ ] iOS ekran görüntüleri (6.7", 6.5", 5.5"): 5 adet — Tahta, Ekleme, Analiz, Gösterge, Ayarlar.
- [ ] App Store açıklaması (Türkçe): 4000 karakter sınırı. Launch mesajını kullan: "Başvurularını Excel'e yazmayı bırak."
- [ ] Anahtar kelimeler: "iş takip, başvuru, kariyer, iş arama, kariyer.net, youthall".
- [ ] Gizlilik politikası ve kullanım şartları URL'leri (Notion/GitHub Pages'te barındır).
- [ ] Gizlilik beyanı (App Store Connect "App Privacy"): Toplanan veriler Amplitude anonim; şirket/pozisyon TOPLANMIYOR (PRD §9).
- [ ] Destek URL'si: `support@applyze.app` veya bir basit form sayfası.
- [ ] App Store Connect'e metadata ve ekran görüntülerini yükle.

### 6.4 Google Play Varlıkları (Gün 65–66)

- [ ] Adaptive icon (512x512).
- [ ] Feature graphic (1024x500).
- [ ] Android ekran görüntüleri (aynı 5 ekran).
- [ ] Play Console açıklama ve kısa açıklama (Türkçe).
- [ ] Data Safety formu: Aynı gizlilik beyanı.
- [ ] İçerik derecelendirmesi anketi: Tüm yaşlar.
- [ ] Play Console'a yükle.

### 6.5 Production Build ve Gönderim (Gün 67–68)

- [ ] Versiyon numarasını `1.0.0` yap, build sayısını `1`.
- [ ] `eas build --platform ios --profile production` → TestFlight'a yükle.
- [ ] App Store Connect'te "Submit for Review" gönder.
- [ ] `eas build --platform android --profile production` → Google Play'e yükle.
- [ ] Play Console'da "Production" kanalına gönder (dahili test sonrası).
- [ ] Production Supabase projesinin (`applyze-prod`) ücretsiz limitlerinin yeterli olduğunu doğrula; gerekirse Pro plana ($25/ay) geç.
- [ ] Production ortam değişkenlerini EAS secrets ile yönet: `eas secret:create`.

### 6.6 Yayın İnceleme ve Küçük Düzeltmeler (Gün 69–70)

- [ ] App Store inceleme 1–7 gün sürer — metadata reddi için hazır düzeltmeler: gizlilik, izinler, açıklama.
- [ ] Red alınırsa 24 saat içinde düzelt ve yeniden gönder.
- [ ] Google Play genellikle daha hızlı (24–48 saat).
- [ ] Onay alındığında production sürümü manuel olarak yayına al.

### 6.7 Yayın Kabul Kontrol Listesi (PRD §12)

#### Fonksiyonel

- [ ] Email kayıt ve giriş çalışıyor.
- [ ] Google OAuth iOS + Android'de çalışıyor.
- [ ] Manuel ekleme çalışıyor.
- [ ] 10+ başvuruda görsel tahta akıcı.
- [ ] Sürükle-bırak tüm kombinasyonlarda çalışıyor.
- [ ] Arşiv araması anlık.
- [ ] Gösterge metrikleri doğru.
- [ ] Push bildirim iOS + Android'de ulaşıyor.
- [ ] Bildirim önizlemesi şirket adı içermiyor (kilitli ekran testi).
- [ ] Tekrarlayan URL uyarısı tetikleniyor.
- [ ] Silme onay dialogu gösteriliyor.
- [ ] Silinen başvuru analizden çıkıyor.
- [ ] Elenme analizi 0/5/10 eşiklerinde doğru içerik gösteriyor.

#### Performans

- [ ] 50 kartla tahta < 2 sn açılıyor.
- [ ] Soğuk başlangıç < 3 sn.
- [ ] Beta 7 gün çökmesiz.

#### Kullanıcı Deneyimi

- [ ] 5 yeni kullanıcı 5 dakikada ilk başvurusunu ekleyebiliyor.
- [ ] 3/3 test kullanıcısı bildirim önizlemesinden içerik anlayamıyor.
- [ ] Beta kullanıcılarının %50'si 7. günde hâlâ aktif.

---

## Faz 7 — Yayın Sonrası İzleme

### 7.1 İlk 7 Gün (Launch + 1)

- [ ] Amplitude dashboard: Edinim hunisi (indirme → kayıt → ilk başvuru).
- [ ] Çökme oranı izleme (hedef < %0.5). Sentry veya Expo crash reports.
- [ ] Supabase veritabanı yükü: Sorgu süresi, satır sayısı.
- [ ] Edge Function başarı oranı: Scrape + check-duplicate + send-inactivity-notifications.
- [ ] App Store ve Google Play yorumlarını günlük takip et.

### 7.2 İlk 30 Gün

- [ ] 7. gün aktiflik metriği (hedef > %50).
- [ ] 30. gün aktiflik metriği (hedef > %30).
- [ ] Başvuru başına kullanıcı (hedef aylık 8+).
- [ ] Bildirim açılma oranı (hedef > %30).

### 7.3 İlk 500 Kullanıcı

- [ ] Kullanıcı görüşmeleri: 10–15 kişiyle (birincil + ikincil persona karışık).
- [ ] Persona hipotezlerini doğrula/revize et (PRD §3 "Etiket: Hipotez" → "Araştırmaya dayalı").
- [ ] Pazar verilerini birincil kaynaklarla doğrula (MVP §3 "Hipotez" etiketleri).
- [ ] Monetizasyon modeli için sinyal topla (Freemium vs abonelik vs tek seferlik).
- [ ] v2 yol haritası taslağı: LinkedIn resmi API, AI tavsiye, web sürümü.

---

## Ek A — Görev Bağımlılıkları (Kritik Yol)

1. ~~Faz 0.2 (Uygunluk araştırması) → Faz 3.4 (Otomatik bilgi çekme)~~ — Tamamlandı, Faz 3.4 iptal edildi
2. **Faz 0.1 (Apple Developer)** → Faz 6.5 (iOS production build)
3. **Faz 2 (Şema + RLS)** → Tüm Faz 3+ görevleri
4. **Faz 3.1 (Auth)** → Faz 3.3+ (Tüm başvuru görevleri)
5. **Faz 3.5 (Görsel tahta)** → Faz 4.2 (Silme — tahtadan kaybolma testi)
6. **Faz 5.2 (Bildirim altyapısı)** → Faz 5.3, 5.4, 6.5
7. **Faz 6.1 (Beta) → Faz 6.2 (Hata düzeltme) → Faz 6.5 (Production)**

## Ek C — Sprint 2'ye Devredilen Frontend Görevleri

> 14 Mayıs 2026 smoke test sonucu tespit edildi. Backend tüm fonksiyonlarıyla canlıdır; frontend bağlanması Sprint 2'ye devredildi.

### Tespit edilen UI bug'ları
- [ ] Detay sayfası: sol-üst `<` geri butonu çalışmıyor (onPress handler yok)
- [ ] Detay sayfası: sağ-üst `⋯` menüsü açılmıyor (onPress handler yok)
- [ ] Liste sayfası: kart üzerinde uzun basma menüsü yok

### Henüz frontend'e bağlanmamış backend fonksiyonları
- [ ] Başvuru silme akışı: backend destekli (`deleted_at` kolonu + RLS), frontend UI eksik
- [ ] `check-duplicate` Edge Function çağrısı: yeni başvuru formundaki URL alanına onChange ile bağlanacak
- [ ] Push token kaydetme: `expo-notifications` ile token al, `profiles.expo_push_token` alanına yaz
- [ ] Bildirim ayarları ekranı: on/off switch + saat aralığı (`notification_hours_start/end`)
- [ ] Tekrarlayan başvuru uyarısı modalı: `check-duplicate` cevabıyla tetiklenecek

### Doğrulanmış çalışan akışlar (Mayıs 2026 smoke test)
- ✅ Auth (email + şifre login)
- ✅ Başvuru CRUD (create + read + stage update + note add)
- ✅ RLS izolasyonu

---

## Ek B — Kapsam Dışı (Bu Plana Dahil Değil)

> Yeni istek geldiğinde ilk soru: "Bu olmadan kullanıcı değer alamaz mı?" Cevap "alabilir" ise geride bekler, MVP'ye eklenmez.

- LinkedIn otomatik bilgi çekme (v2)
- İlan toplama (v3)
- Web uygulaması (v2)
- AI tavsiye (v2)
- Seri/streak sistemi (kalıcı red)
- Sosyal özellikler (v3)
- CV oluşturucu (bağımsız ürün)
- Tam çevrimdışı destek (v2)

---

*Applyze plan.md — v1.1 | PRD v2.0 ve MVP Kapsam v2.0 temel alınarak hazırlandı.*
