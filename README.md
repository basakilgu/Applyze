# Applyze

**Türkiye'deki iş arayanlar için başvuru takip ve kariyer analiz uygulaması.**

Kariyer.net, LinkedIn, Youthall ve Anbean gibi farklı platformlardaki başvurularını tek bir yerden takip et. Hangi aşamada elendiğini gör, stratejini geliştir.

---

## Neden Applyze?

Mevcut iş takip araçları (Huntr, Teal, Simplify) Türk platformlarını desteklemiyor. Applyze bu boşluğu kapatıyor:

- **Yerel platform desteği** — Kariyer.net, Youthall, Anbean için link yapıştır, otomatik doldur
- **Elenme analizi** — Hangi aşamada takıldığını gösteren içgörü ekranı
- **Gizlilik öncelikli bildirimler** — Kilit ekranında şirket adı görünmez

---

## Özellikler

| Özellik | Durum |
|---------|-------|
| Email ve Google ile giriş | ✅ Sprint 1 |
| Otomatik bilgi çekme (Kariyer.net, Youthall, Anbean) | ✅ Sprint 1 |
| Manuel başvuru ekleme | ✅ Sprint 1 |
| Görsel takip tahtası (sürükle-bırak) | ✅ Sprint 1 |
| Başvuru arşivi (arama + filtre) | ✅ Sprint 1 |
| Başvuru detayı ve notlar | 🔄 Sprint 2 |
| Özelleştirilebilir aşamalar | 🔄 Sprint 2 |
| Gösterge paneli | 🔄 Sprint 2 |
| Elenme analizi | 🔄 Sprint 3 |
| Gizlilik öncelikli bildirimler | 🔄 Sprint 3 |
| Tekrarlayan başvuru uyarısı | 🔄 Sprint 3 |

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Mobil | Expo (React Native) — iOS & Android |
| Backend & Auth | Supabase (PostgreSQL + RLS) |
| Otomatik bilgi çekme | Supabase Edge Functions (Deno) |
| Durum yönetimi | Zustand |
| Gezinme | Expo Router |
| Bildirimler | Expo Notifications + Supabase cron |
| Analitik | Amplitude |
| Dağıtım | Expo EAS Build |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- Expo CLI
- Supabase hesabı
- Apple Developer hesabı (iOS dağıtımı için)

### Adımlar

```bash
# Repoyu klonla
git clone https://github.com/kullaniciadi/applyze.git
cd applyze

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını Supabase bilgilerinle doldur

# Uygulamayı başlat
npx expo start
```

### Ortam Değişkenleri

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Veritabanı Kurulumu

Supabase projende aşağıdaki tabloları oluştur:

```sql
-- Kullanıcılar (Supabase Auth tarafından yönetilir)

-- Başvurular
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  platform TEXT,
  source_url TEXT,
  current_stage_id UUID,
  applied_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

-- Aşamalar
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  "order" INT,
  is_terminal BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false
);

-- Aşama geçmişi
CREATE TABLE stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES stages(id),
  changed_at TIMESTAMP DEFAULT now()
);

-- Notlar
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  content TEXT CHECK (char_length(content) <= 2000),
  created_at TIMESTAMP DEFAULT now()
);

-- Satır bazlı erişim kontrolü
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanicilar yalnizca kendi basvurularina erisebilir"
  ON applications FOR ALL USING (auth.uid() = user_id);

-- Diğer tablolara aynı politikayı uygula
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanicilar yalnizca kendi asamalarına erisebilir"
  ON stages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

---

## Proje Yapısı

```
applyze/
├── app/                    # Expo Router ekranları
│   ├── (auth)/             # Giriş ve kayıt ekranları
│   ├── (tabs)/             # Ana sekme ekranları
│   │   ├── dashboard.tsx   # Gösterge paneli
│   │   ├── kanban.tsx      # Görsel takip tahtası
│   │   ├── archive.tsx     # Arşiv
│   │   ├── analysis.tsx    # Elenme analizi
│   │   └── settings.tsx    # Ayarlar
│   └── application/        # Başvuru detay ekranı
├── components/             # Yeniden kullanılabilir bileşenler
├── store/                  # Zustand durum yönetimi
├── lib/                    # Supabase client ve yardımcılar
├── supabase/
│   └── functions/          # Edge Functions (otomatik bilgi çekme)
└── assets/                 # Görseller ve fontlar
```

---

## Katkı

Bu proje şu an tek geliştirici tarafından yürütülmektedir. Hata bildirimleri için Issues kullanabilirsin.

### Dal Stratejisi

```
main        → kararlı, yayına alınmış kod
develop     → aktif geliştirme
feature/*   → yeni özellikler
```

---

## Durum

🚧 **Aktif Geliştirme** — Sprint 1 devam ediyor.

Hedef yayın tarihi: Sprint 4 tamamlanması (10 hafta).

---

## Lisans

MIT

---

*Applyze — v1.0 geliştirme aşamasında*
