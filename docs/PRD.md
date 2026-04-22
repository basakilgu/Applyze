# Applyze — Ürün Gereksinimleri Dokümanı (PRD)

**Versiyon:** v2.0  
**Durum:** Taslak  
**Tarih:** Nisan 2026  
**Ürün:** Applyze  

> Bu doküman geliştirici referansıdır. Ürünün ne olduğu, neden yapıldığı ve pazara çıkış stratejisi için bkz. MVP Kapsam Dokümanı v2.0.

---

## İçindekiler

1. [Değişiklik Geçmişi](#1-değişiklik-geçmişi)
2. [Ürün Tanımı ve Kapsam](#2-ürün-tanımı-ve-kapsam)
3. [Kullanıcı Personaları](#3-kullanıcı-personaları)
4. [Epikler ve Özellik Haritası](#4-epikler-ve-özellik-haritası)
5. [Fonksiyonel Gereksinimler](#5-fonksiyonel-gereksinimler)
6. [Kullanıcı Hikayeleri ve Kabul Kriterleri](#6-kullanıcı-hikayeleri-ve-kabul-kriterleri)
7. [Fonksiyonel Olmayan Gereksinimler](#7-fonksiyonel-olmayan-gereksinimler)
8. [Tasarım Gereksinimleri](#8-tasarım-gereksinimleri)
9. [Veri Gereksinimleri](#9-veri-gereksinimleri)
10. [Teknik Mimari](#10-teknik-mimari)
11. [Teknik Kısıtlamalar ve Bağımlılıklar](#11-teknik-kısıtlamalar-ve-bağımlılıklar)
12. [Yayın Kabul Kriterleri](#12-yayın-kabul-kriterleri)
13. [Kapsam Dışı Kararlar](#13-kapsam-dışı-kararlar)
14. [Sözlük](#14-sözlük)

---

## 1. Değişiklik Geçmişi

| Versiyon | Tarih | Değişiklik |
|---------|-------|-----------|
| v0.1 | Mart 2026 | İlk taslak — vizyon ve persona bölümleri |
| v0.2 | Mart 2026 | Epikler, fonksiyonel gereksinimler, kullanıcı hikayeleri |
| v0.3 | Nisan 2026 | Fonksiyonel olmayan gereksinimler, tasarım gereksinimleri, veri modeli |
| v1.0 | Nisan 2026 | İlk tam versiyon |
| v2.0 | Nisan 2026 | Doküman ayrımı refactor, metrik etiketleme, persona güncelleme, silme kararı, oto doldur risk planı, elenme analizi cold start çözümü |

---

## 2. Ürün Tanımı ve Kapsam

### Ürün Tanımı

Applyze, iş arayanların Kariyer.net, LinkedIn, Youthall ve Anbean gibi birden fazla platformdaki iş başvurularını tek bir mobil uygulamada takip etmelerini, süreçlerini yönetmelerini ve kariyer verilerini analiz etmelerini sağlayan iOS ve Android uygulamasıdır.

### Kapsam

| | |
|--|--|
| **Kapsam İÇİ** | Başvuru ekleme (link + manuel), aşama takibi (görsel tahta), arşiv, gösterge paneli, elenme analizi, bildirimler, tekrarlayan başvuru uyarısı, özelleştirilebilir aşamalar, başvuru detayı, başvuru silme |
| **Kapsam DIŞI** | LinkedIn otomatik bilgi çekme, ilan toplama, sosyal özellikler, CV oluşturucu, web uygulaması, yapay zeka tavsiyesi, seri sistemi |
| **Platform** | iOS 16+ ve Android 10+ |
| **Dil** | Türkçe (v1) |
| **Monetizasyon** | v1'de tamamen ücretsiz |

---

## 3. Kullanıcı Personaları

> ⚠️ Aşağıdaki personalar gözlem ve varsayıma dayanmaktadır. Kullanıcı araştırması henüz tamamlanmamıştır. Sprint 1 öncesinde veya launch sonrasında gerçek görüşmelerle doğrulanacak ve gerekirse revize edilecektir. **Etiket: Hipotez**

### Birincil Persona — Aktif İş Arayan Yeni Mezun

| Özellik | Detay |
|--------|-------|
| **İsim** | Mehmet Kaya, 22 yaş, Ankara |
| **Meslek** | İşletme mezunu, ilk işini arıyor |
| **Durum** | Tam zamanlı iş arama |
| **Teknoloji** | Android kullanıcısı |
| **Platformlar** | Youthall ağırlıklı, LinkedIn, Kariyer.net |
| **Başvuru hacmi** | Haftada 20-30 başvuru |
| **Mevcut araç** | Google Sheets (artık yönetilemez durumda) |

| Boyut | Detay |
|-------|-------|
| Motivasyon | Bir an önce iş bulmak. Her başvuru bir adım. |
| Hedef | Organizasyon. Neye başvurduğunu, nerede olduğunu bilmek. |
| Engeller | Yüksek hacim, dağınık platform, tekrarlayan başvurular. |
| Tasarım önceliği | Hız. Başvuru ekleme sürtünmesiz olmalı. |

### İkincil Persona — Çalışırken İş Arayan

| Özellik | Detay |
|--------|-------|
| **İsim** | Ayşe Yılmaz, 23 yaş, İstanbul |
| **Meslek** | Süreç Tasarım Uzmanı, tam zamanlı çalışıyor |
| **Durum** | Çalışırken kariyer değişikliği arıyor |
| **Teknoloji** | iPhone kullanıcısı |
| **Platformlar** | LinkedIn, Kariyer.net, Youthall, Anbean |
| **Başvuru hacmi** | Haftada 5-10 başvuru (seçici) |
| **Mevcut araç** | Notes + Excel |

| Boyut | Detay |
|-------|-------|
| Motivasyon | Daha iyi kariyer fırsatı, liderlik programları. |
| Hedef | Stratejiyle iş aramak. Hangi aşamada elendiğini anlamak. |
| Engeller | Sınırlı zaman, patronun fark etme korkusu. |
| Tasarım önceliği | Gizlilik öncelikli bildirimler, analiz ekranı. |

### Persona Karşılaştırması

| Boyut | Mehmet (Birincil) | Ayşe (İkincil) |
|-------|------------------|----------------|
| Durum | Yalnızca iş arıyor | Çalışırken iş arıyor |
| Başvuru hacmi | Haftada 20-30 (hacimli) | Haftada 5-10 (seçici) |
| Öncelikli özellik | Hızlı ekleme ve organizasyon | Analiz ve gizlilik |
| Gizlilik ihtiyacı | Düşük | Çok Yüksek |
| Analiz ihtiyacı | Orta | Yüksek |

---

## 4. Epikler ve Özellik Haritası

> **Önceliklendirme Tanımları (MoSCoW):**
> - **Olmazsa Olmaz** — Olmadan ürün değer üretemiyor.
> - **Olmalı** — Önemli ama olmadan yayına alınabilir.
> - **Olsa İyi** — Zaman ve kaynak varsa.
> - **Olmayacak** — Bu sürümde kesinlikle hayır.

### EP-01: Kimlik Doğrulama ve Kullanıcı Yönetimi

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-01 | Email ve şifre ile kayıt | Olmazsa Olmaz | S1 |
| F-02 | Google ile giriş | Olmazsa Olmaz | S1 |
| F-03 | Oturum yönetimi (30 gün) | Olmazsa Olmaz | S1 |
| F-04 | Şifre sıfırlama | Olmalı | S1 |
| F-05 | Hesap silme ve veri imhası | Olmalı | S2 |
| F-06 | Profil düzenleme | Olsa İyi | S3 |

### EP-02: Başvuru Yönetimi

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-07 | Link → otomatik bilgi çekme (Kariyer.net) | Olmazsa Olmaz | S1 |
| F-08 | Link → otomatik bilgi çekme (Youthall) | Olmazsa Olmaz | S1 |
| F-09 | Link → otomatik bilgi çekme (Anbean) | Olmalı | S1 |
| F-10 | Manuel başvuru ekleme | Olmazsa Olmaz | S1 |
| F-11 | Başvuru düzenleme | Olmazsa Olmaz | S1 |
| F-12 | Başvuru silme (onay dialogu + yumuşak silme) | Olmalı | S2 |
| F-13 | Tekrarlayan başvuru uyarısı | Olmalı | S3 |

### EP-03: Aşama Yönetimi

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-14 | Varsayılan aşamalar | Olmazsa Olmaz | S1 |
| F-15 | Aşama değiştirme (sürükle-bırak ve alt sayfa) | Olmazsa Olmaz | S1 |
| F-16 | Özelleştirilebilir aşamalar (ekle/sil/yeniden adlandır) | Olmalı | S2 |
| F-17 | Aşama geçmişi kaydı | Olmalı | S2 |

### EP-04: Görsel Takip Tahtası

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-18 | Sütun tabanlı görsel takip | Olmazsa Olmaz | S1 |
| F-19 | Sürükle-bırak ile aşama güncelleme | Olmazsa Olmaz | S1 |
| F-20 | Kart üzerinde özet bilgi | Olmazsa Olmaz | S1 |
| F-21 | Platform renk kodu | Olmalı | S1 |

### EP-05: Arşiv

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-22 | Tüm başvurular listesi | Olmazsa Olmaz | S1 |
| F-23 | Metin araması | Olmazsa Olmaz | S1 |
| F-24 | Platform filtresi | Olmalı | S2 |
| F-25 | Aşama filtresi | Olmalı | S2 |
| F-26 | Tarih sıralaması | Olsa İyi | S2 |

### EP-06: Başvuru Detayı

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-27 | Not ekleme ve düzenleme | Olmalı | S2 |
| F-28 | Aşama geçmişi görüntüleme | Olmalı | S2 |
| F-29 | İletişim kişisi bilgisi | Olsa İyi | S2 |
| F-30 | İlan bağlantısına gitme | Olmalı | S2 |

### EP-07: Gösterge Paneli ve Analiz

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-31 | Metrik kartları (toplam, bekleyen, mülakat, teklif) | Olmalı | S2 |
| F-32 | Aşama dağılımı grafiği | Olmalı | S2 |
| F-33 | Elenme analizi ekranı (aşamalı açılım) | Olmalı | S3 |
| F-34 | Platform bazlı başarı oranı | Olsa İyi | S3 |

### EP-08: Bildirimler

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-35 | Hareketsizlik bildirimi (14 gün) | Olmalı | S3 |
| F-36 | Bildirim gizliliği (kilit ekranında şirket adı yok) | Olmazsa Olmaz | S3 |
| F-37 | Bildirim ayarları (açma/kapama, saat aralığı) | Olmalı | S3 |

---

## 5. Fonksiyonel Gereksinimler

### FR-01: Kimlik Doğrulama

- Kullanıcı email + şifre veya Google OAuth ile kayıt olabilmeli
- Oturum 30 gün geçerli, yenileme token'ı ile uzatılabilir
- Şifre sıfırlama email ile gerçekleşir
- Hesap silindiğinde tüm kullanıcı verisi 30 gün yumuşak silme sonrası kalıcı olarak silinir

### FR-02: Otomatik Bilgi Çekme

> ⚠️ Bu özellik Sprint 1 başlamadan yapılacak teknik uygunluk araştırmasına bağlıdır. Bkz. Teknik Kısıtlamalar #1.

- Kullanıcı Kariyer.net, Youthall veya Anbean linki yapıştırdığında şirket adı, pozisyon ve lokasyon otomatik doldurulur
- İşlem 4 saniye içinde tamamlanır
- Başarısız olursa kullanıcı manuel ekleme akışına yönlendirilir, hata gizlenmez
- LinkedIn için otomatik bilgi çekme yoktur — kullanıcıya net mesaj gösterilir

### FR-03: Başvuru Ekleme ve Düzenleme

- Zorunlu alanlar: şirket adı, pozisyon
- Opsiyonel alanlar: platform, lokasyon, ilan bağlantısı, başvuru tarihi
- Başvuru tarihi girilmezse kayıt tarihi atanır

### FR-04: Başvuru Silme

- Kullanıcı başvuruyu silebilir
- Silme öncesinde "Bu işlem geri alınamaz" onay dialogu gösterilir
- Silinen başvuru elenme analizinden çıkar
- Backend'de yumuşak silme olarak saklanır (veri imhası hesap silinince gerçekleşir)

### FR-05: Aşama Yönetimi

**Varsayılan aşamalar (sırayla):**
1. Başvuruldu
2. İnsan Kaynakları Görüşmesi
3. Teknik Mülakat
4. Yönetici Görüşmesi
5. Teklif
6. Elenildi

- Kullanıcı aşama ekleyebilir, yeniden adlandırabilir, silebilir
- Varsayılan aşamalar silinemez — yalnızca yeniden adlandırılabilir
- Her aşama geçişi zaman damgasıyla kaydedilir

### FR-06: Görsel Takip Tahtası

- Her aşama ayrı sütunda görüntülenir
- Sürükle-bırak ile aşama değiştirilebilir
- Kart üzerinde: şirket adı (kalın), pozisyon, platform renk noktası, göreli tarih ("3 gün önce")
- Uzun basma ile hızlı menü açılır (aşama değiştir, sil, detaya git)

### FR-07: Arşiv

- Tüm başvurular tarih sırasıyla listelenir
- Şirket adı ve pozisyona göre anlık arama
- Platform ve aşamaya göre filtreleme

### FR-08: Elenme Analizi — Aşamalı Açılım

| Başvuru Sayısı | Ekran İçeriği |
|---------------|---------------|
| 0-4 | "Henüz örüntü oluşmadı — her başvuru bu ekranı zenginleştirir" |
| 5-9 | İlk basit metrik: aşama dağılımı gösterilir |
| 10+ | Tam elenme hunisi aktif: her aşamada geçiş ve elenme oranları |

- Analiz sekmesi her zaman görünürdür — kilitli değildir
- İçerik başvuru sayısına göre dinamik olarak güncellenir

### FR-09: Bildirimler

- Bir başvurudan 14 gün haber alınmamışsa bildirim gönderilir
- Günde maksimum 1 bildirim
- Bildirim saati: 09:00-21:00 arası
- Kilit ekranı önizlemesinde şirket adı gösterilmez, yalnızca "Applyze — Hatırlatıcın var" görünür
- Kullanıcı bildirimleri tamamen kapatabilir veya saat aralığını değiştirebilir

### FR-10: Tekrarlayan Başvuru Uyarısı

- Kullanıcı daha önce eklediği bir URL'yi tekrar yapıştırırsa uyarı modalı gösterilir
- Kullanıcı yine de ekleyebilir — engellenmez, uyarılır

---

## 6. Kullanıcı Hikayeleri ve Kabul Kriterleri

### EP-02: Başvuru Yönetimi

**US-01:** Bir iş arayan olarak, Kariyer.net linki yapıştırarak başvuru ekleyebilmek istiyorum; böylece form doldurmak zorunda kalmam.

*Kabul Kriterleri:*
- [ ] Geçerli bir Kariyer.net linki yapıştırıldığında şirket adı, pozisyon ve lokasyon otomatik dolar
- [ ] İşlem 4 saniye içinde tamamlanır
- [ ] Kullanıcı doldurulmuş alanları kaydetmeden önce düzenleyebilir
- [ ] Başarısız olursa hata mesajı gösterilir ve manuel forma yönlendirilir

**US-02:** Bir iş arayan olarak, LinkedIn gibi desteklenmeyen platform ilanlarını manuel olarak ekleyebilmek istiyorum.

*Kabul Kriterleri:*
- [ ] Şirket adı ve pozisyon zorunlu alanlar olarak işaretlidir
- [ ] Diğer alanlar opsiyoneldir
- [ ] Form 10 saniyeden kısa sürede doldurulabilir (kullanıcı testi)

**US-03:** Bir iş arayan olarak, yanlışlıkla eklediğim başvuruyu silebilmek istiyorum.

*Kabul Kriterleri:*
- [ ] Silme seçeneği başvuru detay sayfasında ve uzun basma menüsünde bulunur
- [ ] Silme öncesinde "Bu işlem geri alınamaz" onay dialogu gösterilir
- [ ] Silinen başvuru görsel tahtadan ve arşivden anında kaybolur
- [ ] Silinen başvuru elenme analizini etkiler (hesaplamadan çıkar)

### EP-04: Görsel Takip Tahtası

**US-04:** Bir iş arayan olarak, başvurularımı sürükle-bırak ile aşamalar arasında taşıyabilmek istiyorum.

*Kabul Kriterleri:*
- [ ] Tüm aşama kombinasyonları arasında sürükle-bırak çalışır
- [ ] Taşıma sırasında dokunsal geri bildirim verilir
- [ ] Aşama değişikliği anında kaydedilir
- [ ] 50 kartla tahta 2 saniyede açılır

### EP-07: Elenme Analizi

**US-05:** Bir iş arayan olarak, hangi mülakat aşamasında elendiğimi görebilmek istiyorum; böylece stratejimi geliştirebilirim.

*Kabul Kriterleri:*
- [ ] 0-4 başvuruda bilgilendirici boş ekran mesajı gösterilir
- [ ] 5-9 başvuruda aşama dağılımı görünür
- [ ] 10+ başvuruda tam elenme hunisi görünür
- [ ] Silinen başvurular analizden çıkarılır

### EP-08: Bildirimler

**US-06:** Çalışırken iş arayan biri olarak, kilit ekranımda hangi şirkete başvurduğum görünmesini istemiyorum.

*Kabul Kriterleri:*
- [ ] Kilit ekranı bildirim önizlemesinde yalnızca "Applyze — Hatırlatıcın var" görünür
- [ ] Şirket adı veya pozisyon bilgisi önizlemede yer almaz
- [ ] Bu davranış iOS ve Android'de ayrı ayrı test edilir

---

## 7. Fonksiyonel Olmayan Gereksinimler

### Performans

| Gereksinim | Hedef |
|-----------|-------|
| Görsel tahta açılış süresi (50 kartla) | < 2 sn |
| Otomatik bilgi çekme toplam süresi | < 4 sn |
| Uygulama soğuk başlangıç | < 3 sn |
| Arşiv araması (100+ başvuruda) | Anlık |

### Güvenilirlik

| Gereksinim | Hedef |
|-----------|-------|
| Çökme oranı | < %0.5 |
| Veri kaybı | Sıfır tolerans |
| Beta test süresi (çökmesiz) | 7 gün |

### Güvenlik

| Katman | Önlem |
|--------|-------|
| Kimlik doğrulama | JWT (1 saat) + yenileme token'ı (30 gün) |
| Veri izolasyonu | Satır bazlı erişim kontrolü her tabloda |
| API güvenliği | Servis anahtarı yalnızca Edge Functions'ta |
| Bildirim gizliliği | Önizleme metni genel, şirket adı yok |
| Otomatik bilgi çekme | URL beyaz listesi — yalnızca izinli domainler |

### Erişilebilirlik

- Minimum dokunma hedefi 44pt
- Metin boyutu sistem ayarına uyar
- Ekran okuyucu (VoiceOver / TalkBack) için semantik etiketler

---

## 8. Tasarım Gereksinimleri

### Tasarım İlkeleri

**1 — Sade ve Hızlı**
Her ekranın tek birincil aksiyonu var. Başvuru ekleme 10 saniye altında. Gürültü tolere edilmez.

**2 — Gizlilik Öncelikli**
Bildirimler, ikon ve görünüm nötr. Tek bakışta "iş arama uygulaması" anlaşılmamalı.

**3 — Native Hissettir**
iOS'ta iOS dili, Android'de Material 3. Platform kuralları kırılmaz. Dokunsal geri bildirim.

**4 — Veriyi Görsel Yap**
Sayılar kadar görsel önemli. Analiz "tek bakışta anlama" sağlamalı.

### Renk Sistemi

| Renk Amacı | Hex | Kullanım |
|-----------|-----|---------|
| Birincil (Teal) | `#0F6E56` | Butonlar, başlıklar, aktif sekme |
| LinkedIn | `#0A66C2` | Platform renk noktası |
| Kariyer.net | `#FF6600` | Platform renk noktası |
| Youthall | `#7C3AED` | Platform renk noktası |
| Anbean | `#059669` | Platform renk noktası |
| Başarı / Teklif | `#059669` | Pozitif metrikler |
| Uyarı | `#D97706` | Yanıt bekleyenler |
| Elenildi | `#6B7280` | Elenildi aşaması — nötr gri |
| Hata | `#DC2626` | Form hataları |

### Bileşen Gereksinimleri

| Bileşen | Gereksinim |
|--------|-----------|
| Görsel Tahta Kartı | Min 80pt. Şirket (kalın), pozisyon, platform noktası, göreli tarih. Uzun basma menüsü. |
| Boş Ekran | Her boş ekran ikon + açıklama + yönlendirici buton içermeli. |
| Hata Bildirimi | Kırmızı, alt kısım, 3 sn, kaydırarak kapatılabilir. |
| Yükleme Göstergesi | Kart formunda iskelet animasyonu. Döner simge değil. |
| Alt Sayfa | Aşama değiştirme için. Kapatılabilir. |
| Platform Noktası | Platform rengiyle dolu nokta + isim. Küçük. |

### Navigasyon Mimarisi

| Seviye | Tip | İçerik |
|--------|-----|-------|
| L0 | Sekme Çubuğu (5 sekme) | Gösterge Paneli, Görsel Tahta, Arşiv, Analiz, Ayarlar |
| L1 | Yığın Gezgini | Her sekme kendi yığınında |
| L2 | Alt Sayfa / Modal | Başvuru ekleme, detay |
| L3 | Derin Bağlantı | `apptrack://application/:id` — bildirim yönlendirmesi |

---

## 9. Veri Gereksinimleri

### Veri Modeli

| Tablo | Temel Alanlar | İlişkiler |
|-------|-------------|---------|
| `users` | id (UUID PK), email, created_at | 1:N → applications |
| `applications` | id, user_id FK, company_name, position, platform, source_url, current_stage_id FK, applied_at, updated_at, deleted_at | N:1 → users, N:1 → stages |
| `stages` | id, user_id FK, name, color, order, is_terminal, is_default | N:1 → users, 1:N → applications |
| `stage_history` | id, application_id FK, stage_id FK, changed_at | N:1 → applications |
| `notes` | id, application_id FK, content (maks 2000), created_at | N:1 → applications |

> `deleted_at` alanı yumuşak silme için kullanılır. Null olmayan kayıtlar tüm sorgulardan ve analizden hariç tutulur.

### Veri Saklama Politikası

| Kural | Detay |
|-------|-------|
| Kullanıcı verisi | Hesap aktifken saklanır. Silme: 30 gün yumuşak silme → kalıcı silme. |
| Başvuru verisi | Kullanıcı silebilir (yumuşak silme). Hesap silinince tüm veri kalıcı silinir. |
| Bildirim logu | Son 90 gün saklanır. |
| Kimlik doğrulama token'ları | Erişim token'ı 1 saat. Yenileme token'ı 30 gün. Çıkışta geçersiz. |
| Otomatik bilgi çekme geçici verisi | İstemciye iletildikten sonra log tutulmaz. |

### Analitik Veri Toplama

**Toplanan (anonim, kullanıcı rızasıyla):**
- Ekran görüntülenme sayısı
- Özellik kullanım oranları
- Oturum süresi ve sıklığı
- Çökme logları

**TOPLANMAYAN:**
- Başvurulan şirket veya pozisyon adları
- Kişisel notlar
- İş arama içeriği

---

## 10. Teknik Mimari

### Teknoloji Stack

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| Mobil Framework | Expo (React Native) | iOS + Android tek kod tabanı, hızlı iterasyon |
| Backend ve Kimlik Doğrulama | Supabase | PostgreSQL, satır bazlı erişim kontrolü, gerçek zamanlı, ücretsiz başlangıç |
| Otomatik Bilgi Çekme | Supabase Edge Functions (Deno) | Sunucu taraflı web kazıma |
| Durum Yönetimi | Zustand | Sade, az ortak kod |
| Gezinme | Expo Router | Dosya tabanlı, derin bağlantı desteği |
| Bildirimler | Expo Notifications + Supabase cron | Zamanlanmış bildirim |
| Analitik | Amplitude (ücretsiz başlangıç) | Kullanıcı davranışı takibi |
| Dağıtım | Expo EAS Build | App Store + Google Play |
| Versiyon Kontrolü | GitHub | Dal: main + develop + feature |

### Veritabanı Güvenliği

```sql
-- Satır bazlı erişim kontrolü — her kullanıcı sadece kendi verisine erişir
CREATE POLICY 'Kullanicilar yalnizca kendi basvirularına erisebilir'
  ON applications FOR ALL
  USING (auth.uid() = user_id);
-- Tüm tablolara aynı politika uygulanır
```

### Otomatik Bilgi Çekme Akışı

| Adım | İşlem | Hedef Süre |
|------|--------|------------|
| 1 | Kullanıcı linki yapıştırır | 0ms |
| 2 | Domain kontrolü (beyaz liste) | <50ms |
| 3 | Platform tespiti | <50ms |
| 4 | Sayfa getirme (sunucu taraflı) | <2000ms |
| 5 | HTML ayrıştırma, alan çıkarma | <200ms |
| 6 | JSON olarak istemciye döndür | <100ms |
| 7 | Form doldurma animasyonu | <200ms |

---

## 11. Teknik Kısıtlamalar ve Bağımlılıklar

### Kısıtlamalar

| Kısıtlama | Etki | Çözüm |
|----------|------|-------|
| **#1 Otomatik bilgi çekme teknik riski** | Yeşil/sarı/kırmızı senaryoya göre kapsam değişebilir | Sprint 1 öncesi uygunluk araştırması zorunlu. Bkz. aşağıda. |
| LinkedIn web kazıma engeli | LinkedIn otomatik bilgi çekme yok | Manuel ekleme akışı, kullanıcıya net mesaj |
| Kariyer.net resmi API yok | Web kazıma gerekiyor | Modüler Edge Function parser |
| Apple Developer ($99/yıl) | Sprint 1 başında açılmalı | Gün 1 görevi |
| App Store inceleme 1-7 gün | Dağıtım tarihi kesin değil | Sprint 4'te 5 günlük tampon |
| Supabase ücretsiz başlangıç | 500+ kullanıcıda limit aşılabilir | Pro plan ($25/ay) hazırda |

**Kısıtlama #1 Detayı — Sprint Öncesi Uygunluk Araştırması:**

Sprint 1 kodlama başlamadan yapılacak araştırma:
- 20-30 farklı Kariyer.net ilanını tarayıcı geliştirici araçlarıyla incele
- Youthall ve Anbean için aynısını yap
- Hız sınırı testi yap

| Sonuç | Karar |
|-------|-------|
| HTML sunucu taraflı, tutarlı yapı ✅ | Sprint 1'de yaz, başarı hedefi araştırmadan sonra belirlenir |
| JavaScript ağırlıklı, özel tarayıcı gerekiyor ⚠️ | Puppeteer/Playwright ekle, süre uzar |
| Engelliyor, güvenilir değil 🔴 | Özellik MVP kapsamından çıkar, manuel ekleme öne çıkar |

### Dış Bağımlılıklar

| Bağımlılık | Tip | Risk |
|-----------|-----|------|
| Supabase | Backend/Kimlik Doğrulama/Veritabanı | Orta — servis kesintisi olasılığı |
| Kariyer.net (web kazıma) | Veri kaynağı | Yüksek — yapı değişebilir |
| Youthall (web kazıma) | Veri kaynağı | Orta |
| Expo Notifications | Push bildirim | Düşük |
| Apple App Store | Dağıtım | Düşük |
| Google Play | Dağıtım | Düşük |

---

## 12. Yayın Kabul Kriterleri

### Fonksiyonel Kabul

| # | Kriter | Doğrulama | Sonuç |
|---|--------|-----------|-------|
| 1 | Email ile kayıt ve giriş çalışıyor | Manuel test | ☐ |
| 2 | Google OAuth iOS ve Android'de çalışıyor | Her iki platformda test | ☐ |
| 3 | Kariyer.net linki otomatik dolduruyor (5 farklı ilan) | 5 aktif ilan ile test | ☐ |
| 4 | Youthall linki otomatik dolduruyor | 5 aktif ilan ile test | ☐ |
| 5 | Manuel ilan ekleme çalışıyor | Form doldurma ve kaydetme | ☐ |
| 6 | Görsel tahta 10+ başvuruda çalışıyor | 10 başvuruyla test | ☐ |
| 7 | Sürükle-bırak tüm sütun kombinasyonlarında çalışıyor | Tüm geçişlerde test | ☐ |
| 8 | Arşiv araması 10+ başvuruda anlık çalışıyor | Farklı arama terimleriyle | ☐ |
| 9 | Gösterge paneli metrikleri doğru hesaplanıyor | Bilinen veri setiyle doğrulama | ☐ |
| 10 | Push bildirim iOS ve Android'e ulaşıyor | TestFlight + dahili test | ☐ |
| 11 | Bildirim önizlemesi şirket adı içermiyor | Kilitli ekranda kontrol | ☐ |
| 12 | Tekrarlayan başvuru uyarısı tetikleniyor | Aynı URL ile iki kez ekleme | ☐ |
| 13 | Başvuru silme onay dialogu gösteriliyor | Silme akışı testi | ☐ |
| 14 | Silinen başvuru elenme analizinden çıkıyor | Analiz ekranı doğrulama | ☐ |
| 15 | Elenme analizi 0/5/10 eşiklerinde doğru içerik gösteriyor | Her eşikte test | ☐ |

### Performans Kabul

| # | Kriter | Hedef | Sonuç |
|---|--------|-------|-------|
| 1 | Görsel tahta 50 kartla açılış | < 2 sn | ☐ |
| 2 | Otomatik bilgi çekme toplam süresi | < 4 sn | ☐ |
| 3 | Uygulama soğuk başlangıç | < 3 sn | ☐ |
| 4 | Beta test 7 gün çökmesiz | 0 çökme | ☐ |

### Kullanıcı Deneyimi Kabul

| # | Kriter | Test Yöntemi | Sonuç |
|---|--------|-------------|-------|
| 1 | Yeni kullanıcı 5 dakikada ilk başvurusunu ekleyebilir | 5 kişiyle kullanılabilirlik testi | ☐ |
| 2 | Bildirim önizlemesi 3/3 test kullanıcısı tarafından içerik anlaşılmadan geçildi | Gizlilik testi | ☐ |
| 3 | Beta kullanıcılarının %50'si 7. günde hâlâ aktif | Grup takibi | ☐ |

---

## 13. Kapsam Dışı Kararlar

| Karar | Gerekçe | Yeniden Değerlendirme |
|-------|---------|----------------------|
| LinkedIn otomatik bilgi çekme yok | Aktif engelleme — hukuki ve teknik risk | v2: resmi API araştırma |
| İlan toplama yok | Platform API'si yok. Ortaklık 2.5 ayda kurulamaz | v3: ortaklık stratejisi |
| Web uygulaması yok | Mobil öncelikli. Kaynak yetersiz | v2: React web |
| Yapay zeka ilan tavsiyesi yok | Veri birikimi yetersiz | v2: Anthropic API |
| Seri sistemi yok | Kullanıcı psikolojisiyle çelişiyor. İş bulunca bırakmak istenir. | Kalıcı red |
| Sosyal özellikler yok | Gizlilik öncelikli tasarımla çelişiyor | v3: opsiyonel |
| CV oluşturucu yok | Farklı ürün kategorisi. Odak dağıtır | Bağımsız ürün fırsatı |
| Tam çevrimdışı destek yok | Supabase gerçek zamanlı bağlantı gerektirir | v2: çevrimdışı-öncelikli mimari |

---

## 14. Sözlük

| Terim | Tanım |
|-------|-------|
| PRD | Ürün Gereksinimleri Dokümanı — geliştirici referansı |
| MoSCoW | Olmazsa Olmaz / Olmalı / Olsa İyi / Olmayacak — önceliklendirme yöntemi |
| Fonksiyonel Olmayan Gereksinimler | Performans, güvenlik, erişilebilirlik gereksinimleri |
| Epic | İlgili özellikleri gruplayan üst düzey iş birimi |
| Kullanıcı Hikayesi | Kullanıcı perspektifinden gereksinim: "Bir X olarak, Y için Z yapmak istiyorum" |
| Kabul Kriteri | Bir özelliğin tamamlandığını kanıtlayan ölçülebilir koşullar |
| Satır Bazlı Erişim Kontrolü (RLS) | Veritabanında her kullanıcının yalnızca kendi verisine erişmesini sağlayan güvenlik katmanı |
| Otomatik Bilgi Çekme | Link yapıştırılınca ilan bilgilerinin otomatik çekilmesi |
| Derin Bağlantı | Uygulama içinde belirli ekrana doğrudan açılan bağlantı |
| Soğuk Başlangıç | Uygulamanın bellekten silinmiş halde ilk açılışı |
| Dokunsal Geri Bildirim | Sürükle-bırak gibi eylemlerde titreşimli geri bildirim |
| Edge Function | Supabase'in sunucusuz Deno fonksiyonu |
| Yumuşak Silme | Veriyi silmek yerine "silinmiş" olarak işaretleme — geri alınabilir |
| Elenme Hunisi | Kullanıcının başvuru sürecindeki aşama geçiş oranlarını gösteren görsel |
| Günlük/Aylık Aktif Kullanıcı Oranı (DAU/MAU) | Günlük aktif kullanıcı sayısının aylık aktif kullanıcı sayısına oranı |
| Kullanıcı Grubu (Cohort) | Aynı dönemde kaydolan kullanıcı grubu |
| EAS | Expo Application Services — App Store ve Google Play dağıtım altyapısı |

---

*Applyze PRD — v2.0 | Nisan 2026*
