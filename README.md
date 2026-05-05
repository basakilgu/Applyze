<div align="center">

# Applyze

**Kariyer pusulası.**  
Başvurularını sadece kayıt altına alma — yönünü gör.

</div>

<table align="center">
<tr>
<td><img src="docs/screenshots/03-onboarding-pusula.jpg" width="240" /></td>
<td><img src="docs/screenshots/05-dashboard-hero.jpg" width="240" /></td>
<td><img src="docs/screenshots/14-profile-hero.jpg" width="240" /></td>
</tr>
</table>

---

## Mevcut Durum

Bu repo şu anda **tasarım ve frontend demosu** olarak çalışıyor. Tüm ekranlar mock veriyle render ediliyor; backend, kimlik doğrulama ve otomatik bilgi çekme henüz bağlı değil.

| Katman | Durum |
|--------|-------|
| Tasarım sistemi (Yüz A / Yüz B + pusula sembolü) | ✅ Tamamlandı |
| Onboarding (3 ekran), Liste, Özet, Profil ekranları | ✅ Tamamlandı (mock veriyle) |
| Detay, başvuru ekleme, düzenleme, not ekleme akışı | ✅ Frontend hazır |
| Aşama yönetimi ve ayarlar ekranları | ✅ Frontend hazır |
| Milestone (Bir An) ekranı | ✅ Tamamlandı |
| Backend (Supabase + RLS + Auth) | 🔄 Sonraki sprint |
| Otomatik bilgi çekme (Kariyer.net, Youthall, Anbean) | 🕐 Planlanan |
| Push bildirim ve elenme analizi | 🕐 Planlanan |

---

## Neden Applyze?

Mevcut iş takip araçları (Huntr, Teal, Simplify) Türk platformlarını desteklemiyor. Applyze bu boşluğu üç temel farklılaştırıcıyla kapatıyor:

- **Yerel platform desteği** — Kariyer.net, Youthall, Anbean için link yapıştır, otomatik doldur
- **Elenme analizi** — Hangi aşamada takıldığını gösteren içgörü ekranı
- **Gizlilik öncelikli bildirimler** — Kilit ekranında şirket adı görünmez

Hedef kullanıcı: 22-27 yaş, aktif iş arayan yeni mezunlar ve çalışırken kariyer değişikliği arayan profesyoneller.

---

## Tasarım Dili

Applyze "ayna" felsefesiyle tasarlandı: kullanıcının verisini gösterir, kararı dayatmaz. İki "yüz" üzerine kuruldu:

### Yüz A — Çalışma yüzeyleri

Liste, detay, ayarlar gibi günlük ekranlar. Krem zemin (`#FAF8F4`), adaçayı yeşili aksanı (`#3D5A47`), Inter sans-serif. Linear ve Things 3 ilhamlı; veri yoğun ama dingin.

<table>
<tr>
<td align="center"><img src="docs/screenshots/05-dashboard-hero.jpg" width="220" /><br/><sub>Özet</sub></td>
<td align="center"><img src="docs/screenshots/08-list.jpg" width="220" /><br/><sub>Liste</sub></td>
<td align="center"><img src="docs/screenshots/09-detail-trendyol.jpg" width="220" /><br/><sub>Detay</sub></td>
</tr>
</table>

### Yüz B — Anlamlı an

Onboarding ve milestone gibi atmosferik ekranlar. Koyu zemin (`#1A2622`), italic editorial başlık (Inter Light Italic), pusula sembolü, vignette glow. Linear "Flows", Tiimo, Alan'dan ilham alındı.

<table>
<tr>
<td align="center"><img src="docs/screenshots/03-onboarding-pusula.jpg" width="220" /><br/><sub>Onboarding</sub></td>
<td align="center"><img src="docs/screenshots/13-milestone.jpg" width="220" /><br/><sub>Bir An</sub></td>
<td align="center"><img src="docs/screenshots/14-profile-hero.jpg" width="220" /><br/><sub>Profil</sub></td>
</tr>
</table>

