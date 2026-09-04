# Store submission checklist

Tekrarla — App Store (iOS) and Google Play (Android) release preparation.

This document separates **repo-side items** (engineering-owned, can be completed
in this repository) from **external items** (require a human owner outside the
repo: legal, design, product, App Store Connect / Play Console).

---

## Part 1 — Asset and legal inventory

### App icon

| Asset | Path | Status | Action required |
| --- | --- | --- | --- |
| iOS icon (1024 × 1024 px, no alpha) | `apps/mobile/assets/images/icon.png` | **TODO** — placeholder in repo | Owner: design. Replace with production-resolution artwork. Confirm ownership or license before submission. |
| Android adaptive foreground | `apps/mobile/assets/images/android-icon-foreground.png` | **TODO** — placeholder | Owner: design. Must be 108 × 108 dp safe zone in 432 × 432 px canvas. |
| Android adaptive background | `apps/mobile/assets/images/android-icon-background.png` | **TODO** — placeholder | Owner: design. Solid fill or texture; no text. |
| Android monochrome | `apps/mobile/assets/images/android-icon-monochrome.png` | **TODO** — placeholder | Owner: design. Single-channel silhouette. |
| Web favicon | `apps/mobile/assets/images/favicon.png` | Low-priority (web export only) | Can remain placeholder until web distribution is scoped. |

### Splash screen

| Asset | Path | Status | Action required |
| --- | --- | --- | --- |
| Splash icon (centred, 180 px wide, on `#FBFCFA`) | `apps/mobile/assets/images/splash-icon.png` | **TODO** — placeholder | Owner: design. Confirm final artwork matches settled Tekrarla identity. |

### Dino mascot

| Asset | Path | Status | Action required |
| --- | --- | --- | --- |
| Dino artwork | `apps/mobile/assets/dino/dino.png` | **Placeholder** — see `assets/dino/README.md` | The approved artwork is in the Claude Design project "Online Dershanem Oyun v2". Drop the real file at this path; no code changes needed. Owner: design. |

> **Ownership / license note:** Dino is a custom character. Confirm that all
> production-resolution renders are owned by the organisation (work-for-hire or
> assignment) before App Store / Play submission. Document the design agreement
> or internal creation record. Do not submit with the placeholder.

### Typography

| Font | Weight(s) used | Source | License status |
| --- | --- | --- | --- |
| Manrope | 400, 700, 800 | Google Fonts (OFL 1.1) | OFL is App Store / Play compatible. No attribution required in-app, but retain the license file. **TODO:** confirm the bundled font file version matches the OFL source and add the license to `apps/mobile/assets/fonts/` if not already present. |
| JetBrains Mono | Medium (500) | JetBrains / Google Fonts (OFL 1.1) | Same as above. **TODO:** same confirmation. |

### Third-party code and SDKs

Expo SDK and all npm packages carry their own open-source licenses (MIT, BSD,
Apache 2.0, ISC predominate). No additional in-app attribution is required by
those licenses, but Apple and Google may ask for export-compliance declarations.

- `ITSAppUsesNonExemptEncryption: false` is already set in `app.json`; confirm
  this remains accurate for production (standard HTTPS does not trigger the
  exemption, but verify if any custom crypto is added later).

---

## Part 2 — Store metadata checklist

### Identity (repo-side — COMPLETE)

| Item | Value | Notes |
| --- | --- | --- |
| App name | `Tekrarla` | Set in `apps/mobile/app.json` (`name`, `CFBundleDisplayName`). |
| Bundle identifier (iOS) | `com.tekrarla.app` | Set in `apps/mobile/app.json` `ios.bundleIdentifier`. |
| Android package name | `com.tekrarla.app` | Set in `apps/mobile/app.json` `android.package`. |
| Slug / URL scheme | `tekrarla` | Set in `apps/mobile/app.json`. Matches bundle name. |
| Version | `1.0.0` | Increment before submission if builds have been distributed. |
| Build number (iOS) | `1` | Set in `app.json`. Increment in EAS or manually before each TestFlight / store upload. |
| Version code (Android) | `1` | Set in `app.json`. Increment for each Play release. |

### Trademark and name registration — EXTERNAL HUMAN STEP

- [ ] **TODO (owner: legal / product):** Confirm trademark clearance for
  **Tekrarla** in Turkey (TÜRKPATENT) and any other target markets before
  submitting to either store. The technical identifiers are set but trademark
  status is unverified as of this commit.
- [ ] **TODO (owner: product):** Register the app name in App Store Connect and
  claim the package name in Google Play Console before a competitor can.

### Age rating — EXTERNAL HUMAN STEP

Recommended starting point based on content:

- **iOS:** 4+ (no objectionable content, no user-generated content, no
  in-app purchases in pilot). Adjust if Hearts/League/Plus go live — gambling
  simulation or in-app purchase ratings may apply.
- **Android:** Everyone (ESRB) / 3+ (PEGI). Same caveat.

- [ ] **TODO (owner: product):** Complete the age-rating questionnaire in App
  Store Connect and the content-rating questionnaire in Play Console.
  Answers must reflect the actual pilot feature set (no social, no purchases
  in v1).

### Store descriptions — EXTERNAL HUMAN STEP

Fields are listed in Turkish (the product language) with English field names.

#### Short description (Google Play — max 80 characters)

```
TODO: YKS, LGS ve KPSS sorularını tekrar et. Serinle, arkadaşlarınla yarış.
```

> Replace with owner-approved copy. Keep under 80 characters.

#### Long description (App Store / Google Play — max 4000 characters)

