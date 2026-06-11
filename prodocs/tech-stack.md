# Tech Stack & AI Kullanımı — Applyze

Bu doküman; kullanılan teknolojileri, **neden** seçildiklerini ve geliştirme sürecinde **yapay zekânın nasıl kullanıldığını** anlatır.

> ⚙️ **Platform:** MVP **web** olarak canlıdadır (applyze.vercel.app). Kod tabanı (Expo/React Native) tek çatıdan web + mobili hedefler; **mobil (iOS/Android) mağaza yayını v2'ye ertelenmiştir.** Bu doküman mevcut web teslimini esas alır.

---

## 1. Mimari Genel Bakış

Applyze, frontend ve backend'i birbirinden tamamen ayrılmış bir uygulamadır. Backend, platformdan bağımsız bir **API katmanıdır**: bugün web istemcisine, yarın mobil uygulamaya aynı uçları sunar.

```
┌─────────────────────────────┐
│  Frontend — Expo (RN)        │   Web (Vercel, MVP) + Mobil (v2, aynı kod tabanı)
│  Expo Router · TypeScript     │
└───────────────┬─────────────┘
                │ HTTPS + giriş token'ı (Bearer)
                ▼
┌─────────────────────────────┐
│  Backend — Supabase          │
│  • Postgres + RLS            │   veri & güvenlik
│  • Auth (e-posta + Google)   │   kimlik
│  • Edge Functions (Deno)     │   API katmanı / AI köprüsü
│  • Storage (CV PDF)          │   dosya
│  • pg_cron                   │   zamanlanmış işler
└───────────────┬─────────────┘
                │ sunucu tarafı, anahtar gizli
                ▼
┌─────────────────────────────┐
│  Google Gemini API           │   AI çekirdek mantık
└─────────────────────────────┘
```

---

## 2. Frontend

| Teknoloji | Sürüm | Neden seçildi |
|---|---|---|
| **Expo (React Native)** | SDK 54 / RN 0.81 / React 19 | Tek kod tabanından hem **web (MVP)** hem **iOS/Android (v2)**. Bitirme için web yeterli; mobil yol haritası tek komutla açık kalsın istedik. |
| **Expo Router** | 6 | Dosya tabanlı yönlendirme + `typedRoutes` ile tip güvenliği. |
| **TypeScript** | 5 | Tip güvenliği; AI ile üretilen kodun hatalarını derleme anında yakalamak. |
| **NativeWind + Tailwind** | 4 / 3.4 | Tutarlı, hızlı stillendirme; tasarım sistemini kolay uygulamak. |
| **react-native-svg** | 15 | Pusula ikonu ve huni/illüstrasyonlar. |
| **expo-document-picker + xlsx** | — | CV (PDF) yükleme ve Excel/CSV toplu içe aktarma. |
| **expo-secure-store** | — | Küçük yerel durum (native); web'de localStorage. |
| **expo-web-browser / expo-linking** | — | Google OAuth ve harici linkler. |

