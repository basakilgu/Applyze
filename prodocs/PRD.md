# Applyze — Ürün Gereksinimleri Dokümanı (PRD)

**Versiyon:** v2.1
**Durum:** Taslak
**Tarih:** Haziran 2026
**Ürün:** Applyze

> Bu doküman geliştirici referansıdır. Ürünün ne olduğu, neden yapıldığı ve pazara çıkış stratejisi için bkz. MVP Kapsam Dokümanı v2.0.

> ⚙️ **Platform yönü (v2.1):** MVP **web uygulaması** olarak geliştirilip canlıya alınmıştır (applyze.vercel.app). **Mobil (iOS/Android)** yayını bilinçli olarak **v2'ye ertelenmiştir** — kod tabanı (Expo/React Native) mobil yayını tek komutla mümkün kılacak şekilde korunmuştur. Bu dokümanda mobil-özel (push bildirim, App Store/Play Store, native dokunsal geri bildirim) olarak işaretlenen gereksinimler v2 kapsamındadır; web MVP'sinde yer almaz.

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
| v2.1 | Haziran 2026 | **Platform yönü güncellendi:** MVP web olarak canlıya alındı, mobil (iOS/Android) v2'ye ertelendi. **AI özellikleri** (Pusula içgörü, CV↔ilan uyum analizi, ilan→form otomatik doldurma) çekirdek kapsama eklendi. Bildirim ve App Store/Play Store gereksinimleri "mobil v2" olarak etiketlendi. |

---

## 2. Ürün Tanımı ve Kapsam

### Ürün Tanımı

Applyze, iş arayanların Kariyer.net, LinkedIn, Youthall ve Anbean gibi birden fazla platformdaki iş başvurularını tek bir uygulamada takip etmelerini, süreçlerini yönetmelerini ve kariyer verilerini **yapay zekâ ile** analiz etmelerini sağlayan bir uygulamadır. MVP **web** olarak yayındadır; kod tabanı (Expo/React Native) aynı zamanda iOS ve Android'i hedefleyecek şekilde tek çatıda tutulmuştur (mobil yayın v2).

### Kapsam

