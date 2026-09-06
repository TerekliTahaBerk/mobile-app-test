export const SUPPORT_CONTACT = 'terekli@tahaberk.com';

export type SupportSection = {
  body: string;
  heading: string;
};

/** Public support copy shared by the native app and static web export. */
export const SUPPORT_SECTIONS: readonly SupportSection[] = [
  {
    heading: 'Bize ulaş',
    body: `Tekrarla ile ilgili yardım almak, hata bildirmek veya gizlilik talebi iletmek için ${SUPPORT_CONTACT} adresine yazabilirsin. Mesajında kullandığın cihaz modelini, işletim sistemi sürümünü ve sorunu yaşadığın ekranı belirt; görünen adını, yanıtlarını veya başka kişisel bilgileri gönderme.`,
  },
  {
    heading: 'İlerlemem nerede?',
    body:
      'Tekrarla hesap açmaz ve ilerlemeni buluta yedeklemez. Profilin, ders geçmişin, XP, İz, tekrarların ve yanlışların yalnızca kullandığın cihazda tutulur. Uygulamayı silersen veya cihazını kaybedersen bu kayıtlar geri getirilemez.',
  },
  {
    heading: 'İlerlemeyi sıfırla',
    body:
      'Profil → Ayarlar → İlerlemeyi sıfırla yolunu izle. Onaydan sonra profilin, ders kayıtların, XP, İz, tekrarların, yanlışların, soru bildirimlerin ve planlanmış hatırlatmaların bu cihazdan silinir. Bu işlem geri alınamaz.',
  },
  {
    heading: 'Bildirimler çalışmıyor',
    body:
      'Profil → Ayarlar bölümünde hatırlatmayı aç ve bir saat seç. Telefon ayarlarında Tekrarla bildirim izninin açık olduğunu kontrol et. Hatırlatmalar cihazda planlanır; internet bağlantısı veya push hesabı gerekmez.',
  },
  {
    heading: 'Çevrimdışı kullanım',
    body:
      'Dersler ve ilerleme cihazda çalışır. İlk kurulumdan sonra temel öğrenme döngüsü için internet bağlantısı gerekmez. Mağaza güncellemeleri ve destek e-postası için bağlantı gerekir.',
  },
];