### Görsel kimlik

Sembol: **pusula iğnesi** — sessiz bir araç. Kullanıcı reddedildiğinde "üzgün maskot" görmez; pusula sadece yön değiştirir. Tipografi tek aile: Inter Variable. Renk paleti: krem nötrler + adaçayı yeşili + her duruma "bilinçli olarak donuk" rozetler (özellikle red için soluk gül — psikolojik bakım).

---

## User Flow

İki ana akış: yeni kullanıcı yolculuğu (tek seferlik) ve günlük kullanım döngüsü.

![User Flow](docs/design/applyze_user_flow_v2.svg)

---

## Wireframe

Her kritik ekran component-component dökümante edildi. Her hotspot'un design system'deki karşılığı (token, ölçü, davranış) yanda etiketli.

![Wireframe](docs/design/applyze_wireframes_annotated.svg)

---

## Ekran Turu

### Açılış ve onboarding

<table>
<tr>
<td align="center"><img src="docs/screenshots/01-splash.jpg" width="200" /><br/><sub>Splash</sub></td>
<td align="center"><img src="docs/screenshots/02-login.jpg" width="200" /><br/><sub>Giriş</sub></td>
<td align="center"><img src="docs/screenshots/03-onboarding-pusula.jpg" width="200" /><br/><sub>Onboarding 1</sub></td>
<td align="center"><img src="docs/screenshots/04-onboarding-bildirim.jpg" width="200" /><br/><sub>Onboarding 3</sub></td>
</tr>
</table>

### Özet (Dashboard)

Pulse band ile günün özeti, üç metrik, yolun haritası, geri dönüş bekleyenler ve "Pusulan şunları söylüyor" akıllı öneri kartı (backend bağlandığında aktive olacak).

<table>
<tr>
<td><img src="docs/screenshots/05-dashboard-hero.jpg" width="220" /></td>
<td><img src="docs/screenshots/06-dashboard-pattern.jpg" width="220" /></td>
<td><img src="docs/screenshots/07-dashboard-suggestions.jpg" width="220" /></td>
</tr>
</table>

### Liste ve detay

Başvuruları platforma, aşamaya, favorilere göre filtrele. Detay ekranında süreç timeline'ı, notlar ve ilan kaynağı.

<table>
<tr>
<td align="center"><img src="docs/screenshots/08-list.jpg" width="200" /><br/><sub>Liste</sub></td>
<td align="center"><img src="docs/screenshots/09-detail-trendyol.jpg" width="200" /><br/><sub>Detay (LinkedIn)</sub></td>
<td align="center"><img src="docs/screenshots/10-detail-anbean.jpg" width="200" /><br/><sub>Detay (Anbean)</sub></td>
</tr>
</table>

### Etkileşimler

<table>
<tr>
<td align="center"><img src="docs/screenshots/11-note-add.jpg" width="200" /><br/><sub>Not ekle</sub></td>
<td align="center"><img src="docs/screenshots/12-application-actions.jpg" width="200" /><br/><sub>Düzenle / Sil</sub></td>
<td align="center"><img src="docs/screenshots/13-milestone.jpg" width="200" /><br/><sub>Bir An (mülakat)</sub></td>
</tr>
</table>

### Profil ve ayarlar

<table>
<tr>
<td><img src="docs/screenshots/14-profile-hero.jpg" width="220" /></td>
<td><img src="docs/screenshots/15-profile-settings.jpg" width="220" /></td>
</tr>
</table>

---

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Mobil framework | Expo (React Native) — iOS & Android |
| Stiller | NativeWind (Tailwind for React Native) |
| Tipler | TypeScript (strict mode) |
| Gezinme | Expo Router (file-based navigation) |
| Tasarım sistemi | Inter Variable Font + design system v3 token'ları |
| SVG ve pusula sembolü | react-native-svg |
| Backend *(planlanan)* | Supabase (PostgreSQL + RLS + Edge Functions) |
| Bildirimler *(planlanan)* | Expo Notifications + Supabase Cron |
| Analitik *(planlanan)* | Amplitude |
| Dağıtım *(planlanan)* | Expo EAS Build → App Store + Google Play |