```
TODO

Owner: product / marketing.

Suggested outline (fill in approved copy):
- What Tekrarla is: soru tekrar uygulaması, kısa oyun döngüsü, YKS / LGS / KPSS
- How it works: dersler → ünite yolu → interaktif çalışma → can / XP / seri
- Pilot scope disclosure: şu an sadece TYT Sosyal Bilimler / Tarih
- Data and privacy: cihaz yerel depolama, hesap gerekmez, uygulama silinirse
  ilerleme kaybolur
- Legal footer if required by store
```

#### Keywords (App Store — max 100 characters total)

```
TODO: sınav hazırlık, YKS, TYT, AYT, LGS, KPSS, tarih, soru bankası, tekrar, seri
```

> Owner: product / ASO. Confirm keyword strategy and character count.

#### Promotional text (App Store — max 170 characters, updatable without re-review)

```
TODO
```

### Screenshots — EXTERNAL HUMAN STEP

Required sizes vary by store and device; minimum set:

| Store | Required | Status |
| --- | --- | --- |
| App Store — iPhone 6.9" (1320 × 2868 px) | 3–10 screenshots | **TODO** |
| App Store — iPhone 6.7" (1290 × 2796 px) | 3–10 screenshots | **TODO** |
| App Store — iPad Pro 13" (2064 × 2752 px) | Optional (supportsTablet is false) | Skip unless tablet support added |
| Google Play — Phone (9:16 or 16:9, min 320 px) | 2–8 screenshots | **TODO** |
| Google Play — Feature graphic (1024 × 500 px) | 1 | **TODO** |

- [ ] **TODO (owner: design / product):** Capture screenshots in production-pilot
  mode (`EXPO_PUBLIC_APP_MODE=productionPilot`) on a real device or high-fidelity
  simulator. Screens to cover: home/path, lesson question, completion, İz/streak,
  profile. Dino must appear in production-resolution artwork, not the placeholder.

### App preview / promo video — EXTERNAL HUMAN STEP

- [ ] **TODO (owner: product):** Optional but recommended for App Store. 15–30 s
  screen capture of the core game loop. Not required for initial submission.

---

## Part 3 — Support and privacy URLs

### Privacy policy — EXTERNAL HUMAN STEP

- [ ] **TODO (owner: legal / product):** Draft and publish the KVKK-compliant
  privacy policy. See Y-123 for the KVKK / minor-user package.
  - Privacy URL must be publicly accessible (no login required).
  - Must disclose: device-local storage only, no account, no cloud sync,
    data lost on app deletion, no third-party analytics in pilot v1
    (update when observability provider is selected).
  - **Placeholder privacy URL:** `https://tekrarla.app/gizlilik` — **DO NOT**
    submit until the page is live.

### Support URL — EXTERNAL HUMAN STEP

- [ ] **TODO (owner: product):** Publish a support page or email-based support
  address reachable from outside the app.
  - Must explain how to reset local progress (delete and reinstall).
  - Must disclose that progress cannot be recovered after app deletion.
  - **Placeholder support URL:** `https://tekrarla.app/destek` — **DO NOT**
    submit until the page is live.

### Marketing URL — OPTIONAL

- [ ] **TODO (owner: product):** Landing page or App Store preview page.
  Not required for submission.

---

## Part 4 — App Review notes (App Store) / Release notes

### App Review notes

```
TODO (owner: product)

Suggested content:
- This is a device-local exam-preparation app for Turkish students.
- No account, login, or network connection is required to use the app.
- The pilot covers TYT Sosyal Bilimler (History lessons only).
- Features shown as locked or disabled (League, Plus, Hearts) are
  gated behind feature flags and intentionally inactive in this build.
- No in-app purchases, advertising, or data collection occur in this build.
- Test device: [iPhone model, iOS version] — no special setup needed.
```

### What's new / Release notes (first release)

```
TODO (owner: product — Turkish copy)

Example:
İlk sürüm. TYT Sosyal Bilimler Tarih dersleriyle başlıyor.
Soru çöz, serinle, ilerlemeni takip et.
```

---

## Part 5 — Pre-submission technical checks

These can be run by engineering before submitting to the store.

- [ ] `npm run lint` — passes with zero errors
- [ ] `npm run typecheck` — passes with zero errors
- [ ] `npm test` — all tests pass
- [ ] `eas build --platform ios --profile production` (or `preview`) — builds without error
- [ ] `eas build --platform android --profile production` — builds without error
- [ ] TestFlight internal test on a physical iPhone (iOS 17+) — smoke test: onboarding → lesson → completion → İz
- [ ] Android internal test track on a physical device (Android 13+) — same smoke test
- [ ] VoiceOver pass (iOS) — home, lesson, completion screens navigable without sight
- [ ] Dynamic Type XL pass — no text truncation or layout overflow
- [ ] App icon renders correctly at 60 × 60 pt and in App Store listing at 1024 px
- [ ] Splash screen background matches `#FBFCFA` on all tested devices

---

## Summary: who does what

| Item | Owner | Blocking submission |
| --- | --- | --- |
| App name, bundle ID, version in config | Engineering — DONE | — |
| Production-resolution app icon / splash | Design | Yes |
| Production Dino artwork | Design | Yes |
| Font license confirmation | Engineering | Yes |
| Trademark clearance (Tekrarla) | Legal / product | Yes |
| App Store Connect / Play Console name claim | Product | Yes |
| Age rating questionnaire | Product | Yes |
| Store descriptions, keywords | Product / marketing | Yes |
| Screenshots | Design / product | Yes |
| Privacy policy published | Legal / product | Yes |
| Support URL published | Product | Yes |
| App Review notes | Product | Yes |
| EAS production builds passing | Engineering | Yes |
| Device smoke tests and accessibility QA | Engineering | Yes |
