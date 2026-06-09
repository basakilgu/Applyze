// app/legal/terms.tsx — Kullanım Koşulları
import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";

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

export default function TermsScreen() {
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
            Kullanım Koşulları
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 12, color: "#8A8278", fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 4 }}>
          Son güncelleme: {UPDATED}
        </Text>

        <P>
          Applyze uygulamasını ("Uygulama") kullanarak bu Kullanım Koşullarını kabul etmiş olursun. Koşulları
          kabul etmiyorsan lütfen Uygulamayı kullanma.
        </P>

        <H>1. Hizmet</H>
        <P>
          Applyze, iş başvurularını tek bir yerde kaydetmene, aşamalarını takip etmene ve sürecine dair içgörüler
          almana yardımcı olan kişisel bir takip aracıdır. Uygulama bir işe alım garantisi vermez.
        </P>

        <H>2. Hesabın</H>
        <P>
          Hesabını ve giriş bilgilerini korumaktan sen sorumlusun. Verdiğin bilgilerin doğru olduğunu ve hesabını
          yalnızca kendin için kullandığını kabul edersin.
        </P>

        <H>3. Kabul edilebilir kullanım</H>
        <P>
          Uygulamayı yalnızca yasalara uygun ve kişisel amaçlarla kullanırsın. Hizmeti kötüye kullanmamayı,
          güvenliğini aşmaya çalışmamayı ve başkalarının haklarını ihlal eden içerik girmemeyi kabul edersin.
        </P>

        <H>4. Senin verilerin</H>
        <P>
          Uygulamaya girdiğin başvuru, not ve diğer içerikler sana aittir. Bu verileri yalnızca hizmeti sana
          sunmak için işleriz; ayrıntılar Gizlilik Politikası'nda yer alır.
        </P>

        <H>5. Yapay zekâ önerileri</H>
        <P>
          Uygulamadaki öneriler bilgilendirme ve yönlendirme amaçlıdır; kesin sonuç ya da kariyer/hukuki tavsiye
          niteliği taşımaz. Kararlarını kendi değerlendirmenle vermelisin.
        </P>

        <H>6. Hizmetin sunumu</H>
        <P>
          Uygulama "olduğu gibi" sunulur. Kesintisiz veya hatasız çalışacağına dair garanti verilmez. Yürürlükteki
          yasaların izin verdiği ölçüde, kullanımından doğabilecek dolaylı zararlardan sorumlu tutulamayız.
        </P>

        <H>7. Hesabın sonlandırılması</H>
        <P>
          Dilediğin an hesabını Profil ekranındaki "Hesabı sil" seçeneğiyle kapatabilirsin. Koşulların ihlali
          halinde erişimini sınırlandırabilir veya sonlandırabiliriz.
        </P>

        <H>8. Değişiklikler</H>
        <P>
          Bu koşulları zaman zaman güncelleyebiliriz. Güncel sürüm her zaman bu sayfada yer alır; kullanmaya
          devam etmen güncel koşulları kabul ettiğin anlamına gelir.
        </P>

        <H>9. Uygulanacak hukuk ve iletişim</H>
        <P>
          Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Sorularını {CONTACT_EMAIL} adresine iletebilirsin.
        </P>
      </ScrollView>
    </View>
  );
}