---

## Çalıştırma

**Gereksinimler:** Node.js 18+, npm, [Expo Go](https://expo.dev/client) uygulaması (iOS veya Android telefonda).

```bash
git clone https://github.com/basakilgu/Applyze.git
cd Applyze/frontend
npm install
npx expo start
```

Terminalde QR kod çıkar. Telefondaki Expo Go uygulamasıyla okuttuğunuzda uygulama açılır. Mock veriyle çalışır — backend bağlantısı veya `.env` ayarı gerekmez.

---

## Proje Yapısı

```
Applyze/
├── docs/
│   ├── design/                    # User flow + wireframe SVG'leri
│   └── screenshots/               # Uygulama ekran görüntüleri
├── frontend/                      # Expo (React Native) uygulaması
│   ├── app/
│   │   ├── (auth)/                # Giriş ekranı
│   │   ├── (onboarding)/          # 3 ekranlı onboarding (Yüz B)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx          # Liste
│   │   │   ├── dashboard.tsx      # Özet
│   │   │   └── profile.tsx        # Profil
│   │   ├── application/           # Detay, yeni başvuru, düzenle
│   │   ├── settings/              # Bildirim ve aşama ayarları
│   │   └── milestone.tsx          # Bir An (Yüz B)
│   ├── components/ui/             # Card, Badge, Button, CompassMark, BottomSheet, ...
│   ├── lib/
│   │   └── mockData.ts            # Şu an demo verisi
│   ├── types/                     # TypeScript tipleri
│   └── tailwind.config.js         # Design system token'ları
├── backend/                       # Supabase yapılandırması (planlanan)
├── MVP_KAPSAM.md                  # MVP kapsam dokümanı
├── PRD.md                         # Ürün gereksinimleri dokümanı
└── plan.md                        # Geliştirme planı (10 hafta)
```

---

## Yol Haritası

| Sprint | Odak | Durum |
|--------|------|-------|
| Sprint 0 — Tasarım | Yüz A/B sistemi, pusula sembolü, tüm ekran tasarımları | ✅ Tamamlandı |
| Sprint 1 — Mock demo | Frontend'in mock veriyle çalışır hâle gelmesi | ✅ Tamamlandı *(bu repo)* |
| Sprint 2 — Backend | Supabase, RLS, kimlik doğrulama, başvuru CRUD | 🔄 Sonraki |
| Sprint 3 — Otomatik veri çekme | Kariyer.net / Youthall / Anbean parser | 🕐 Planlanan |
| Sprint 4 — Bildirim ve analiz | Push bildirim (gizlilik öncelikli), elenme analizi | 🕐 Planlanan |
| Sprint 5 — Yayına alma | App Store + Google Play | 🕐 Planlanan |

Detaylar için [`plan.md`](plan.md), [`MVP_KAPSAM.md`](MVP_KAPSAM.md) ve [`PRD.md`](PRD.md).

---

## Belgeler

- [`MVP_KAPSAM.md`](MVP_KAPSAM.md) — Ürün vizyonu, pazar analizi, MVP kapsamı, persona ve metrikler
- [`PRD.md`](PRD.md) — Ürün gereksinimleri, fonksiyonel ve fonksiyonel olmayan gereksinimler, veri modeli
- [`plan.md`](plan.md) — 10 haftalık geliştirme planı, sprint sprint görev listesi

---

## Katkı

Bu proje şu an tek geliştirici tarafından yürütülmektedir. Hata bildirimleri ve öneriler için [Issues](https://github.com/basakilgu/Applyze/issues) bölümünü kullanabilirsiniz.

### Dal Stratejisi

```
main        → kararlı, yayına hazır kod
develop     → aktif geliştirme
feature/*   → yeni özellikler
```

---

## Lisans

MIT

---

<div align="center">

*Applyze — Kariyer pusulası. v1.0 — Tasarım demosu.*

</div>
