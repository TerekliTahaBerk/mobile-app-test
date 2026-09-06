# Store submission checklist

Tekrarla 1.0 — App Store and Google Play submission source of truth.

## Production identity

| Field | Final value | State |
| --- | --- | --- |
| Public app/display name | **Tekrarla** | In `app.json` (`name`, `CFBundleDisplayName`) |
| iOS bundle identifier | `com.tekrarla.app` | Final; in production config |
| Android application ID | `com.tekrarla.app` | Final; in production config |
| Expo slug and URL scheme | `tekrarla` | Final |
| Release/version | `1.0.0`; store build numbers managed by EAS | Configured |
| Category | Education | Ready to enter |
| Primary language | Turkish (`tr-TR`) | Ready to enter |
| Copyright | `© 2026 Taha Berk Terekli` | Owner to confirm account/legal spelling |

`com.tekrarla.app` is intentionally retained. It matches the settled Tekrarla
name, is already used by release/observability identity, and changing it would
create a separate store application. The reverse-DNS string is an immutable
technical identifier; it is not evidence that the registrable domain is owned.
Release operations must verify control in both developer consoles before the
first upload. Trademark clearance and store-name reservation remain external
legal/product gates.

## Public URLs

| Store field | Final URL | Repo route | Verification |
| --- | --- | --- | --- |
| Privacy Policy URL | `https://tekrarla.app/gizlilik` | `/gizlilik` | HTTP 200 observed 2026-09-04; re-check content after production deploy |
| Support URL | `https://tekrarla.app/destek` | `/destek` | HTTP 200 observed 2026-09-04; support route and copy are in this repo |
| Marketing URL | `https://tekrarla.app/` | `/` | Optional; use only after the landing experience is approved |

Both public routes work without an account or learner database. A 200 status
alone is insufficient: release operations must open each URL in a signed-out
browser after deploying the release commit and capture dated evidence.

## Store copy — Turkish

### Subtitle (App Store, maximum 30 characters)

`TYT Sosyal'i kısa turlarla çöz`

### Short description (Google Play, maximum 80 characters)

`TYT Sosyal Tarih sorularını kısa turlarla çöz, tekrar et ve ilerlemeni izle.`

### Promotional text (App Store, maximum 170 characters)

`Kısa Tarih turlarıyla çalış, yanlışlarını tekrar et ve günlük İz'ini koru. Hesap açmadan, kendi cihazında ilerle.`

### Keywords (App Store, maximum 100 characters)

`TYT,sosyal,tarih,YKS,soru,tekrar,ders,çalışma,sınav,yanlış defteri`

### Full description

> TYT Sosyal Bilimler Tarih konularına kısa ve etkileşimli turlarla çalış.
>
> Tekrarla, sıradaki çalışmanı doğrudan gösterir. Çoktan seçmeli, doğru-yanlış,
> boşluk doldurma, eşleştirme, sıralama ve bilgi kartı etkinliklerini tamamla;
> açıklamayı gör ve yanlışlarını tekrar planına al.
>
> • Ünite yolunda adım adım ilerle
>
> • XP ve konu hâkimiyetini takip et
>
> • Yanlış defteriyle zorlandığın noktalara dön
>
> • Günlük İz ve haftalık özetle çalışma düzenini gör
>
> • İstersen cihazında çalışma hatırlatması planla
>
> Hesap gerekmez. Profilin ve öğrenme kayıtların yalnızca cihazında saklanır;
> buluta yedeklenmez. Uygulamayı silersen veya cihazını kaybedersen ilerlemen
> geri getirilemez. Temel öğrenme deneyimi çevrimdışı çalışır.
>
> İlk sürüm TYT Sosyal Bilimler kapsamındaki Tarih içeriğine odaklanır.

Copy must not mention LGS, KPSS, social competition, score improvement, paid
features, or unavailable subjects. Revalidate character limits in the store UI.

### Release notes

`İlk Tekrarla sürümü: TYT Sosyal Bilimler Tarih turları, yanlış defteri, tekrar planı, XP, İz ve haftalık çalışma özeti.`

## Age and content-rating answers

