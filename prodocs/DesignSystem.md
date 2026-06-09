# Design System — Applyze

Applyze'ın görsel dili sakin, editöryel ve "pusula" metaforu etrafında kurulur. Amaç: iş arama stresini artırmadan, güven veren bir yön duygusu yaratmak.

---

## 1. Marka Konsepti

- **Metafor:** Pusula (kariyer pusulası) — yön bulma, sakinlik, ilerleme.
- **Ton:** Sakin, bilge, abartısız. Sahte motivasyon yok; nazik ve somut.
- **His:** Editöryel, ferah, bol beyaz alan; "uygulama" değil "yoldaş" hissi.

---

## 2. Renk Paleti

### Ana yüzeyler
| Rol | Hex | Kullanım |
|---|---|---|
| Cream (arka plan) | `#FAF8F4` | Uygulamanın ana açık zemini |
| Kart / yüzey | `#FFFFFF` | Kartlar, satırlar |
| Kenarlık | `#EBE7DF` | İnce ayraçlar, kart kenarı |
| Yeşil tint | `#F1F4EF` | Vurgu zemini, ilerleme çubuğu izi |

### Koyu / marka yeşilleri
| Rol | Hex | Kullanım |
|---|---|---|
| Splash / koyu zemin | `#1A2622` | Açılış ekranı, koyu paneller |
| Sage (koyu) | `#243530` | Onboarding zemini, derinlik |
| Sage (aksan) | `#3D5A47` | Birincil yeşil aksan, dolu çubuklar, rozetler |

### Metin
| Rol | Hex | Kullanım |
|---|---|---|
| Ink (ana metin) | `#1F1B16` | Başlıklar ve gövde metni |
| Muted | `#5C5650` | İkincil metin |
| Faint | `#8A8278` | Etiketler, ipuçları, pasif |

### Açık yeşil / vurgu
| Rol | Hex | Kullanım |
|---|---|---|
| Sage light | `#B8C9BD` | Koyu zeminde vurgu kelimeler, ikon halesi |
| Warm taupe | `#B8B0A4` | Koyu zeminde ikincil metin |
| Hata/uyarı | `#A96458` | Form hataları (yumuşak kiremit) |

> Aşama (stage) renkleri veriden gelir; özel aşamalara renk atanabilir. Standart aşamalar sakin yeşil/nötr tonlarda tutulur.

---

## 3. Tipografi

**Font ailesi:** Inter (`@expo-google-fonts/inter`).

| Ağırlık | Token | Kullanım |
|---|---|---|
| 300 Light | `Inter_300Light` | Büyük başlıklar, şiirsel/editöryel ifadeler (ör. "İlk açılan kapı.") |
| 400 Regular | `Inter_400Regular` | Gövde metni, açıklamalar |
| 500 Medium | `Inter_500Medium` | Butonlar, etiketler, vurgulu satırlar |
| 600 SemiBold | `Inter_600SemiBold` | Kart başlıkları, sayısal vurgular |

**Ölçek & kurallar:**
- Büyük başlık: 32–36, Light, `letterSpacing: -0.5` (sıkı, zarif).
- Bölüm etiketi: 11–12, Medium, `letterSpacing: 1.4–3.2`, BÜYÜK HARF, faint renk.
- Gövde: 13–15, Regular, `lineHeight ~21`.
- Sayısal kahraman (ör. "157 başvuru"): 34, Light.

---

## 4. Düzen & Boşluk

- Sayfa yatay kenar boşluğu: **20–24 px**.
- Kart köşe yarıçapı: **12–14 px**; buton: **12 px**.
- Kart içi padding: **14–16 px**; satırlar arası ayraç: `1px #EBE7DF`.
- Bol dikey boşluk; bölümler arası ~28 px.
- İçerik telefon genişliğine göre tasarlanır; **web'de tam genişlik** kullanılır (dar sütun değil).

---

## 5. Component Kuralları

| Component | Kural |
|---|---|
| **Card** | Beyaz zemin, `#EBE7DF` kenarlık, 12–14 yarıçap. İçerik satırları ince ayraçla bölünür. |
| **Header** | Sade; başlık + geri/kapat. Geri butonu güvenli: gidilecek yer yoksa ana sekmeye düşer. |
| **Badge** | Aşama ve platform için; özel aşamalarda özel renk/etiket. |
| **SettingRow** | Profil/ayar satırları; sağ ok ya da değer. |
| **DatePicker** | Saf RN takvim; bugün/dün kısayolu. |
| **StageUpdateSheet** | Aşama seçimi + araya özel aşama ekleme/silme. |
| **CompassMark** | Marka ikonu; `filled` / `glow-light` / `glow-dark` varyantları, hale rengi `#3D5A47`. |
| **Buton (birincil)** | Koyu zeminde `#FAF8F4` dolgu / açık zeminde `#1F1B16` dolgu; basınca hafif scale + opacity. |
| **İlerleme çubuğu** | İz `#F1F4EF`, dolgu `#3D5A47`, 8px yükseklik, 4px yarıçap. |

---

## 6. Hareket (Motion)

- İnce ve amaçlı: fade + hafif scale (700–800ms, `easing: out-cubic`).
- Geçişler `slide_from_right`; modal ekranlar `slide_from_bottom`.
- Basış geri bildirimi: `scale 0.99` + `opacity 0.92`. Gösterişten kaçınılır.

---

## 7. İçerik & Dil Tonu

- Türkçe, sıcak ama sade. Kullanıcıya **"sen"** diye hitap.
- Yargılamayan dil: "başarısızsın" yerine süreç/uyum çerçevesi.
- AI çıktıları somut ve eylem odaklı; abartı yok.
- Gizlilik vurgusu görünür: "Şirket adların paylaşılmaz."
