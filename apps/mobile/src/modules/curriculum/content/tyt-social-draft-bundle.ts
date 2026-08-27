import {
  CONTENT_SCHEMA_VERSION,
  type ContentBundle,
  type Provenance,
} from '@/modules/curriculum/domain/content-types';

/**
 * TYT Sosyal — engineering vertical slice.
 *
 * ⚠️  THIS IS NOT PRODUCTION ACADEMIC CONTENT.
 *
 * One tiny original Tarih lesson written to prove the content contract and the
 * lesson engine end to end. Every record below is `reviewStatus: 'draft'` and
 * must stay that way until a human subject-matter reviewer signs it off — see
 * docs/CONTENT_MODEL.md. Nothing here is copied from ÖSYM or any published
 * question bank, and all of it is expected to be replaced.
 *
 * The surrounding path nodes are deliberately *absent* from this bundle: the
 * home screen still renders preview placeholders around this single real node,
 * and keeps the two clearly separated.
 */

const DRAFT: Provenance = {
  author: 'TEKRARLA engineering',
  note: 'Dikey dilim doğrulaması için yazılmış özgün taslak içerik. Akademik incelemeden geçmedi.',
  reviewStatus: 'draft',
};

const EXAM = 'tyt';
const SUBJECT = 'tyt.social.history';
const UNIT = 'tyt.social.history.first-turkish-states';
const TOPIC = 'tyt.social.history.first-turkish-states.kurultay';

const SKILL_FUNCTION = 'skill.history.kurultay.function';
const SKILL_MEMBERS = 'skill.history.kurultay.members';
const SKILL_TERMS = 'skill.history.kurultay.terms';

export const KURULTAY_LESSON_ID = 'lesson.history.kurultay.001';
export const KURULTAY_PATH_NODE_ID = 'path.history.first-turkish-states.03';
export const FIRST_TURKISH_STATES_UNIT_ID = UNIT;