The intended audience is 13+. The app has no account, chat, user-generated
content, advertising, purchases, unrestricted web access, location, gambling,
violence, sexual content, profanity, drugs, or horror in the production pilot.

- Apple: answer every content descriptor as none and select the store-generated
  rating; do not manually promise a rating before App Store Connect calculates it.
- Google Play: Education category; declare target age 13+ and answer the IARC
  questionnaire from the actual production feature set.
- Do not select children under 13. If League, Plus, external links, remote
  reporting, or other gated features ship, reassess before upload.

## Screenshot production brief

Capture in Turkish, `productionPilot` mode, with production-approved icon/Dino
art and plausible non-identifying sample data. Do not show preview-only League,
Plus, hearts economy, draft labels, notifications, status-bar personal data, or
claims absent from the build.

1. Home — one obvious daily action: “Bugünkü çalışmana başla.”
2. Unit path — visible progression: “Tarih yolunda adım adım ilerle.”
3. Exercise and explanation — “Çöz, geri bildirimi hemen gör.”
4. Completion — earned XP: “Kısa turu tamamla.”
5. Mistake/review surface — “Yanlışlarına doğru zamanda dön.”
6. Profile/weekly summary — “İlerlemeni cihazında takip et.”

Required deliverables: current App Store Connect iPhone display classes (3–10
images per required class), Google Play phone screenshots (2–8), and a 1024×500
Play feature graphic. `supportsTablet` is false, so no iPad set. Store size rules
change; confirm current console requirements at capture time.

## Support and review copy

Support contact: `terekli@tahaberk.com`. The public support page explains local
storage, irreversible reset, notifications, offline use, and safe bug-report
details. The privacy notice uses the settled Tekrarla name and remains the
canonical disclosure for data handling.

App Review / Play reviewer note:

> Tekrarla is a Turkish, device-local exam-preparation app. No account, login,
> purchase, ad, or network connection is required for the core flow. Start the
> app, complete onboarding, tap the home action, answer a lesson, and finish the
> round. This build exposes TYT Sosyal Bilimler Tarih only. League, Plus, and
> limited-hearts experiences are disabled in the production pilot. Learner data
> remains on device and can be erased from Profil → Ayarlar → İlerlemeyi sıfırla.

## Asset and legal gates

The exact inventory and checksums are in `docs/ASSET_RIGHTS.md`.

- [x] All bundled custom visuals and fonts inventoried.
- [x] Font license evidence identified (OFL 1.1 in exact installed packages).
- [ ] App icon/splash creation or assignment evidence approved by legal/product.
- [ ] Dino creation or assignment evidence approved by legal/product.
- [ ] Tekrarla trademark clearance and store-name reservation recorded.
- [ ] Final visual approval confirms no legacy “Online Dershanem” mark remains.

The unchecked rows require evidence that cannot be inferred from files. They
block submission but do not block merging this repo-side preparation.

## Submission runbook

- [ ] Deploy the release commit; verify the Privacy and Support URLs signed out.
- [x] Run `npm run lint`, `npm run typecheck`, and `npm test` (2026-09-04).
- [x] Produce a production-mode static export and verify `/gizlilik` and
  `/destek` contain their server-rendered copy (2026-09-04).
- [ ] Run `npm run quality:release` and resolve every release gate.
- [ ] Build both `eas build --profile production` targets and record build URLs.
- [ ] Complete `docs/NATIVE_RELEASE_ACCEPTANCE.md` on physical iOS and Android devices.
- [ ] Reconcile Apple App Privacy and Play Data safety answers with
  `docs/PRIVACY_RELEASE_PACKAGE.md` and the actual Sentry gate.
- [ ] Upload approved screenshots and copy; complete ratings in both consoles.
- [ ] Attach trademark, custom-asset rights, privacy/legal, and release approvals.
- [ ] Record reviewer account as “not required” and paste the review note above.

## Completion state

Repo-side identity, metadata copy, rating inputs, screenshot brief, support
copy, privacy copy, and route implementation are complete. Submission remains
blocked by custom-asset ownership evidence, trademark/legal approval, deployment
content verification, current-console forms, screenshots, and physical-device
release acceptance.