| | |
|--|--|
| **Kapsam İÇİ** | Manuel başvuru ekleme, aşama takibi, arşiv/liste, özelleştirilebilir aşamalar, başvuru detayı + aşama geçmişi, notlar, başvuru silme, gösterge paneli (özet), **AI Pusula (içgörü)**, **CV ↔ ilan uyum analizi (AI)**, **ilan linkinden otomatik form doldurma (AI)**, **Excel/CSV toplu içe aktarma**, veri dışa aktarma, hesap silme |
| **Kapsam DIŞI** | **Mobil (iOS/Android) yayını → v2**, **push bildirim → mobil v2**, tüm platformlar için otomatik bilgi çekme/scraping (Faz 0.2 sonrası v2'ye ertelendi), ilan toplama, sosyal özellikler, CV oluşturucu, AI ilan *tavsiye/öneri motoru* (içgörü ≠ tavsiye motoru), seri sistemi |
| **Platform** | **Web (canlı, MVP) — applyze.vercel.app** · Mobil iOS 16+ / Android 10+ **v2'ye ertelendi** |
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
| **Teknoloji** | Web + Android kullanıcısı |
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
| **Teknoloji** | Web (masaüstü) + iPhone kullanıcısı |
| **Platformlar** | LinkedIn, Kariyer.net, Youthall, Anbean |
| **Başvuru hacmi** | Haftada 5-10 başvuru (seçici) |
| **Mevcut araç** | Notes + Excel |

| Boyut | Detay |
|-------|-------|
| Motivasyon | Daha iyi kariyer fırsatı, liderlik programları. |
| Hedef | Stratejiyle iş aramak. Hangi aşamada elendiğini anlamak. |
| Engeller | Sınırlı zaman, patronun fark etme korkusu. |
| Tasarım önceliği | Gizlilik öncelikli görünüm, analiz ekranı. |

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

> 📱 **v2 (mobil) etiketi:** Push bildirim epiği (EP-08) ve sürükle-bırak/dokunsal geri bildirime dayalı native etkileşimler mobil v2 kapsamındadır. Web MVP'de bunların yerine web-uyumlu eşdeğerleri (liste/aşama güncelleme, in-app hatırlatma) kullanılır.

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
| F-10 | Manuel başvuru ekleme | Olmazsa Olmaz | S1 |
| F-11 | Başvuru düzenleme | Olmazsa Olmaz | S1 |
| F-12 | Başvuru silme (onay dialogu + yumuşak silme) | Olmalı | S2 |
| F-13 | Tekrarlayan başvuru uyarısı | Olmalı | S3 |
| F-40 | Excel/CSV toplu içe aktarma | Olmalı | S2 |

### EP-03: Aşama Yönetimi

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-14 | Varsayılan aşamalar | Olmazsa Olmaz | S1 |
| F-15 | Aşama değiştirme (alt sayfa / liste) | Olmazsa Olmaz | S1 |
| F-16 | Özelleştirilebilir aşamalar (ekle/sil/yeniden adlandır) | Olmalı | S2 |
| F-17 | Aşama geçmişi kaydı | Olmalı | S2 |

### EP-04: Görsel Takip (Web: Liste/Aşama Görünümü)

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-18 | Aşama bazlı görünüm | Olmazsa Olmaz | S1 |
| F-19 | Aşama güncelleme (alt sayfa/seçim) · sürükle-bırak → mobil v2 | Olmazsa Olmaz | S1 |
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

### EP-07: Gösterge Paneli ve Analiz (AI Pusula)

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-31 | Metrik kartları (toplam, bekleyen, mülakat, teklif) | Olmalı | S2 |
| F-32 | Aşama dağılımı grafiği | Olmalı | S2 |
| F-33 | Elenme analizi / Yolculuğum ekranı (aşamalı açılım) | Olmalı | S3 |
| F-34 | Platform bazlı başarı oranı | Olsa İyi | S3 |
| F-38 | **AI Pusula — içgörü/öneri (Gemini)** | Olmazsa Olmaz | S3 |
| F-39 | **CV ↔ ilan uyum analizi (AI)** | Olmalı | S3 |
| F-41 | **İlan linkinden otomatik form doldurma (AI)** | Olmalı | S2 |

### EP-08: Bildirimler — 📱 Mobil v2

> Push bildirim altyapısı mobil v2 kapsamındadır. Web MVP'de uzun süre sessiz kalan başvurular için uygulama içi (in-app) görsel hatırlatma kullanılır; kilit ekranı/push gizliliği gereksinimleri mobil sürümde devreye girer.

| Özellik ID | Özellik Adı | Öncelik | Sprint |
|-----------|------------|---------|--------|
| F-35 | Hareketsizlik bildirimi (14 gün) | Olmalı | v2 |
| F-36 | Bildirim gizliliği (kilit ekranında şirket adı yok) | Olmazsa Olmaz (mobil) | v2 |
| F-37 | Bildirim ayarları (açma/kapama, saat aralığı) | Olmalı | v2 |

---

## 5. Fonksiyonel Gereksinimler

### FR-01: Kimlik Doğrulama

- Kullanıcı email + şifre veya Google OAuth ile kayıt olabilmeli
- Oturum 30 gün geçerli, yenileme token'ı ile uzatılabilir
- Şifre sıfırlama email ile gerçekleşir (custom SMTP — Resend)
- Hesap silindiğinde tüm kullanıcı verisi 30 gün yumuşak silme sonrası kalıcı olarak silinir

### FR-02: Otomatik Bilgi Çekme (Scraping) — KAPSAM DIŞI (v2)

> Faz 0.2 araştırması (Mayıs 2026): Kariyer.net'in PerimeterX bot koruması Supabase Edge Function IP'lerini HTTP 403 ile engelliyor. Kırmızı senaryo gerçekleşti. Özellik MVP'den çıkarıldı, v2'de proxy servisi veya resmi API ile yeniden değerlendirilecek. Tüm platformlar için manuel ekleme akışı kullanılır.
>
> **Not:** Bunun yerine MVP'de **ilan metnini/linkini AI ile çözümleyip formu otomatik dolduran** akış (FR-11, parse-job) sağlanır — bu scraping değildir, kullanıcının sağladığı metni AI ile yapılandırır.

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

### FR-06: Görsel Takip (Web Liste/Aşama Görünümü)

- Her aşama ayrı görünümde/sütunda gösterilir
- Aşama değiştirme alt sayfa/seçim ile yapılır (sürükle-bırak mobil v2)
- Kart üzerinde: şirket adı (kalın), pozisyon, platform renk noktası, göreli tarih ("3 gün önce")
- Hızlı aksiyon menüsü (aşama değiştir, sil, detaya git)

### FR-07: Arşiv

- Tüm başvurular tarih sırasıyla listelenir
- Şirket adı ve pozisyona göre anlık arama
- Platform ve aşamaya göre filtreleme

### FR-08: Elenme Analizi / Yolculuğum — Aşamalı Açılım

| Başvuru Sayısı | Ekran İçeriği |
|---------------|---------------|
| 0-4 | "Henüz örüntü oluşmadı — her başvuru bu ekranı zenginleştirir" |
| 5-9 | İlk basit metrik: aşama dağılımı gösterilir |
| 10+ | Tam elenme hunisi aktif: her aşamada geçiş ve elenme oranları |

- Analiz sekmesi her zaman görünürdür — kilitli değildir
- İçerik başvuru sayısına göre dinamik olarak güncellenir
- **AI Pusula:** Bu sayısal teşhis Gemini'ye gönderilir; başlık + 3-4 somut öneri üretilir (bkz. FR-12)

### FR-09: Bildirimler — 📱 Mobil v2

> Aşağıdaki push gereksinimleri mobil sürümde geçerlidir. Web MVP'de uygulama içi hatırlatma kullanılır.

- Bir başvurudan 14 gün haber alınmamışsa bildirim gönderilir
- Günde maksimum 1 bildirim
- Bildirim saati: 09:00-21:00 arası
- Kilit ekranı önizlemesinde şirket adı gösterilmez, yalnızca "Applyze — Hatırlatıcın var" görünür
- Kullanıcı bildirimleri tamamen kapatabilir veya saat aralığını değiştirebilir

### FR-10: Tekrarlayan Başvuru Uyarısı

- Kullanıcı daha önce eklediği bir başvuruyu (URL veya şirket+pozisyon) tekrar eklerse uyarı gösterilir
- Kullanıcı yine de ekleyebilir — engellenmez, uyarılır

### FR-11: İlan Linkinden/Metninden Otomatik Form Doldurma (AI)

- Kullanıcının yapıştırdığı ilan metni/linki Edge Function üzerinden Gemini'ye gönderilir
- Şirket, pozisyon, şehir, platform alanları AI ile çözümlenip forma önerilir
- Kullanıcı önerilen değerleri düzenleyip kaydedebilir
- API anahtarı yalnız sunucuda; istemci asla doğrudan Gemini'ye gitmez

### FR-12: AI Pusula — İçgörü (Gemini)

- Frontend, gizliliğe uygun **sayısal teşhis** (huni oranları, darboğaz, güçlü alan/sektör, momentum) hesaplar
- Bu teşhis Edge Function (`ai-suggestions`) üzerinden Gemini'ye gönderilir
- AI'a **şirket adı veya kişisel not GÖNDERİLMEZ** — yalnız oran, sayı, alan/sektör etiketi
- Çıktı: 1 cümlelik headline + 3-4 somut öneri (kategoriler: momentum, güçlü alan, darboğaz, takip, iyi oluş)
- Dayanıklılık: `gemini-2.5-flash` → boş/hata dönerse `gemini-2.5-flash-lite` yedeği
- Önbellek: veri değişmedikçe yeniden üretilmez (kota koruması)

### FR-13: CV ↔ İlan Uyum Analizi (AI)

- Kullanıcı CV PDF'i yükler (Supabase Storage, özel bucket + RLS)
- Edge Function (`analyze-fit`) CV'yi `inline_data` ile okuyup ilanla karşılaştırır
- Çıktı: uyum skoru + gerekçe
- Anahtar sunucuda gizli; çağrı yalnız giriş token'ıyla yapılır

---

## 6. Kullanıcı Hikayeleri ve Kabul Kriterleri

### EP-02: Başvuru Yönetimi

**US-02:** Bir iş arayan olarak, LinkedIn gibi desteklenmeyen platform ilanlarını manuel olarak ekleyebilmek istiyorum.

*Kabul Kriterleri:*
- [ ] Şirket adı ve pozisyon zorunlu alanlar olarak işaretlidir
- [ ] Diğer alanlar opsiyoneldir
- [ ] Form 10 saniyeden kısa sürede doldurulabilir (kullanıcı testi)

**US-03:** Bir iş arayan olarak, yanlışlıkla eklediğim başvuruyu silebilmek istiyorum.

*Kabul Kriterleri:*
- [ ] Silme seçeneği başvuru detay sayfasında ve hızlı aksiyon menüsünde bulunur
- [ ] Silme öncesinde "Bu işlem geri alınamaz" onay dialogu gösterilir
- [ ] Silinen başvuru görünümden ve arşivden anında kaybolur
- [ ] Silinen başvuru elenme analizini etkiler (hesaplamadan çıkar)

### EP-04: Görsel Takip

**US-04:** Bir iş arayan olarak, başvurularımı aşamalar arasında taşıyabilmek istiyorum.

*Kabul Kriterleri:*
- [ ] Tüm aşama kombinasyonları arasında geçiş çalışır (web: seçim/alt sayfa; mobil v2: sürükle-bırak)
- [ ] Aşama değişikliği anında kaydedilir
- [ ] 50 kartla görünüm 2 saniyede açılır

### EP-07: Elenme Analizi & AI Pusula

**US-05:** Bir iş arayan olarak, hangi mülakat aşamasında elendiğimi görüp AI'dan somut öneri alabilmek istiyorum; böylece stratejimi geliştirebilirim.

*Kabul Kriterleri:*
- [ ] 0-4 başvuruda bilgilendirici boş ekran mesajı gösterilir
- [ ] 5-9 başvuruda aşama dağılımı görünür
- [ ] 10+ başvuruda tam elenme hunisi görünür
- [ ] AI Pusula başlık + 3-4 öneri üretir; şirket adı AI'a gönderilmez
- [ ] Silinen başvurular analizden çıkarılır

### EP-08: Bildirimler — 📱 Mobil v2

**US-06:** Çalışırken iş arayan biri olarak, kilit ekranımda hangi şirkete başvurduğum görünmesini istemiyorum.

*Kabul Kriterleri (mobil v2):*
- [ ] Kilit ekranı bildirim önizlemesinde yalnızca "Applyze — Hatırlatıcın var" görünür
- [ ] Şirket adı veya pozisyon bilgisi önizlemede yer almaz
- [ ] Bu davranış iOS ve Android'de ayrı ayrı test edilir

---

## 7. Fonksiyonel Olmayan Gereksinimler

### Performans

| Gereksinim | Hedef |
|-----------|-------|
| Görünüm açılış süresi (50 kartla) | < 2 sn |
| Uygulama soğuk başlangıç (web ilk yük) | < 3 sn |
| Arşiv araması (100+ başvuruda) | Anlık |
| AI Pusula yanıt süresi | < 6 sn (önbellekte anlık) |

### Güvenilirlik

| Gereksinim | Hedef |
|-----------|-------|
| Çökme/hata oranı | < %0.5 |
| Veri kaybı | Sıfır tolerans |
| AI dayanıklılığı | Ana model boş/hata → yedek model; kota dolunca doğru mesaj |

### Güvenlik

| Katman | Önlem |
|--------|-------|
| Kimlik doğrulama | JWT (1 saat) + yenileme token'ı (30 gün) |
| Veri izolasyonu | Satır bazlı erişim kontrolü (RLS) her tabloda |
| API güvenliği | Servis/AI anahtarları yalnızca Edge Functions'ta; istemcide değil |
| CORS | Edge Functions yalnız bilinen origin'lere izin verir (allowlist) |
| AI gizliliği | AI'a şirket adı/kişisel not gönderilmez; yalnız sayısal teşhis |

### Erişilebilirlik

- Minimum dokunma/tıklama hedefi 44pt
- Metin boyutu sistem ayarına uyar
- Ekran okuyucu için semantik etiketler

---

## 8. Tasarım Gereksinimleri

> Tasarım sisteminin tam referansı için bkz. `DesignSystem.md`. Aşağıdaki bölüm ürün gereksinimi düzeyindeki ilkeleri özetler.

### Tasarım İlkeleri

**1 — Sade ve Hızlı**
Her ekranın tek birincil aksiyonu var. Başvuru ekleme 10 saniye altında. Gürültü tolere edilmez.

**2 — Gizlilik Öncelikli**
Görünüm nötr; AI çıktılarına şirket adı sızmaz. "Şirket adların paylaşılmaz" vurgusu görünür.

**3 — Web'de Ferah, Mobilde Native (v2)**
Web'de tam genişlik, editöryel düzen. Mobil v2'de platform kuralları (iOS dili / Material 3) ve dokunsal geri bildirim.

**4 — Veriyi Görsel Yap**
Sayılar kadar görsel önemli. Analiz "tek bakışta anlama" sağlamalı.

### Navigasyon Mimarisi

| Seviye | Tip | İçerik |
|--------|-----|-------|
| L0 | Sekme Çubuğu | Gösterge Paneli (Özet/Pusula), Liste, Yolculuğum/Analiz, Profil/Ayarlar |
| L1 | Yığın Gezgini | Her sekme kendi yığınında |
| L2 | Alt Sayfa / Modal | Başvuru ekleme, detay, aşama değiştirme |
| L3 | Derin Bağlantı | `applyze://application/:id` — mobil v2 bildirim yönlendirmesi |

---

## 9. Veri Gereksinimleri

### Veri Modeli

| Tablo | Temel Alanlar | İlişkiler |
|-------|-------------|---------|
| `applications` | id, user_id FK, company_name, position, platform, source_url, current_stage_id FK, applied_at, updated_at, deleted_at | N:1 → users, N:1 → stages |
| `stages` | id, user_id FK, name, color, order, is_terminal, is_default | N:1 → users, 1:N → applications |
| `stage_history` | id, application_id FK, stage_id FK, changed_at | N:1 → applications |
| `notes` | id, application_id FK, content (maks 2000), created_at | N:1 → applications |
| `profiles` | user_id, expo_push_token (v2), notifications_enabled (v2), ... | 1:1 → users |

> `deleted_at` alanı yumuşak silme için kullanılır. Null olmayan kayıtlar tüm sorgulardan ve analizden hariç tutulur.

### Analitik Veri Toplama

**TOPLANMAYAN:**
- Başvurulan şirket veya pozisyon adları
- Kişisel notlar
- İş arama içeriği
- **AI'a gönderilen veri:** yalnız anonim sayısal teşhis (oran/sayı/alan etiketi)

---

## 10. Teknik Mimari

### Teknoloji Stack

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| Frontend Framework | Expo (React Native) + Expo Router, TypeScript, NativeWind | Tek kod tabanından **web (MVP)** + mobil (v2). Web export Vercel'de yayında. |
| Backend ve Kimlik Doğrulama | Supabase | PostgreSQL + RLS, Auth, gerçek zamanlı, cömert ücretsiz katman |
| API Katmanı | Supabase Edge Functions (Deno/TypeScript) | Platformdan bağımsız API + AI köprüsü; anahtarlar sunucuda |
| **Yapay Zekâ** | **Google Gemini (`2.5-flash` → `flash-lite` yedek)** | **Pusula içgörü, CV↔ilan uyumu, ilan→form.** Çağrılar yalnız Edge Functions üzerinden. |
| Dosya | Supabase Storage | CV PDF'leri (özel bucket + RLS) |
| Zamanlanmış İşler | pg_cron | Sessiz başvuru sorgusu (bildirim adayı — mobil v2) |
| **Web Dağıtım** | **Vercel** (`npx expo export -p web` → `dist`) | **MVP canlı yayın.** Her `main` merge'i otomatik deploy. |
| Mobil Dağıtım | Expo EAS Build → App Store + Google Play | **v2'ye ertelendi** |
| Alan adı / E-posta | Cloudflare (DNS) · Resend (SMTP, custom e-posta) | Üretim kimlik e-postaları, Supabase mail limiti aşıldı |
| Versiyon Kontrolü | GitHub | Dal: main + feature |

### AI Mimari Akışı

```
Kullanıcı (Expo Web) → giriş token'ı (Bearer)
        ▼
Supabase Edge Functions (Deno API) — şirket adı GÖNDERİLMEDEN, yalnız sayısal teşhis
        ▼
Google Gemini API (2.5-flash → flash-lite yedek)
```

- **API anahtarı asla istemcide değildir** — tüm Gemini çağrıları Edge Function üzerinden.
- **Gizlilik önceliklidir** — AI'a şirket adları/kişisel notlar gönderilmez.

### Veritabanı Güvenliği

```sql
-- Satır bazlı erişim kontrolü — her kullanıcı sadece kendi verisine erişir
CREATE POLICY "own_applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id);
-- Tüm tablolara aynı mantıkla politika uygulanır
```

## 11. Teknik Kısıtlamalar ve Bağımlılıklar

### Kısıtlamalar

| Kısıtlama | Etki | Çözüm |
|----------|------|-------|
| ~~Otomatik bilgi çekme teknik riski~~ | Gerçekleşti (Mayıs 2026) | v2'ye ertelendi; yerine AI ilan→form (bkz. §13) |
| Gemini ücretsiz kota | Yoğun kullanımda 429 | Önbellek + doğru hata mesajı + gerekirse faturalandırma |
| Supabase varsayılan mail limiti | Saatte ~2 mail | Custom SMTP (Resend + il9u.com) |
| Supabase ücretsiz başlangıç | 500+ kullanıcıda limit aşılabilir | Pro plan ($25/ay) hazırda |
| Mobil mağaza süreçleri (Apple/Google) | v2'ye ertelendi | Web MVP ile bağımsız; mobil yol haritasında |

### Dış Bağımlılıklar

| Bağımlılık | Tip | Risk |
|-----------|-----|------|
| Supabase | Backend/Auth/DB/Functions | Orta — servis kesintisi olasılığı |
| Google Gemini | AI çekirdek | Orta — kota/model davranışı (yedek model ile azaltıldı) |
| Vercel | Web dağıtım | Düşük |
| Resend / Cloudflare | E-posta / DNS | Düşük |

---

## 12. Yayın Kabul Kriterleri

### Fonksiyonel Kabul (Web MVP)

| # | Kriter | Doğrulama | Sonuç |
|---|--------|-----------|-------|
| 1 | Email ile kayıt ve giriş çalışıyor | Canlı URL testi | ☐ |
| 2 | Google OAuth çalışıyor | Canlı URL testi | ☐ |
| 3 | İlan linkinden/metninden AI otomatik doldurma çalışıyor | 3-5 ilanla test | ☐ |
| 4 | Manuel başvuru ekleme çalışıyor | Form doldurma ve kaydetme | ☐ |
| 5 | Excel/CSV toplu içe aktarma çalışıyor (tekrar kontrollü) | Örnek dosya ile | ☐ |
| 6 | Aşama görünümü 10+ başvuruda çalışıyor | 10 başvuruyla test | ☐ |
| 7 | Aşama güncelleme tüm kombinasyonlarda çalışıyor | Tüm geçişlerde test | ☐ |
| 8 | Arşiv araması 10+ başvuruda anlık çalışıyor | Farklı arama terimleriyle | ☐ |
| 9 | Gösterge paneli metrikleri doğru hesaplanıyor | Bilinen veri setiyle | ☐ |
| 10 | AI Pusula içgörü üretiyor (şirket adı göndermeden) | Edge Function log + çıktı | ☐ |
| 11 | CV ↔ ilan uyum analizi skor + gerekçe üretiyor | Örnek CV + ilan ile | ☐ |
| 12 | Tekrarlayan başvuru uyarısı tetikleniyor | Aynı kayıt iki kez | ☐ |
| 13 | Başvuru silme onay dialogu gösteriliyor | Silme akışı testi | ☐ |
| 14 | Silinen başvuru elenme analizinden çıkıyor | Analiz ekranı doğrulama | ☐ |
| 15 | Elenme analizi 0/5/10 eşiklerinde doğru içerik gösteriyor | Her eşikte test | ☐ |

### Mobil Kabul — 📱 v2

| # | Kriter | Sonuç |
|---|--------|-------|
| 1 | Push bildirim iOS/Android'e ulaşıyor | v2 |
| 2 | Bildirim önizlemesi şirket adı içermiyor | v2 |
| 3 | EAS production build App Store/Play'e gönderiliyor | v2 |

---

## 13. Kapsam Dışı Kararlar

| Karar | Gerekçe | Yeniden Değerlendirme |
|-------|---------|----------------------|
| **Mobil (iOS/Android) yayını yok** | Bitirme için web deploy yeterli; kaynak ve mağaza süreçleri odağı dağıtırdı. Kod tabanı mobile hazır tutuldu. | **v2: EAS build → App Store + Google Play** |
| **Push bildirim yok** | Mobil-özel altyapı; web MVP'de in-app hatırlatma yeterli | v2: Expo Notifications (mobil) |
| LinkedIn/Kariyer.net/Youthall otomatik bilgi çekme (scraping) yok | PerimeterX bot koruması veri merkezi IP'lerini engelliyor (HTTP 403) | v2: proxy servisi veya resmi API |
| İlan toplama yok | Platform API'si yok | v3: ortaklık stratejisi |
| AI ilan *tavsiye/öneri motoru* yok | Veri birikimi yetersiz. (Not: AI **içgörü/Pusula** ve **CV uyumu** MVP'de **VAR**.) | v2: öneri motoru |
| Seri/streak sistemi yok | Kullanıcı psikolojisiyle çelişiyor | Kalıcı red |
| Sosyal özellikler yok | Gizlilik öncelikli tasarımla çelişiyor | v3: opsiyonel |
| CV oluşturucu yok | Farklı ürün kategorisi | Bağımsız ürün fırsatı |
| Tam çevrimdışı destek yok | Supabase gerçek zamanlı bağlantı gerektirir | v2 |

---

## 14. Sözlük

| Terim | Tanım |
|-------|-------|
| PRD | Ürün Gereksinimleri Dokümanı — geliştirici referansı |
| MoSCoW | Olmazsa Olmaz / Olmalı / Olsa İyi / Olmayacak — önceliklendirme yöntemi |
| Epic | İlgili özellikleri gruplayan üst düzey iş birimi |
| Kullanıcı Hikayesi | Kullanıcı perspektifinden gereksinim: "Bir X olarak, Y için Z yapmak istiyorum" |
| Kabul Kriteri | Bir özelliğin tamamlandığını kanıtlayan ölçülebilir koşullar |
| RLS (Satır Bazlı Erişim Kontrolü) | Her kullanıcının yalnızca kendi verisine erişmesini sağlayan güvenlik katmanı |
| Edge Function | Supabase'in sunucusuz Deno fonksiyonu — API + AI köprüsü |
| Pusula | Başvuru verisinden AI ile üretilen içgörü/öneri ekranı |
| Otomatik Bilgi Çekme (Scraping) | İlan sayfasından verinin otomatik çekilmesi — KAPSAM DIŞI (v2) |
| AI Otomatik Doldurma (parse-job) | Kullanıcının verdiği ilan metnini AI ile yapılandırma (scraping değil) |
| Yumuşak Silme | Veriyi silmek yerine "silinmiş" olarak işaretleme |
| Elenme Hunisi | Başvuru sürecindeki aşama geçiş oranlarını gösteren görsel |
| EAS | Expo Application Services — mobil mağaza dağıtım altyapısı (v2) |

---

*Applyze PRD — v2.1 | Haziran 2026 | Web MVP canlı, mobil v2'ye ertelendi*