**Deploy (web — MVP):** Vercel — `npx expo export -p web` ile statik export, `dist` yayınlanır. Her `main` merge'i otomatik canlıya çıkar. Derin link/yenileme 404'ları `frontend/vercel.json` ile çözüldü (tüm rotalar `index.html`'e yönlendirilir).

**Deploy (mobil — v2):** Expo EAS Build → App Store + Google Play. Kod tabanı hazır; mağaza süreçleri v2 kapsamında.

---

## 3. Backend

**Supabase** tek çatı altında Postgres + Auth + Functions + Storage sunduğu, cömert bir ücretsiz katmanı olduğu ve **Row Level Security** ile veriyi kullanıcı bazında güvenceye aldığı için seçildi.

| Bileşen | Kullanım |
|---|---|
| **Postgres + RLS** | `applications`, `stages`, `stage_history`, `notes`, `profiles` tabloları. RLS ile her kullanıcı yalnız kendi verisine erişir. |
| **Auth** | E-posta + şifre ve **Google OAuth**. Üretim e-postaları için **custom SMTP**. |
| **Edge Functions (Deno/TypeScript)** | API katmanı: AI çağrıları + hesap silme + cron. İstemci asla doğrudan Gemini'ye gitmez. |
| **Storage** | CV PDF'leri (özel bucket + RLS). |
| **pg_cron** | Uzun süre sessiz kalan başvurular için bildirim adayı sorgusu (push gönderimi mobil v2). |

**Edge Functions:** `ai-suggestions` (Pusula), `analyze-fit` (CV↔ilan uyumu), `parse-job` (ilan→form), `extract-cv` (PDF metin), `delete-account`, `send-inactivity-notifications` (cron), `check-duplicate`.

**CORS:** Fonksiyonlar yalnız bilinen origin'lere izin verir (`applyze.vercel.app`, `il9u.com`, localhost). Asıl koruma yine `Authorization` token'ıdır.

---

## 4. Yapay Zekâ Katmanı

**Servis:** Google **Gemini** — `gemini-2.5-flash` (ana) + `gemini-2.5-flash-lite` (otomatik yedek). Hız/maliyet dengesi ve cömert ücretsiz katmanı nedeniyle seçildi.

**Nasıl entegre:** Tüm çağrılar Edge Function üzerinden yapılır → **API anahtarı sunucuda gizli kalır**. İstemci yalnız kendi giriş token'ıyla fonksiyonu çağırır.

**Nerede kullanılıyor (çekirdek mantık):**
1. **Pusula** — Frontend, gizliliğe uygun **sayısal teşhis** (huni oranları, darboğaz, güçlü alan/sektör, momentum) hesaplar; Gemini bunu yorumlayıp başlık + 3-4 somut öneri üretir.
2. **CV ↔ ilan uyumu** — CV PDF'i `inline_data` ile okunur, ilanla karşılaştırılır, uyum skoru + gerekçe döner.
3. **İlan → form** — İlan metni çözümlenip şirket/pozisyon/şehir/platform alanları otomatik doldurulur.

**Mühendislik kararları:**
- **Gizlilik:** AI'a şirket adı/kişisel not GÖNDERİLMEZ — yalnız oran, sayı, alan/sektör etiketi.
- `thinkingConfig.thinkingBudget: 0` — bu görevlerde gereksiz düşünme token'ı çıktı bütçesini yemesin diye kapatıldı (boş yanıt sorununu çözdü).
- **Önbellek:** Öneriler veri değişmedikçe yeniden üretilmez (24 saat) → ücretsiz kota korunur, maliyet düşer.
- **Dayanıklılık:** Ana model boş/hata dönerse yedek modele düşülür; kota dolduğunda kullanıcıya doğru mesaj gösterilir.

---

## 5. Alan Adı & E-posta

- **il9u.com** — Cloudflare Registrar (kayıt + DNS).
- **Resend** — üretim kimlik e-postaları (onay, şifre sıfırlama) `noreply@il9u.com`'dan; SPF/DKIM doğrulu. Supabase'in varsayılan "saatte 2 mail" sınırı bu sayede aşıldı.
- **Cloudflare Email Routing** — `support@il9u.com` → gerçek gelen kutusuna yönlendirme (iletişim adresi).

---

## 6. Geliştirme Sürecinde AI Kullanımı

Applyze, baştan sona **AI destekli bir geliştirme akışıyla** üretildi. AI bir "kod tamamlayıcı"dan fazlası olarak; mimari, hata ayıklama ve karar verme ortağı olarak kullanıldı.

**Kullanılan araçlar:** AI kodlama asistanı (sohbet + repo erişimi), VS Code, Supabase CLI, Git/GitHub, Vercel.

**AI'ın katkıda bulunduğu başlıca alanlar:**
- **Ürün & plan:** PRD, kapsam ve teknik planın taslaklanması; özelliklerin kullanıcı hikâyelerine bölünmesi.
- **Kod üretimi:** Ekranlar, veri katmanı, Edge Function'lar ve SQL migration'ların büyük kısmı AI ile yazıldı, sonra gözden geçirilip rafine edildi.
- **Hata ayıklama (en değerli kısım):** Gerçek üretim sorunları AI ile teşhis edildi ve çözüldü — örnekler:
  - Vercel'de derin link **404** → SPA fallback (`vercel.json`).
  - Gemini **429 kota** hatası → log analizi + önbellek + doğru hata mesajı.
  - **CORS** sertleştirme + Supabase CLI ile fonksiyon deploy.
  - Kayıt akışında "zaten hesabın var" durumunun yakalanması (Supabase'in `identities` davranışı).
  - Custom SMTP (domain + Resend + DNS) kurulumu.
- **Karar verme:** Ücretsiz katman mı/faturalandırma mı, hangi domain stratejisi, **mobil yayını v2'ye erteleme** ve CORS'un gerçek risk değeri gibi konularda seçenekler AI ile tartışılıp **bilinçli** kararlar verildi.

**AI destekli geliştirici olarak yaklaşım:** AI'ın ürettiği her çıktı körlemesine kabul edilmedi; tip kontrolü, test ve gerçek ortamda doğrulama ile süzüldü. Karar her zaman geliştiricide kaldı; AI hızı ve kapsamı artırdı.

---

## 7. Özet Tablo

| Katman | Teknoloji |
|---|---|
| Frontend | Expo (RN) · Expo Router · TypeScript · NativeWind |
| Backend | Supabase (Postgres + RLS · Auth · Edge Functions/Deno · Storage · pg_cron) |
| AI | Google Gemini 2.5-flash / flash-lite |
| Deploy | Vercel (web — MVP) · Supabase CLI (functions) · EAS (mobil — v2) |
| Altyapı | Cloudflare (domain/DNS/email routing) · Resend (SMTP) |
