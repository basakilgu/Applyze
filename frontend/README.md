# Applyze — Frontend v3

Türk iş arayanlar için kariyer pusulası — başvurularını organize et, örüntüleri gör, kendi yönünü bul.

## Hızlı başlangıç

Detaylı kurulum için **`KURULUM.md`** dosyasına bak.

```bash
npm install
npx expo start --clear
```

## Stack

- **Expo SDK 54** + **Expo Router v6** (file-based routing)
- **React Native 0.81** (New Architecture)
- **NativeWind v4** (Tailwind for React Native)
- **TypeScript** (strict)
- **Inter Variable** + **Menlo** (typography; Menlo iOS'a özgü, Android sistem monospace'ine düşer)
- **react-native-svg** (compass + icons)

## Ekranlar (toplam 17)

```
app/
├── index.tsx                      # Splash (1.8s)
├── (auth)/login.tsx               # Email login (kayıt + giriş + şifre sıfırlama)
├── (onboarding)/
│   ├── index.tsx                  # 1: "Sadece bir takipçi değil. Bir pusula."
│   ├── two.tsx                    # 2: "Hangi aşamada elendiğini gör."
│   └── three.tsx                  # 3: "Bildirimlerin sessiz."
├── (tabs)/
│   ├── _layout.tsx                # Native Expo Tabs
│   ├── dashboard.tsx              # Özet — 4 metrik + huni + bar + recent
│   ├── index.tsx                  # Liste — 9 başvuru, 5 filtre, arama
│   └── profile.tsx                # Profil — kimlik + ayarlar
├── application/
│   ├── [id].tsx                   # Detay — timeline + notlar + aksiyon bar
│   ├── new.tsx                    # Yeni başvuru — modal form
│   └── edit/[id].tsx              # Düzenle — danger zone
├── milestone.tsx                  # "İlk açılan kapı." (Yüz B)
└── settings/
    ├── notifications.tsx          # Bildirim ayarları
    └── stages.tsx                 # Aşama yönetimi
```

## Renk paleti

**Yüz A (Krem):** `#FAF8F4` `#F4F1EB` `#EBE7DF` `#D9D3C8`
**Yüz B (Karanlık):** `#1A2622` `#243530` `#1F1B16`
**Aksan (Sage):** `#3D5A47` `#7A9270` `#B8C9BD` `#E2E8D6`

## Brand prensipleri

- **Pusula sembolü:** 4 varyant (filled, outline, glow-light, glow-dark)
- **Editorial italic** başlıklar (`Inter_300Light_Italic`)
- **Menlo** sayısal/tarih bilgisi için
- **Sessiz bildirimler:** kilit ekranında şirket adı görünmez
- **Streak yok:** sürekli kullanım dayatılmaz, kariyer huzursuzluğu körüklenmez

## Veri katmanı

Uygulama Supabase'e bağlıdır. `lib/supabase.ts` client'ı `.env` içindeki
`EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY` değerlerinden kurar;
`lib/applications.ts` ise başvuru/aşama/not verisini Supabase üzerinden okuyup yazar.
Çalıştırmadan önce `.env.example`'ı kopyalayıp doldurun (`cp .env.example .env`).

## Lisans

MIT
