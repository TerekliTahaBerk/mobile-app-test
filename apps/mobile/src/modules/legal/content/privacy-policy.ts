export const PRIVACY_POLICY_VERSION = '2026-09-04';

export type PrivacyPolicySection = {
  body: string;
  heading: string;
};

/**
 * The public, learner-facing privacy notice. The in-app and exported web route
 * render this same source so store copy cannot drift from the application.
 */
export const PRIVACY_POLICY_SECTIONS: readonly PrivacyPolicySection[] = [
  {
    heading: 'Veri sorumlusu',
    body:
      'Online Dershanem, Taha Berk Terekli tarafından işletilir. Gizlilik ve kişisel veri taleplerin için terekli@tahaberk.com adresine yazabilirsin.',
  },
  {
    heading: 'Bu cihazda tutulan veriler',
    body:
      'Hesap açılmaz. Seçtiğin görünen ad ve avatar; sınav, sınıf, hedef yıl, alan, günlük hedef ve başlangıç tercihleri; ders oturumları ve verdiğin yanıtlar; doğru-yanlış kayıtları, XP, İz, konu hâkimiyeti, tekrar planı, yanlış defteri, soru bildirimleri ve günlük çalışma tarihleri uygulamanın bu cihazdaki SQLite veritabanında saklanır. Hatırlatma tercihin ve saatin de cihazda tutulur; bildirimler cihaz tarafından planlanır ve push bildirimi için cihaz anahtarı oluşturulmaz.',
  },
  {
    heading: 'Amaç ve hukuki sebep',
    body:
      'Bu veriler çalışma deneyimini sunmak, kaldığın yerden devam ettirmek, ilerlemeni ve tekrarlarını hesaplamak, hatırlatma göstermek, bildirdiğin soruları cihazda kaydetmek ve verilerini sıfırlama isteğini yerine getirmek için işlenir. Bu işlemler, talep ettiğin uygulama hizmetinin kurulması ve sunulması için gereklidir. Bildirim izni yalnızca hatırlatmayı sen açtığında istenir ve cihaz ayarlarından geri alınabilir.',
  },
  {
    heading: 'Aktarım ve hata raporları',
    body:
      'Öğrenme kayıtların, görünen adın ve ham yanıtların bir hesaba veya bulut yedeğine aktarılmaz. Yayındaki sürümde üçüncü taraf analytics kullanılmaz. Üretim hata raporlama servisi ayrıca etkinleştirilirse yalnızca uygulama sürümü, işletim ortamı, hata bilgisi ve kişisel veriden arındırılmış teknik olay kırıntıları Sentry’ye iletilebilir. Görünen ad, ham veya serbest metin yanıtı, iletişim bilgisi, istek adresi, IP, kullanıcı ve cihaz ya da kurulum kimliği gönderilmek üzere seçilmez. Bu servis; aktarım ülkesi, saklama süresi, sözleşme ve çocuk kullanıcı değerlendirmesi tamamlanmadan etkinleştirilmez ve etkinleştirilmeden önce bu metin güncellenir.',
  },
  {
    heading: 'Çocuk ve genç kullanıcılar',
    body:
      'Pilot, lise düzeyindeki TYT Sosyal öğrencileri için ve 13 yaş ve üzeri kullanıcılar hedeflenerek tasarlanmıştır. Doğum tarihi toplanmaz. 18 yaşından küçüksen uygulamayı velin veya yasal temsilcinle birlikte değerlendirmeni öneririz. Mevcut pilotta hesap, reklam, profil oluşturma, davranışsal reklamcılık, satış veya üçüncü taraf ürün analitiği yoktur. Veli onayı gerektirecek hesap, bulut aktarımı, kişiselleştirilmiş reklam ya da isteğe bağlı analytics özelliği, doğrulanmış veli yaklaşımı kurulmadan açılamaz.',
  },
  {
    heading: 'Saklama, silme ve güvenlik',
    body:
      'Yerel veriler sen Ayarlar’dan “İlerlemeyi sıfırla” işlemini tamamlayana veya uygulamayı cihazdan silene kadar tutulur. Bulut yedeği ve hesap kurtarma olmadığı için uygulamayı silersen ya da cihazını kaybedersen ilerlemen geri getirilemez. Sıfırlama; profil, oturum, yanıt, ilerleme, XP, İz, hâkimiyet, tekrar, yanlış, soru bildirimi ve hatırlatma verilerini temizler ve planlı bildirimleri iptal eder.',
  },
  {
    heading: 'Hakların',
    body:
      'KVKK kapsamındaki haklarınla ilgili olarak kişisel verinin işlenip işlenmediğini öğrenme, işleme hakkında bilgi isteme, amacına uygun kullanılıp kullanılmadığını öğrenme, aktarılan tarafları bilme, düzeltme, silme veya yok etme isteme, bu işlemlerin aktarılan taraflara bildirilmesini isteme, yalnız otomatik analiz sonucu aleyhine bir sonuca itiraz etme ve hukuka aykırı işleme nedeniyle zararın giderilmesini isteme haklarına sahipsin. Talebini terekli@tahaberk.com adresine iletebilirsin.',
  },
  {
    heading: 'Değişiklikler',
    body:
      'Uygulamanın veri davranışı değişirse bu metin ve sürüm tarihi yayın öncesinde güncellenir. Önemli bir değişiklik uygulama içinde duyurulur; gerekli olduğunda yeniden izin istenir.',
  },
];
