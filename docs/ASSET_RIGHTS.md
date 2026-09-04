# Asset rights register

This is the release record for every visual and font bundled by the mobile app.
Checksums identify the exact reviewed files; replacing a file requires a new
review and checksum. A recorded `Unverified` asset is a release blocker, not an
ownership claim.

## Custom visual assets

| Files | SHA-256 | Source / author | Rights status | Release decision |
| --- | --- | --- | --- | --- |
| `assets/images/icon.png` | `fdf1627790bcbac1112bec7239f07381928dc72095b7794ae8907df45c3c56cf` | No source or assignment record in repo | **Unverified** | Blocked until the owner supplies an original source/design agreement and approves final art |
| `assets/images/splash-icon.png` | `ca0eb2e7d223f7f9994007da224ca4c08800bdc6a972e37439259af069ddaa71` | No source or assignment record in repo | **Unverified** | Blocked; also visually confirm final Tekrarla mark |
| `assets/images/android-icon-foreground.png` | `ceb3af11b2ccec206182780daec81250878c9337c34a25da17671fd31f85d728` | Derived brand asset; derivation record absent | **Unverified** | Blocked with the app-icon approval |
| `assets/images/android-icon-background.png` | `fbce01f023181296527f4eb25d93c05784a0acec2654a4e5b63fb9cac0759733` | Derived brand asset; derivation record absent | **Unverified** | Blocked with the app-icon approval |
| `assets/images/android-icon-monochrome.png` | `54529583340e8f892c7fbe2dc8e4045bca5a7c1d4858ea0654e7991beaa19510` | Derived brand asset; derivation record absent | **Unverified** | Blocked with the app-icon approval |
| `assets/images/favicon.png` | `0efefec8c658a30b5372feb9dd61166f52bf1ed9161f66d936d422398d4e36cb` | Derived brand asset; derivation record absent | **Unverified** | Blocked with the app-icon approval |
| `assets/dino/dino.png` | `d3c74942f2a1c6cbfb98fce6cc79c4067cfc458e6881c8fd040d2669a0dcb793` | Custom Dino render; original/assignment record absent | **Unverified** | Blocked until commercial ownership and source are documented |
| `assets/dino/dino-writing.png` | `f1d2321e208a7c6e9e73f62c4b72d862918b08ec77c27a12f4a81de560a783f8` | Custom Dino render; original/assignment record absent | **Unverified** | Same approval as Dino master artwork |
| `assets/dino/dino-graduation.png` | `e7ce1ec269dff800c71c9ba9aa9c226ea05f0ad395177a37eae78d12f725c19f` | Custom Dino render; original/assignment record absent | **Unverified** | Same approval as Dino master artwork |

The PNG dimensions satisfy the current Expo inputs: 1024×1024 opaque iOS
icon, 512×512 Android foreground/background, 432×432 monochrome asset,
768×768 transparent splash mark, and Dino renders above 1200 px. Dimensions do
not establish authorship or commercial rights.

## Fonts

| Font | Package / exact version | License evidence | Status |
| --- | --- | --- | --- |
| Manrope 400, 500, 700, 800 | `@expo-google-fonts/manrope@0.4.2` | Package `LICENSE_FONT`, SIL Open Font License 1.1 | **Verified for bundling and commercial app use**; retain the package license with source records |
| JetBrains Mono 500 | `@expo-google-fonts/jetbrains-mono@0.4.1` | Package `LICENSE_FONT`, SIL Open Font License 1.1 | **Verified for bundling and commercial app use**; retain the package license with source records |

The app imports no other font family. Baloo 2 and Nunito are installed but not
used by production source and therefore are not shipped as selected font files.

## Approval record to attach before submission

- Owner/legal name and capacity to grant rights.
- Original source file or contract/assignment/license URL.
- Territory, duration, modification, derivative, marketing, and store-display rights.
- Confirmation that any generative-AI/tool terms permit commercial use and that
  the result was reviewed for third-party marks or characters.
- Approver, date, and the matching checksum from this register.

No custom visual has that evidence in the repository as of 2026-09-04. Store
submission remains blocked until the missing records are attached and approved.
