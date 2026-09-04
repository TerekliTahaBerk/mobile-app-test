# Product

## Vision

Build a mobile-first learning game that makes Turkish exam preparation short, directed, and repeatable. The student should open the app, see one obvious next activity, complete a focused session, feel progress, and return with stronger recall.

## Pilot scope

The pilot covers only TYT Sosyal Bilimler:

- Tarih
- Coğrafya
- Felsefe
- Din Kültürü ve Ahlak Bilgisi

That list is the intended pilot curriculum, not a claim that all four subjects
are authored. The current compiled bundle contains a usable multi-unit Tarih
draft path only. Other records in the bundle are catalogue/design entries with
no units; production learner screens omit them until authored content exists.
AYT and LGS are not supported product paths in this pilot. Production
onboarding offers only YKS and starts the learner in the available TYT content;
the LGS choice remains reviewable only in `designPreview`.

Typical daily sessions are 5–15 minutes; a micro-lesson is expected to take 3–7 minutes. The product is not a generic LMS, video course, or question bank.

## Product constraints

- XP represents engagement; mastery represents estimated knowledge.
- Curriculum progression, retrieval practice, adaptive review, mistakes, and assessment are first-class concepts.
- Topic performance is a primary product surface, not a passive profile stat:
  learners can inspect their current accuracy, correct/wrong evidence, and
  strengths or practice priorities at both main-topic and subtopic level.
- Core learning must remain useful without a hard paywall.
- Production educational material must be original and academically reviewed.
- User-facing copy starts in Turkish and must remain localizable.

The implementation sequence is maintained in [EXECUTION/MVP.md](EXECUTION/MVP.md). Learning behaviour is defined in [LEARNING_SYSTEM.md](LEARNING_SYSTEM.md).

## Open questions

- Which authoritative curriculum source and academic review process will govern production content?
- Should the topic-performance screen later offer a single-tap targeted review
  action per weak subtopic, or keep the Home recommendation as the sole next step?
- What age range and device profile define the first pilot cohort?
