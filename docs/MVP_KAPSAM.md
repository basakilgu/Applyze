# Applyze — MVP Kapsam Dokümanı

**Versiyon:** v2.0  
**Tarih:** Nisan 2026  
**Süre:** 10 Hafta  
**Platform:** iOS & Android  

> Bu doküman ürünün ne olduğunu, neden yapıldığını ve nasıl yayına alınacağını açıklar.  
> Teknik detaylar (veri modeli, güvenlik, gereksinim listesi) için bkz. PRD v2.0

---

## İçindekiler

1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Problem ve Çözüm](#2-problem-ve-çözüm)
3. [Pazar Analizi](#3-pazar-analizi)
4. [Kullanıcı Profili](#4-kullanıcı-profili)
5. [MVP Kapsamı](#5-mvp-kapsamı)
6. [Sprint Planı](#6-sprint-planı-10-hafta)
7. [Başarı Metrikleri](#7-başarı-metrikleri)
8. [Risk Yönetimi](#8-risk-yönetimi)
9. [Günlük Kullanım Stratejisi](#9-günlük-kullanım-stratejisi)
10. [Monetizasyon Stratejisi](#10-monetizasyon-stratejisi)
11. [Pazara Çıkış Stratejisi](#11-pazara-çıkış-stratejisi)
12. [Kapsam Dışı Kararlar](#12-kapsam-dışı-kararlar)
13. [Sözlük](#13-sözlük)

---

## 1. Yönetici Özeti

Applyze, iş arayanların Kariyer.net, LinkedIn, Youthall ve Anbean gibi birden fazla platformdaki başvurularını tek bir mobil uygulamada takip etmelerini, süreçlerini yönetmelerini ve kariyer verilerini analiz etmelerini sağlayan iOS ve Android uygulamasıdır.

Kullanıcılar bugün 4-5 farklı platformu ayrı ayrı takip ediyor, başvuru geçmişlerini Excel veya zihinsel notlarla yönetiyor. Bu süreç dağınık, zaman alıcı ve içgörüsüz. Applyze bu karmaşayı tek bir akıllı arşive dönüştürür.

### Üç Temel Farklılaştırıcı

1. **Yerel platform desteği** — Kariyer.net, Youthall, Anbean için otomatik bilgi çekme. Batılı rakiplerin hiçbirinde yok.
2. **Elenme analizi** — "Hangi aşamada eleniyorum?" sorusunu görselleştiren içgörü ekranı.
3. **Gizlilik öncelikli bildirimler** — Kilit ekranında şirket adı gösterilmez. Çalışırken iş arayan kullanıcılar için ekstra değer.

---

## 2. Problem ve Çözüm

### Problem

Türkiye'de iş arayanların büyük çoğunluğu — özellikle 22-27 yaş arası yeni mezunlar — başvurularını organize bir şekilde takip edemiyor.

| Sorun | Kullanıcı Etkisi | Şiddet |
|-------|-----------------|--------|
| 4-5 farklı platform | Her gün çoklu uygulama açma zorunluluğu | Çok Yüksek |
| Başvuru geçmişi yok | Aynı ilana iki kez başvurma | Yüksek |
| Aşama görünürlüğü yok | Nerede olduğunu bilmemek | Yüksek |
| Elenme örüntüsü görünmüyor | Strateji geliştirememe | Yüksek |
| Gizlilik kaygısı | Patronun fark etme korkusu (çalışırken iş arayanlar için) | Orta |

### Çözüm — 3 Katmanlı Değer

**Katman 1 — Hafıza**
Tüm başvuruları tek yerde, kalıcı olarak saklar. Platform fark etmeksizin her başvuru kayıt altına alınır.

**Katman 2 — Görünürlük**
Başvuruların hangi aşamada olduğunu görsel tahta üzerinde gösterir. Tek bakışta "neredeyim?" sorusu yanıtlanır.

**Katman 3 — İçgörü**
Biriken veriyi analiz ederek kullanıcıya örüntüler gösterir: hangi aşamada takılıyor, hangi platformdan daha fazla geri dönüş alıyor.

---

## 3. Pazar Analizi

### Türkiye İş Arama Pazarı

| Gösterge | Veri | Kaynak |
|---------|------|--------|
| Yıllık yeni iş arayanlar | ~2.5 milyon | Hipotez — doğrulanmamış |
| 22-30 yaş aktif arayışta | ~800.000 | Hipotez — doğrulanmamış |
| Kariyer.net aylık kullanıcı | ~4 milyon | Hipotez — doğrulanmamış |
| LinkedIn Türkiye kullanıcısı | ~14 milyon | Hipotez — doğrulanmamış |
| Ortalama iş arama süresi | 4-6 ay | Hipotez — doğrulanmamış |

> ⚠️ Pazar verileri henüz birincil kaynakla doğrulanmamıştır. Launch öncesinde doğrulanacaktır.

### Rekabet Analizi

| Ürün | Güçlü Yanlar | Zayıf Yanlar | Applyze Farkı |
|------|-------------|-------------|----------------|
| Teal | Güçlü CV builder | Türk platform desteği yok | Yerel platform + sade UX |
| Huntr | Görsel tahta, Gmail entegrasyon | Ücretli, İngilizce | Türkçe, ücretsiz MVP |
| Simplify | Otomatik form doldurma | Sadece Chrome, mobil yok | Native mobil |
| Eztrackr | AI araçlar, iyi tasarım | Türk platformları yok | Kariyer.net/Youthall desteği |

### Rekabet Boşluğu

Türkiye'de yerel platformları destekleyen, mobil öncelikli, elenme analizi yapan hiçbir uygulama yok. Bu boşluk Applyze'in net pazar fırsatı.

---

## 4. Kullanıcı Profili

> ⚠️ Kullanıcı araştırması henüz tamamlanmamıştır. Aşağıdaki profiller gözlem ve varsayıma dayanmaktadır. Sprint 1 öncesinde veya launch sonrasında gerçek görüşmelerle doğrulanacak ve gerekirse revize edilecektir. **Etiket: Hipotez**

### Birincil Kullanıcı — Aktif İş Arayan Yeni Mezun

| Özellik | Detay |
|--------|-------|
| Yaş | 22-27 |
| Durum | Yeni mezun veya ilk işinde, aktif iş arıyor |
| Platformlar | LinkedIn, Kariyer.net, Youthall, Anbean |
| Başvuru hacmi | Haftada 5-30 başvuru |
| Mevcut araç | Excel, Notes veya hafıza |
| Aktif saat | Akşam 21:00-23:00 ve öğle molası |

**Temel ihtiyaçlar:**
- Tüm başvurularını tek yerde görmek
- Hangi aşamada olduğunu bilmek
- Aynı ilana iki kez başvurmaktan kaçınmak
- Hangi pozisyonda daha başarılı olduğunu anlamak

### İkincil Kullanıcı — Çalışırken İş Arayan

Birincil kullanıcının tüm ihtiyaçlarına ek olarak gizlilik öncelikli bildirim ve görünüm özellikleri bu segment için ekstra değer üretir.

### Kullanıcı Yolculuğu — Bugün

| Aşama | Kullanıcı Ne Yapıyor? | Sorun |
|-------|----------------------|-------|
| Keşif | 4-5 platformu ayrı ayrı açıyor | Dağınık deneyim |
| Başvuru | Her platformda ayrı form dolduruyor | Zaman kaybı |
| Kayıt | Notes'a elle yazıyor veya hiç kaydetmiyor | Standart değil, kaybolabilir |
| Bekleme | Hiçbir şey yapmıyor | Hangi firmadan dönüş beklediğini unutuyor |
| Değerlendirme | Neden elendiğini bilmiyor | Örüntü göremez |

### Kullanıcı Yolculuğu — Applyze ile

| Aşama | Kullanıcı Ne Yapıyor? | Applyze Değeri |
|-------|----------------------|----------------|
| Keşif | İstediği platformda ilan görüyor | Platforma bağımlı değil |
| Kayıt | Linki kopyalayıp yapıştırıyor | 10 saniyede kayıt |
| Takip | Görsel tahtada sürükle-bırak | Sezgisel, hızlı |
| Bekleme | Gösterge panelinde "dönüş bekleyenler" listesi | Hiçbir şey kaçmıyor |
| Analiz | Elenme ekranını inceliyor | Strateji geliştirebiliyor |

---

## 5. MVP Kapsamı

### Özellik Listesi

| # | Özellik | Açıklama | Öncelik | Sprint |
|---|---------|---------|---------|--------|
| F-01 | Kayıt ve Giriş | Email veya Google ile giriş. Veriler kişisel ve gizli. | Kritik | S1 |
| F-02 | Otomatik Bilgi Çekme | Kariyer.net, Youthall, Anbean linkleri için şirket, pozisyon, lokasyon otomatik çekilir. | Kritik | S1 |
| F-03 | Manuel Ekleme | Bağlantı desteklenmediğinde kullanıcı kendisi doldurur. | Kritik | S1 |
| F-04 | Görsel Takip Tahtası | Başvurular aşamalara göre sütunlarda. Sürükle-bırak ile güncelleme. | Kritik | S1 |
| F-05 | Başvuru Arşivi | Tüm başvurular. Aranabilir, filtrelenebilir. | Kritik | S1 |
| F-06 | Başvuru Detayı | Notlar, aşama geçmişi, iletişim kişisi, ilan bağlantısı. | Yüksek | S2 |
| F-07 | Özelleştirilebilir Aşamalar | Varsayılan aşamalar gelir, kullanıcı ekleyip değiştirebilir. | Yüksek | S2 |
| F-08 | Gösterge Paneli | Toplam başvuru, aşama dağılımı, geri dönüş süresi. | Yüksek | S2 |
| F-09 | Elenme Analizi | Kullanıcının elenme örüntüsünü gösteren ekran. Başvuru sayısına göre aşamalı açılır. | Yüksek | S3 |
| F-10 | Hareketsizlik Bildirimi | Uzun süre haber alınmayan başvurular için hatırlatma. Gizlilik öncelikli. | Orta | S3 |
| F-11 | Tekrarlayan Başvuru Uyarısı | Daha önce başvurulan ilana tekrar eklenince uyarı. | Orta | S3 |

### Kapsam Dışı (v1)

- Otomatik ilan toplama
- Kişiselleştirilmiş yapay zeka tavsiyesi
- Sosyal özellikler
- CV oluşturucu veya mülakat asistanı
- Web uygulaması
- Seri/streak sistemi

---

## 6. Sprint Planı (10 Hafta)

### Genel Bakış

| Sprint | Haftalar | Odak | Teslimat |
|--------|---------|------|---------|
| Sprint 1 | 1-3 | Temel | Giriş, ilan ekleme, görsel tahta, arşiv |
| Sprint 2 | 4-6 | Tamamlama | Detay sayfası, aşama yönetimi, gösterge paneli |
| Sprint 3 | 7-8 | Etkileşim | Analiz, bildirimler, tekrar uyarısı |
| Sprint 4 | 9-10 | Yayına Alım | Beta test, hata düzeltme, App Store gönderimi |

### Sprint 1 — Temel (Hafta 1-3)

> ⚠️ **Ön Görev (Sprint başlamadan):** Otomatik bilgi çekme özelliği için Kariyer.net ve Youthall'un teknik uygunluk araştırması yapılmalıdır. Bkz. Risk Yönetimi #1.

| Gün | Görev | Tamamlanma Kriteri |
|-----|-------|-------------------|
| 1-2 | Proje kurulumu: Expo, Supabase, GitHub | Uygulama çalışıyor |
| 3-5 | Giriş: kayıt, email, Google OAuth | Kullanıcı giriş yapabiliyor |
| 6-8 | Karşılama ekranları (3 ekran, atlanabilir) | Gösterge paneline geçiş var |
| 9-12 | Manuel ilan ekleme formu | Başvuru veritabanına kaydediliyor |
| 13-16 | Otomatik bilgi çekme: Edge Function + Kariyer.net | Kariyer.net linki çalışıyor |
| 17-18 | Youthall ve Anbean parser | Linkler çalışıyor |
| 19-21 | Görsel takip tahtası (sütunlar, kartlar, sürükle-bırak) | Başvurular görünüyor |

### Sprint 2 — Tamamlama (Hafta 4-6)

| Gün | Görev | Tamamlanma Kriteri |
|-----|-------|-------------------|
| 22-25 | Başvuru arşivi (liste, arama, filtreleme) | 100 başvuruda arama çalışıyor |
| 26-28 | Başvuru detay sayfası | Notlar, aşama geçmişi görünüyor |
| 29-31 | Özelleştirilebilir aşamalar | Kullanıcı aşama ekleyip silebiliyor |
| 32-35 | Gösterge paneli — metrik kartları | Sayaçlar görünüyor |
| 36-38 | Gösterge paneli — aşama dağılımı grafiği | Grafik render ediliyor |
| 39-42 | Tasarım cilası: boş ekranlar, yükleme ekranları | Boş ekranlarda yönlendirici buton var |

### Sprint 3 — Etkileşim (Hafta 7-8)

| Gün | Görev | Tamamlanma Kriteri |
|-----|-------|-------------------|
| 43-45 | Elenme analizi ekranı | Görsel render ediliyor |
| 46-47 | Aşamalı içgörü sistemi | 0/5/10 eşikleri çalışıyor |
| 48-49 | Bildirim altyapısı | Test bildirimi cihaza ulaşıyor |
| 50-51 | Hareketsizlik bildirimi | 14 gün geçmişse bildirim gidiyor |
| 52-53 | Tekrarlayan başvuru uyarısı | Aynı URL eklenince uyarı çıkıyor |
| 54-56 | Tasarım cilası: animasyonlar, dokunsal geri bildirim | Uygulama native hissettiriyor |

### Sprint 4 — Yayına Alım (Hafta 9-10)

| Gün | Görev | Tamamlanma Kriteri |
|-----|-------|-------------------|
| 57-59 | Kapalı beta: 10-15 kullanıcı | Geri bildirim toplanıyor |
| 60-62 | Kritik hata düzeltme | Yüksek öncelikli hatalar kapatıldı |
| 63-64 | App Store varlıkları (ekran görüntüsü, açıklama, ikon) | App Store Connect'e yüklendi |
| 65-66 | Google Play varlıkları | Play Console'a yüklendi |
| 67 | iOS TestFlight gönderimi | TestFlight'ta kullanılabilir |
| 68 | Google Play dahili test | Dahili test aktif |
| 69-70 | App Store inceleme bekleme + küçük düzeltmeler | Onay alındı |

> ⚠️ Apple Developer hesabı ($99/yıl) Sprint 1'in ilk gününde açılmalıdır.

---

## 7. Başarı Metrikleri

> **Etiket sistemi:**
> - **Araştırmaya dayalı** — gerçek veriyle desteklenen, savunulabilir
> - **Hipotez** — henüz test edilmemiş, launch sonrası revize edilecek

### Ana Başarı Metriği

> **7. günde hâlâ başvuru ekleyen kullanıcı yüzdesi**  
> Hedef: İlk 3 ayda > %50 | **Hipotez**

Bu metrik hem uygulamanın alışkanlık yarattığını hem de gerçek değer üretimini ölçer.

### Edinim Metrikleri

| Metrik | Tanım | Hedef (3. Ay) | Etiket |
|--------|-------|--------------|--------|
| Uygulama indirme | Organik indirme | > 500 | Hipotez |
| Kayıt oranı | İndirenlerden kayıt olanlar | > %60 | Hipotez |
| İlk başvuru ekleme | Kaydolup ilk başvurusunu ekleyenler | > %50 | Hipotez |

### Etkileşim Metrikleri

| Metrik | Tanım | Hedef | Etiket |
|--------|-------|-------|--------|
| Günlük/Aylık aktif kullanıcı oranı | Günlük aktif / aylık aktif | > %25 | Hipotez |
| 7. Gün Aktifliği | 7. günde hâlâ başvuru ekleyenler | > %50 | Hipotez |
| 30. Gün Aktifliği | 30. günde hâlâ aktif | > %30 | Hipotez |
| Başvuru / Kullanıcı | Aylık ortalama | 8+ | Hipotez |
| Bildirim açılma oranı | Bildirimden uygulamaya geçiş | > %30 | Hipotez |

### Kalite Metrikleri

| Metrik | Hedef | Etiket |
|--------|-------|--------|
| Otomatik bilgi çekme başarısı | Sprint öncesi araştırma sonrası belirlenecek | Araştırmaya dayalı |
| App Store puanı | > 4.2 / 5.0 | Hipotez |
| Çökme oranı | < %0.5 | Hipotez |
| Görsel tahta yükleme süresi (99. yüzdelik) | < 2 sn | Hipotez |

---

## 8. Risk Yönetimi

### Risk Matrisi

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|---------|------|-------------------|
| **#1 Otomatik bilgi çekme teknik riski** | Yüksek | Yüksek | Bkz. aşağıda detay |
| App Store reddi (gizlilik/izin) | Düşük | Çok Yüksek | Gizlilik politikası eksiksiz. TestFlight ile erken test |
| Düşük ilk aktiflik | Orta | Yüksek | Karşılama akışında ilk başvuru zorunlu adım |
| Supabase ücretsiz limit aşımı | Düşük | Orta | Pro plan ($25/ay) hazırda |
| Tek geliştirici bant genişliği | Orta | Yüksek | MVP kapsamı dar, kapsam dışı liste net |

### Risk #1 — Otomatik Bilgi Çekme Teknik Riski (Detay)

**Sprint 1 başlamadan, kod yazmadan önce yapılacak ön araştırma:**

- 20-30 farklı Kariyer.net ilanını tarayıcı geliştirici araçlarıyla incele — HTML sunucu taraflı mı, JavaScript ağırlıklı mı?
- Youthall ve Anbean için aynısını yap
- Hız sınırı testi — aynı IP'den 10+ istek atınca ne oluyor?

**Araştırma sonucuna göre üç senaryo:**

| Senaryo | Durum | Karar |
|---------|-------|-------|
| HTML sunucu taraflı, tutarlı yapı | ✅ Yeşil | Sprint 1'de yaz, başarı hedefi araştırmadan sonra belirlenir |
| JavaScript ağırlıklı, özel tarayıcı gerekiyor | ⚠️ Sarı | Puppeteer/Playwright ekle, süre uzar |
| Engelliyor, güvenilir değil | 🔴 Kırmızı | Özellik MVP kapsamından çıkar, manuel ekleme öne çıkar |

> Kırmızı senaryo gelirse ürün çökmez. Manuel ekleme zaten var; ana farklılaştırıcılar elenme analizi ve platform organizasyonudur.

### Kapsam Kayması Önlemi

> **Kural:** Yeni özellik isteği geldiğinde ilk soru şu olmalı: "Bu olmadan kullanıcı değer alamaz mı?"
> Cevap "alabilir" ise → geride beklesin. MVP'ye eklenmez.

---

## 9. Günlük Kullanım Stratejisi

### İki Kanca Mekanizması

**Pasif Kanca — Gösterge Paneli Özeti**

Her açılışta anlamlı özet:
- "Bu hafta 3 başvuru, 1'i teknik mülakata geçti"
- "Son 30 günde en çok başvurduğun alan: Ürün Yönetimi"
- İçerik günlük güncellenir

**Aktif Kanca — Hareketsizlik Bildirimi**

Somut, kişisel bildirimler:
- "Vodafone başvurusundan 14 gündür haber yok — takip etmek ister misin?"
- Günde maksimum 1 kez, 09:00-21:00 arası
- Kilit ekranında şirket adı görünmez — sadece "Applyze — Hatırlatıcın var"

### Neden Seri (Streak) Sistemi Yok?

Seri sistemi bilinçli olarak reddedildi. Kullanıcı iş bulduğunda uygulamayı bırakmak ister — bu başarıdır, cezalandırılmamalıdır. Hedef kullanıcı motivasyonu zaten yüksek; yapay bağımlılık değil, gerçek değer isteniyor. **Bu karar kalıcıdır.**

---

## 10. Monetizasyon Stratejisi

### v1: Tamamen Ücretsiz

v1.0 tamamen ücretsizdir. Önce kullanıcı tabanı ve veri birikimi, sonra monetizasyon.

### v2 Seçenekleri (Değerlendirme Aşaması)

| Model | Açıklama | Avantaj | Dezavantaj |
|-------|---------|---------|------------|
| Freemium | Temel özellikler ücretsiz, gelişmiş analiz premium | Geniş kullanıcı tabanı | Ücretsiz tier yeterli görünürse dönüşüm düşük |
| Abonelik | Aylık ₺29-49 | Düzenli gelir | Genç kitle ödeme direnci |
| Tek seferlik ödeme | ₺99 ömür boyu | Basit, kullanıcı dostu | Tekrarlayan gelir yok |
| Kurumsal (B2B) | Üniversite kariyer merkezleri | Yüksek birim gelir | Satış döngüsü uzun |

> Monetizasyon modeli ilk 500 kullanıcının davranışı incelendikten sonra netleştirilecektir.

---

## 11. Pazara Çıkış Stratejisi

> Bu bölüm stratejik çerçeveyi tanımlar. Kanal ve taktik detayları Sprint 4 başında ayrı bir pazara çıkış dokümanı olarak hazırlanacaktır.

### Hedef Segment

İlk 500 indirme için birincil hedef: **aktif iş arayan yeni mezun** (22-27 yaş, Türkiye).

Bu segmente ulaşmak için en doğrudan kanallar: LinkedIn, Youthall toplulukları, üniversite kariyer kulüpleri.

### Launch Mesajı

> **Ana mesaj:** "Başvurularını Excel'e yazmayı bırak."

Destekleyici mesajlar:
- "Kariyer.net, Youthall, Anbean — hepsini tek yerden takip et"
- "Hangi aşamada elendiğini artık biliyorsun"
- "Geçmiş başvurun, geleceğin stratejisi"

---

## 12. Kapsam Dışı Kararlar

| Karar | Gerekçe | Yeniden Değerlendirme |
|-------|---------|----------------------|
| LinkedIn otomatik bilgi çekme yok | Aktif engelleme, hukuki ve teknik risk | v2: resmi API araştırma |
| İlan toplama yok | Platform API'si yok, ortaklık 2.5 ayda kurulamaz | v3: ortaklık stratejisi |
| Web uygulaması yok | Mobil öncelikli, kaynak yetersiz | v2: React web |
| Yapay zeka tavsiyesi yok | Veri birikimi yetersiz | v2: Anthropic API |
| Seri sistemi yok | Kullanıcı psikolojisiyle çelişiyor | Kalıcı red |
| Sosyal özellikler yok | Gizlilik öncelikli ürünle çelişiyor | v3: opsiyonel |
| CV oluşturucu yok | Farklı ürün kategorisi, odak dağıtır | Bağımsız ürün fırsatı |
| Tam çevrimdışı destek yok | Supabase gerçek zamanlı bağlantı gerektirir | v2: çevrimdışı-öncelikli mimari |

---

## 13. Sözlük

| Terim | Tanım |
|-------|-------|
| MVP | Minimum Viable Product — kullanıcıya temel değeri sunan en küçük çalışan ürün |
| Görsel Takip Tahtası | Başvuruların aşamalara göre sütunlarda görüntülendiği ekran (Kanban) |
| Günlük/Aylık Aktif Kullanıcı Oranı | Günlük aktif kullanıcı sayısının aylık aktif kullanıcı sayısına oranı (DAU/MAU) |
| Aktiflik (Retention) | Kullanıcının uygulamayı belirli gün sonra hâlâ kullanması |
| Edge Function | Supabase'in sunucusuz Deno fonksiyonu |
| Satır Bazlı Erişim Kontrolü (RLS) | Veritabanında her kullanıcının yalnızca kendi verisine erişmesini sağlayan güvenlik katmanı |
| Otomatik Bilgi Çekme | Link yapıştırılınca ilanın bilgilerinin otomatik çekilmesi |
| Web Kazıma (Scraping) | Web sayfasından veri çekme işlemi |
| EAS | Expo Application Services — App Store/Play deploy altyapısı |
| Elenme Hunisi | Kullanıcının başvuru sürecindeki aşama geçiş oranlarını gösteren görsel |
| Kullanıcı Grubu (Cohort) | Aynı dönemde kaydolan kullanıcı grubu |
| Derin Bağlantı (Deep Link) | Uygulama içinde belirli ekrana doğrudan açılan bağlantı |
| Soğuk Başlangıç (Cold Start) | Uygulamanın bellekten temizlenmiş halde ilk açılışı |
| Yumuşak Silme (Soft Delete) | Veriyi silmek yerine "silinmiş" olarak işaretleme — geri alınabilir |

---

*Applyze MVP Kapsam Dokümanı — v2.0 | Nisan 2026*