export const tytSocialDraftBundle: ContentBundle = {
  schemaVersion: CONTENT_SCHEMA_VERSION,
  curriculumVersion: '2026.1-draft',
  contentVersion: '0.1.0-draft',
  locale: 'tr-TR',

  exams: [{ id: EXAM, subjectIds: [SUBJECT], title: 'TYT' }],

  subjects: [{ examId: EXAM, id: SUBJECT, title: 'Tarih', unitIds: [UNIT] }],

  units: [{ id: UNIT, subjectId: SUBJECT, title: 'İlk Türk Devletleri', topicIds: [TOPIC] }],

  topics: [
    {
      conceptIds: ['concept.history.kurultay', 'concept.history.tore', 'concept.history.kut'],
      id: TOPIC,
      skillIds: [SKILL_FUNCTION, SKILL_MEMBERS, SKILL_TERMS],
      title: 'Kurultay',
      unitId: UNIT,
    },
  ],

  skills: [
    {
      description: 'Kurultayın devlet yönetimindeki işlevini açıklar.',
      id: SKILL_FUNCTION,
      title: 'Kurultayın işlevi',
      topicId: TOPIC,
    },
    {
      description: 'Kurultaya kimlerin katıldığını ayırt eder.',
      id: SKILL_MEMBERS,
      title: 'Kurultay üyeleri',
      topicId: TOPIC,
    },
    {
      description: 'Kurultayla ilişkili temel kavramları anlamlarıyla eşleştirir.',
      id: SKILL_TERMS,
      title: 'Kurultay kavramları',
      topicId: TOPIC,
    },
  ],

  concepts: [
    {
      definition: 'İlk Türk devletlerinde devlet işlerinin görüşüldüğü meclis.',
      id: 'concept.history.kurultay',
      term: 'Kurultay',
      topicId: TOPIC,
    },
    {
      definition: 'Yazılı olmayan, geleneğe dayalı hukuk kuralları.',
      id: 'concept.history.tore',
      term: 'Töre',
      topicId: TOPIC,
    },
    {
      definition: 'Yönetme yetkisinin Tanrı tarafından verildiği inancı.',
      id: 'concept.history.kut',
      term: 'Kut',
      topicId: TOPIC,
    },
  ],

  exercises: [
    {
      cards: [
        {
          back: 'İlk Türk devletlerinde devlet işlerinin görüşüldüğü meclis.',
          front: 'Kurultay',
          hint: 'Kaynaklarda “toy” adıyla da geçer.',
          id: 'card-kurultay',
        },
        {
          back: 'Yazılı olmayan, geleneğe dayalı hukuk kuralları.',
          front: 'Töre',
          hint: 'Kurultayda alınan kararlar töreyi güncelleyebilirdi.',
          id: 'card-tore',
        },
        {
          back: 'Yönetme yetkisinin Tanrı tarafından verildiği inancı.',
          front: 'Kut',
          hint: 'Hükümdarın meşruiyetini açıklayan anlayıştır.',
          id: 'card-kut',
        },
      ],
      difficulty: 1,
      explanation: 'Bu üç kavram kurultay konusunun çatısını kurar.',
      id: 'exercise.history.kurultay.001.card01',
      kind: 'flashcard',
      provenance: DRAFT,
      skillIds: [SKILL_TERMS],
      tag: 'TARİH · KAVRAMLAR',
    },
    {
      correctOptionId: 'opt-assembly',
      difficulty: 2,
      explanation:
        'Kurultay, devlet işlerinin tartışılıp karara bağlandığı meclistir. Ordunun eğitimi ya da vergi toplama gibi işler yürütmenin görevidir.',
      id: 'exercise.history.kurultay.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-assembly', label: 'Devlet işlerinin görüşülüp karara bağlanması' },
        { id: 'opt-drill', label: 'Ordunun günlük eğitiminin yürütülmesi' },
        { id: 'opt-tax', label: 'Ticaret yollarından vergi toplanması' },
        { id: 'opt-map', label: 'Sınır boylarının haritalanması' },
      ],
      prompt: 'İlk Türk devletlerinde kurultayın temel işlevi aşağıdakilerden hangisidir?',
      provenance: DRAFT,
      skillIds: [SKILL_FUNCTION],
      tag: 'TARİH · KURULTAY',
    },
    {
      // Distractors are interleaved so the bank does not spell the answer out
      // in reading order.
      bank: [
        { id: 'w-islerinin', label: 'işlerinin' },
        { id: 'w-ordu', label: 'ordunun' },
        { id: 'w-kurultay', label: 'Kurultay' },
        { id: 'w-meclistir', label: 'meclistir' },
        { id: 'w-sinir', label: 'sınırın' },
        { id: 'w-devlet', label: 'devlet' },
        { id: 'w-vergi', label: 'verginin' },
        { id: 'w-gorusuldugu', label: 'görüşüldüğü' },
      ],
      difficulty: 2,
      explanation: 'Kurultayın tanımı: devlet işlerinin görüşüldüğü meclis.',
      hint: 'Kurultayın tanımı',
      id: 'exercise.history.kurultay.001.blank01',
      kind: 'fillBlank',
      provenance: DRAFT,
      skillIds: [SKILL_FUNCTION],
      solutionTokenIds: [
        'w-kurultay',
        'w-devlet',
        'w-islerinin',
        'w-gorusuldugu',
        'w-meclistir',
      ],
      title: 'Cümleyi tamamla',
    },
    {
      difficulty: 3,
      explanation:
        'Kurultay meclisi, töre gelenek hukukunu, kut yönetme yetkisini, aygucı ise vezirlik görevini karşılar.',
      id: 'exercise.history.kurultay.001.match01',
      kind: 'matching',
      pairs: [
        { id: 'pair-kurultay', left: 'Kurultay', right: 'Meclis' },
        { id: 'pair-tore', left: 'Töre', right: 'Gelenek hukuku' },
        { id: 'pair-kut', left: 'Kut', right: 'Yönetme yetkisi' },
        { id: 'pair-ayguci', left: 'Aygucı', right: 'Vezir' },
      ],
      provenance: DRAFT,
      skillIds: [SKILL_TERMS],
      subtitle: 'yanlış eşleşme can götürmez',
      tag: 'TARİH · KAVRAMLAR',
      title: 'Kavramı karşılığıyla eşleştir',
    },
    {
      correctOptionId: 'opt-envoy',
      difficulty: 4,
      explanation:
        'Kurultay; kağan, hatun ve boy beylerinin katıldığı bir meclistir. Yabancı elçiler bu meclisin üyesi değildir.',
      id: 'exercise.history.kurultay.001.mcq02',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-kagan', label: 'Kağan' },
        { id: 'opt-hatun', label: 'Hatun' },
        { id: 'opt-beys', label: 'Boy beyleri' },
        { id: 'opt-envoy', label: 'Yabancı elçiler' },
      ],
      prompt: 'Aşağıdakilerden hangisi kurultayın üyeleri arasında gösterilemez?',
      provenance: DRAFT,
      skillIds: [SKILL_MEMBERS],
      tag: 'TARİH · KURULTAY',
    },
  ],

  lessons: [
    {
      estimatedMinutes: 4,
      exerciseIds: [
        'exercise.history.kurultay.001.card01',
        'exercise.history.kurultay.001.mcq01',
        'exercise.history.kurultay.001.blank01',
        'exercise.history.kurultay.001.match01',
        'exercise.history.kurultay.001.mcq02',
      ],
      id: KURULTAY_LESSON_ID,
      provenance: DRAFT,
      subtitle: 'İlk Türk devletlerinde meclis',
      title: 'Kurultay',
      topicId: TOPIC,
    },
  ],

  pathNodes: [
    {
      id: KURULTAY_PATH_NODE_ID,
      kind: 'lesson',
      lessonId: KURULTAY_LESSON_ID,
      order: 3,
      prerequisiteIds: [],
      title: 'Kurultay',
      unitId: UNIT,
    },
  ],
};
