# 0015 — Release quality gates

## Decision

The root `npm run quality:release` command is the reproducible release result
for a checkout of a branch or commit. GitHub Actions runs the same constituent
checks on every push and pull request: lint and strict typecheck, the production
content approval gate, generated content-statistics drift detection, full-source
Jest coverage, Expo Doctor, production dependency audit, and a production-mode
Expo web export smoke test.

Jest measures every TypeScript source file and fails below the checked-in global
baseline: 68% statements, 58% branches, 69% functions, and 68% lines. These
thresholds sit below the measured Y-128 baseline so ordinary runtime variance
does not fail a healthy build, while a material untested regression does.

ESLint rejects framework, navigation, SQLite, infrastructure, platform, and UI
imports from module domain directories. The production audit fails on high or
critical findings; moderate Expo-compatible transitive findings require an
explicit documented review because forced major-version remediation is not a
safe release action.

## Consequences

- A critical test, coverage, content, architecture, dependency, doctor, or
  production-export failure blocks CI and therefore the release result.
- `docs/CONTENT_STATS.md` is generated from authored curriculum JSON; content
  changes must update it with `npm run content:stats:update` in the same commit.
- The export smoke proves that production composition bundles, but it does not
  replace native iOS and Android store-build acceptance.
- Coverage thresholds are a ratchet baseline and should rise with sustained
  test improvements rather than being lowered to admit a regression.
