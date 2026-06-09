// app/legal/privacy.tsx — Gizlilik Politikası
import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";

// Bu üç değeri kendine göre düzenleyebilirsin:
const CONTROLLER = "Applyze (Başak İlgü)";
const CONTACT_EMAIL = "support@il9u.com";
const UPDATED = "6 Haziran 2026";

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 13 4 L 7 10 L 13 16" fill="none" stroke="#1F1B16" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function H({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 15, color: "#1F1B16", fontFamily: "Inter_600SemiBold", marginTop: 22, marginBottom: 8, lineHeight: 21 }}>
      {children}
    </Text>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 14, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 22, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 52 }}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={{ padding: 6, marginRight: 4 }}>
            <BackIcon />
          </Pressable>
          <Text style={{ fontSize: 17, color: "#1F1B16", fontFamily: "Inter_600SemiBold" }}>
            Gizlilik Politikası
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 12, color: "#8A8278", fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 4 }}>
          Son güncelleme: {UPDATED}
        </Text>

        <P>
          Bu Gizlilik Politikası, Applyze uygulamasını ("Uygulama") kullandığında kişisel verilerinin nasıl
          işlendiğini açıklar. Veri sorumlusu: {CONTROLLER}. Sorularını {CONTACT_EMAIL} adresine iletebilirsin.
          Uygulamayı kullanarak bu politikada anlatılan işleme faaliyetlerini kabul etmiş olursun.
        </P>

        <H>1. İşlediğimiz veriler</H>
        <P>• Hesap bilgileri: e-posta adresin ve şifren (şifre, kimlik doğrulama sağlayıcımızda şifrelenmiş olarak tutulur; biz düz metin şifreni görmeyiz).</P>
        <P>• Başvuru verileri: eklediğin şirket adı, pozisyon, şehir, platform, ilan bağlantısı, aşama ve tarihler.</P>
        <P>• Notların: başvurulara eklediğin serbest metinler.</P>
        <P>• Bildirim tercihleri: bildirimleri açtıysan cihazının anonim bildirim jetonu (push token) ve bildirim saat aralığı tercihin.</P>
        <P>• Teknik veriler: hizmetin çalışması için gereken temel oturum bilgileri.</P>

        <H>2. Verileri ne için işliyoruz</H>
        <P>• Hizmeti sunmak: başvurularını kaydetmek, listelemek, aşamalarını takip etmek.</P>
        <P>• İçgörü üretmek: süreç istatistiklerini yorumlayıp sana öneriler sunmak (aşağıda "Yapay zekâ" bölümüne bakın).</P>
        <P>• Hatırlatma: bildirimleri açtıysan, uzun süredir hareketsiz başvurular için sana gizliliğe duyarlı hatırlatmalar göndermek (bildirimde şirket adı yer almaz).</P>

        <H>3. Yapay zekâ önerileri ve gizlilik</H>
        <P>
          Öneriler için başvuru verinden GİZLİLİĞE UYGUN, yalnızca sayısal bir özet üretilir (oranlar, aşama
          dağılımı, platform ve alan istatistikleri) ve bu özet yorumlanması için Google Gemini servisine gönderilir.
          ŞİRKET ADLARIN, kişisel notların veya kimliğini açık eden bilgiler bu servise GÖNDERİLMEZ.
        </P>

        <P>
          Ayrıca "ilan metninden otomatik doldurma" ve "CV–ilan uyum analizi" özelliklerini
          KULLANDIĞINDA, yapıştırdığın ilan metni ve (eklediysen) CV metnin yalnızca senin için
          analiz üretmek üzere aynı yapay zekâ servisine gönderilir. Bu özellikleri kullanmazsan
          bu veriler gönderilmez; CV metnin yalnızca senin hesabında saklanır.
        </P>

        <H>4. Hukuki dayanak (KVKK / GDPR)</H>
        <P>
          Verilerini, seninle kurulan kullanıcı sözleşmesinin ifası ve açık rızan kapsamında işleriz (KVKK m.5;
          GDPR m.6). Bildirimler gibi isteğe bağlı özellikler yalnızca sen etkinleştirdiğinde çalışır ve istediğin an kapatabilirsin.
        </P>

        <H>5. Hizmet sağlayıcılar ve yurt dışı aktarım</H>
        <P>• Supabase: barındırma, kimlik doğrulama ve veritabanı.</P>
        <P>• Google Gemini: yalnızca anonim sayısal özetin yorumlanması.</P>
        <P>• Expo (bildirim altyapısı): yalnızca bildirim gönderimi için, bildirimi açtıysan.</P>
        <P>
          Bu sağlayıcılar verileri yurt dışındaki sunucularda işleyebilir. Uygulamayı kullanarak bu aktarıma
          ilişkin bilgilendirildiğini ve kabul ettiğini onaylarsın.
        </P>

        <H>6. Saklama süresi</H>
        <P>
          Verilerini hesabın aktif olduğu sürece saklarız. Hesabını sildiğinde, başvuruların, notların ve profil
          bilgilerin makul bir süre içinde kalıcı olarak silinir.
        </P>

        <H>7. Güvenlik</H>
        <P>
          Veriler, her kullanıcının yalnızca kendi kayıtlarına erişebildiği satır bazlı erişim kontrolü (RLS) ile
          korunur ve iletişim şifreli bağlantı üzerinden yapılır. Hiçbir sistem %100 güvenli olmasa da verini
          korumak için makul teknik ve idari tedbirleri uygularız.
        </P>

        <H>8. Haklarmın</H>
        <P>
          KVKK m.11 ve GDPR kapsamında; verilerine erişme, düzeltme, silme ve işlemeye itiraz etme haklarına
          sahipsin. Hesabını ve tüm verilerini uygulama içinden Profil ekranındaki "Hesabı sil" seçeneğiyle
          doğrudan silebilirsin. Diğer talepler için {CONTACT_EMAIL} adresine yazabilirsin.
        </P>

        <H>9. Çocukların gizliliği</H>
        <P>
          Uygulama 18 yaşından küçükler için tasarlanmamıştır ve bilerek bu yaş altından veri toplamayız.
        </P>

        <H>10. Değişiklikler</H>
        <P>
          Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde uygulama içinde bilgilendirme yaparız;
          en güncel sürüm her zaman bu sayfada yer alır.
        </P>

        <H>11. İletişim</H>
        <P>Her türlü soru ve talep için: {CONTACT_EMAIL}</P>
      </ScrollView>
    </View>
  );
}
