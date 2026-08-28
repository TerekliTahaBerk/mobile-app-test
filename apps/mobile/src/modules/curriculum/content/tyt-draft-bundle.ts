import {
  CONTENT_SCHEMA_VERSION,
  type ContentBundle,
  type Provenance,
} from '@/modules/curriculum/domain/content-types';

/**
 * TYT — engineering vertical slice.
 *
 * ⚠️  THIS IS NOT PRODUCTION ACADEMIC CONTENT.
 *
 * Original Tarih material written to prove the content contract, the lesson
 * engine and the unit path end to end. Every record below is
 * `reviewStatus: 'draft'` and must stay that way until a human subject-matter
 * reviewer signs it off — see docs/CONTENT_MODEL.md. Nothing here is copied
 * from ÖSYM or any published question bank, and all of it is expected to be
 * replaced.
 *
 * The other subjects are present as **catalogue entries with no units**. That
 * is the honest representation of where the product is: the learner can see
 * that Matematik exists and is coming, and the screens render it as not yet
 * available rather than inventing a level and a progress bar for it.
 */

const DRAFT: Provenance = {
  author: 'Online Dershanem engineering',
  note: 'Dikey dilim doğrulaması için yazılmış özgün taslak içerik. Akademik incelemeden geçmedi.',
  reviewStatus: 'draft',
};

const TYT = 'tyt';
const AYT = 'ayt';

export const HISTORY_SUBJECT_ID = 'tyt.history';

const U_TIME = 'tyt.history.time-and-history';
const U_TURKISH_STATES = 'tyt.history.first-turkish-states';
const U_MEDIEVAL = 'tyt.history.medieval-world';

const T_TIME = 'tyt.history.time-and-history.measuring-time';
const T_ERAS = 'tyt.history.time-and-history.eras';
const T_STATES = 'tyt.history.first-turkish-states.states';
const T_KURULTAY = 'tyt.history.first-turkish-states.kurultay';
const T_FEUDALISM = 'tyt.history.medieval-world.feudalism';

const SK_CALENDARS = 'skill.history.time.calendars';
const SK_ERAS = 'skill.history.time.eras';
const SK_STATES_IDENTIFY = 'skill.history.states.identify';
const SK_STATES_CHRONOLOGY = 'skill.history.states.chronology';
const SK_KURULTAY_FUNCTION = 'skill.history.kurultay.function';
const SK_KURULTAY_MEMBERS = 'skill.history.kurultay.members';
const SK_KURULTAY_TERMS = 'skill.history.kurultay.terms';
const SK_FEUDALISM = 'skill.history.medieval.feudalism';

/** The unit the design's signature path screen renders. */
export const FIRST_TURKISH_STATES_UNIT_ID = U_TURKISH_STATES;

/**
 * The node the design shows as the current step, exported so tests and the
 * design-preview screens can name it without hard-coding a string.
 */
export const CHRONOLOGY_LESSON_ID = 'lesson.history.chronology.001';
export const CHRONOLOGY_PATH_NODE_ID = 'path.history.first-turkish-states.03';

export const tytDraftBundle: ContentBundle = {
  schemaVersion: CONTENT_SCHEMA_VERSION,
  curriculumVersion: '2026.1-draft',
  contentVersion: '0.2.0-draft',
  locale: 'tr-TR',

  exams: [
    {
      id: TYT,
      subjectIds: [
        HISTORY_SUBJECT_ID,
        'tyt.math',
        'tyt.turkish',
        'tyt.geography',
        'tyt.philosophy',
        'tyt.physics',
        'tyt.chemistry',
        'tyt.biology',
      ],
      title: 'TYT',
    },
    {
      id: AYT,
      subjectIds: ['ayt.math', 'ayt.physics', 'ayt.chemistry', 'ayt.biology', 'ayt.history'],
      title: 'AYT',
    },
  ],

  subjects: [
    {
      examId: TYT,
      id: HISTORY_SUBJECT_ID,
      themeKey: 'history',
      title: 'Tarih',
      unitIds: [U_TIME, U_TURKISH_STATES, U_MEDIEVAL],
    },
    { examId: TYT, id: 'tyt.math', themeKey: 'math', title: 'Matematik', unitIds: [] },
    { examId: TYT, id: 'tyt.turkish', themeKey: 'turkish', title: 'Türkçe', unitIds: [] },
    { examId: TYT, id: 'tyt.geography', themeKey: 'geography', title: 'Coğrafya', unitIds: [] },
    { examId: TYT, id: 'tyt.philosophy', themeKey: 'philosophy', title: 'Felsefe', unitIds: [] },
    { examId: TYT, id: 'tyt.physics', themeKey: 'physics', title: 'Fizik', unitIds: [] },
    { examId: TYT, id: 'tyt.chemistry', themeKey: 'chemistry', title: 'Kimya', unitIds: [] },
    { examId: TYT, id: 'tyt.biology', themeKey: 'biology', title: 'Biyoloji', unitIds: [] },

    { examId: AYT, id: 'ayt.math', themeKey: 'math', title: 'Matematik', unitIds: [] },
    { examId: AYT, id: 'ayt.physics', themeKey: 'physics', title: 'Fizik', unitIds: [] },
    { examId: AYT, id: 'ayt.chemistry', themeKey: 'chemistry', title: 'Kimya', unitIds: [] },
    { examId: AYT, id: 'ayt.biology', themeKey: 'biology', title: 'Biyoloji', unitIds: [] },
    { examId: AYT, id: 'ayt.history', themeKey: 'history', title: 'Tarih', unitIds: [] },
  ],

  units: [
    {
      id: U_TIME,
      subjectId: HISTORY_SUBJECT_ID,
      title: 'Tarih ve Zaman',
      topicIds: [T_TIME, T_ERAS],
    },
    {
      id: U_TURKISH_STATES,
      subjectId: HISTORY_SUBJECT_ID,
      title: 'İlk ve Orta Çağlarda Türk Dünyası',
      topicIds: [T_STATES, T_KURULTAY],
    },
    {
      id: U_MEDIEVAL,
      subjectId: HISTORY_SUBJECT_ID,
      title: "Orta Çağ'da Dünya",
      topicIds: [T_FEUDALISM],
    },
  ],

  topics: [
    {
      conceptIds: ['concept.history.takvim', 'concept.history.miladi', 'concept.history.hicri'],
      id: T_TIME,
      skillIds: [SK_CALENDARS],
      title: 'Zamanı Ölçmek',
      unitId: U_TIME,
    },
    {
      conceptIds: ['concept.history.cag'],
      id: T_ERAS,
      skillIds: [SK_ERAS],
      title: 'Çağlar ve Dönemler',
      unitId: U_TIME,
    },
    {
      conceptIds: ['concept.history.orhun'],
      id: T_STATES,
      skillIds: [SK_STATES_IDENTIFY, SK_STATES_CHRONOLOGY],
      title: 'İlk Türk Devletleri',
      unitId: U_TURKISH_STATES,
    },
    {
      conceptIds: ['concept.history.kurultay', 'concept.history.tore', 'concept.history.kut'],
      id: T_KURULTAY,
      skillIds: [SK_KURULTAY_FUNCTION, SK_KURULTAY_MEMBERS, SK_KURULTAY_TERMS],
      title: 'Kut ve Töre',
      unitId: U_TURKISH_STATES,
    },
    {
      conceptIds: ['concept.history.feodalite'],
      id: T_FEUDALISM,
      skillIds: [SK_FEUDALISM],
      title: 'Feodalite',
      unitId: U_MEDIEVAL,
    },
  ],

  skills: [
    {
      description: 'Miladi ve hicri takvimlerin ölçütlerini ayırt eder.',
      id: SK_CALENDARS,
      title: 'Takvim türleri',
      topicId: T_TIME,
    },
    {
      description: 'Tarihin çağlara ayrılmasında kullanılan ölçütleri açıklar.',
      id: SK_ERAS,
      title: 'Çağların ayrımı',
      topicId: T_ERAS,
    },
    {
      description: 'İlk Türk devletlerini ayırt edici özellikleriyle tanır.',
      id: SK_STATES_IDENTIFY,
      title: 'Devletleri tanıma',
      topicId: T_STATES,
    },
    {
      description: 'İlk Türk devletlerini kuruluş sırasına göre dizer.',
      id: SK_STATES_CHRONOLOGY,
      title: 'Kronolojik sıralama',
      topicId: T_STATES,
    },
    {
      description: 'Kurultayın devlet yönetimindeki işlevini açıklar.',
      id: SK_KURULTAY_FUNCTION,
      title: 'Kurultayın işlevi',
      topicId: T_KURULTAY,
    },
    {
      description: 'Kurultaya kimlerin katıldığını ayırt eder.',
      id: SK_KURULTAY_MEMBERS,
      title: 'Kurultay üyeleri',
      topicId: T_KURULTAY,
    },
    {
      description: 'Kut, töre ve kurultay kavramlarını anlamlarıyla eşleştirir.',
      id: SK_KURULTAY_TERMS,
      title: 'Yönetim kavramları',
      topicId: T_KURULTAY,
    },
    {
      description: 'Feodal düzenin temel ilişkilerini açıklar.',
      id: SK_FEUDALISM,
      title: 'Feodal düzen',
      topicId: T_FEUDALISM,
    },
  ],

  concepts: [
    {
      definition: 'Zamanı yıl, ay ve gün olarak bölen sistem.',
      id: 'concept.history.takvim',
      term: 'Takvim',
      topicId: T_TIME,
    },
    {
      definition: "Hz. İsa'nın doğumunu başlangıç alan, güneş yılı esaslı takvim.",
      id: 'concept.history.miladi',
      term: 'Miladi takvim',
      topicId: T_TIME,
    },
    {
      definition: 'Hicret olayını başlangıç alan, ay yılı esaslı takvim.',
      id: 'concept.history.hicri',
      term: 'Hicri takvim',
      topicId: T_TIME,
    },
    {
      definition: 'Tarihin, toplumları derinden etkileyen olaylarla bölünen uzun dönemi.',
      id: 'concept.history.cag',
      term: 'Çağ',
      topicId: T_ERAS,
    },
    {
      definition: 'II. Göktürk Devleti döneminde Göktürk alfabesiyle yazılmış taş yazıtlar.',
      id: 'concept.history.orhun',
      term: 'Orhun Yazıtları',
      topicId: T_STATES,
    },
    {
      definition: 'İlk Türk devletlerinde devlet işlerinin görüşüldüğü meclis.',
      id: 'concept.history.kurultay',
      term: 'Kurultay',
      topicId: T_KURULTAY,
    },
    {
      definition: 'Yazılı olmayan, geleneğe dayalı hukuk kuralları.',
      id: 'concept.history.tore',
      term: 'Töre',
      topicId: T_KURULTAY,
    },
    {
      definition: 'Yönetme yetkisinin hükümdara Tanrı tarafından verildiği inancı.',
      id: 'concept.history.kut',
      term: 'Kut',
      topicId: T_KURULTAY,
    },
    {
      definition: 'Toprak karşılığı korunma ve hizmet ilişkisine dayanan Orta Çağ düzeni.',
      id: 'concept.history.feodalite',
      term: 'Feodalite',
      topicId: T_FEUDALISM,
    },
  ],

  exercises: [
    // --- Ünite 1 · Zamanı Ölçmek -------------------------------------------
    {
      cards: [
        {
          back: "Hz. İsa'nın doğumunu başlangıç alan, güneş yılı esaslı takvim.",
          front: 'Miladi takvim',
          hint: 'Bugün resmî olarak kullandığımız takvim.',
          id: 'card-miladi',
        },
        {
          back: 'Hicret olayını başlangıç alan, ay yılı esaslı takvim.',
          front: 'Hicri takvim',
          hint: 'Ay yılı, güneş yılından yaklaşık 11 gün kısadır.',
          id: 'card-hicri',
        },
        {
          back: 'Zamanı yıl, ay ve gün olarak bölen sistem.',
          front: 'Takvim',
          hint: 'Her toplum kendi başlangıcını seçer.',
          id: 'card-takvim',
        },
      ],
      difficulty: 1,
      explanation: 'Takvimler başlangıç noktası ve yıl esası bakımından ayrılır.',
      id: 'exercise.history.time.001.card01',
      kind: 'flashcard',
      provenance: DRAFT,
      skillIds: [SK_CALENDARS],
      tag: 'TARİH · TAKVİM',
    },
    {
      correctOptionId: 'opt-moon',
      difficulty: 2,
      explanation:
        'Hicri takvim ay yılı esaslıdır; ay yılı güneş yılından yaklaşık 11 gün kısadır. Bu yüzden iki takvim arasındaki fark her yıl büyür.',
      id: 'exercise.history.time.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-moon', label: 'Ay yılı esaslı olması' },
        { id: 'opt-sun', label: 'Güneş yılı esaslı olması' },
        { id: 'opt-start', label: 'Başlangıcının aynı olması' },
        { id: 'opt-leap', label: 'Artık yıl içermemesi' },
      ],
      prompt: 'Hicri takvimi miladi takvimden ayıran temel özellik nedir?',
      provenance: DRAFT,
      skillIds: [SK_CALENDARS],
      tag: 'TARİH · TAKVİM',
    },
    {
      correctAnswer: false,
      difficulty: 2,
      explanation:
        'Miladi takvim güneş yılı, hicri takvim ay yılı esaslıdır. Aynı uzunlukta değillerdir.',
      id: 'exercise.history.time.001.tf01',
      kind: 'trueFalse',
      provenance: DRAFT,
      skillIds: [SK_CALENDARS],
      statement: 'Hicri yıl ile miladi yıl aynı uzunluktadır.',
      tag: 'TARİH · TAKVİM',
    },

    // --- Ünite 1 · Çağlar ve Dönemler --------------------------------------
    {
      correctOptionId: 'opt-writing',
      difficulty: 2,
      explanation:
        'Tarih öncesi ile tarihî çağları ayıran ölçüt yazının bulunmasıdır. Yazı, geçmişin yazılı kaynaklarla izlenebilmesini sağlar.',
      id: 'exercise.history.eras.002.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-writing', label: 'Yazının bulunması' },
        { id: 'opt-fire', label: 'Ateşin kullanılması' },
        { id: 'opt-wheel', label: 'Tekerleğin icadı' },
        { id: 'opt-city', label: 'İlk şehirlerin kurulması' },
      ],
      prompt: 'Tarih öncesi çağlar ile tarihî çağları ayıran ölçüt aşağıdakilerden hangisidir?',
      provenance: DRAFT,
      skillIds: [SK_ERAS],
      tag: 'TARİH · ÇAĞLAR',
    },
    {
      correctOrder: ['item-ilk', 'item-orta', 'item-yeni', 'item-yakin'],
      difficulty: 3,
      explanation: 'Çağlar sırasıyla İlk Çağ, Orta Çağ, Yeni Çağ ve Yakın Çağ olarak adlandırılır.',
      id: 'exercise.history.eras.002.order01',
      items: [
        { id: 'item-orta', label: 'Orta Çağ' },
        { id: 'item-yakin', label: 'Yakın Çağ' },
        { id: 'item-ilk', label: 'İlk Çağ' },
        { id: 'item-yeni', label: 'Yeni Çağ' },
      ],
      kind: 'ordering',
      prompt: 'Çağları eskiden yeniye sırala.',
      provenance: DRAFT,
      skillIds: [SK_ERAS],
      tag: 'TARİH · ÇAĞLAR',
    },
    {
      bank: [
        { id: 'w-yazinin', label: 'yazının' },
        { id: 'w-ates', label: 'ateşin' },
        { id: 'w-bulunmasi', label: 'bulunması' },
        { id: 'w-tarih', label: 'Tarih' },
        { id: 'w-oncesi', label: 'öncesi' },
        { id: 'w-doner', label: 'döner' },
        { id: 'w-biter', label: 'biter' },
        { id: 'w-ile', label: 'ile' },
      ],
      difficulty: 2,
      explanation: 'Tarih öncesi dönem, yazının bulunmasıyla sona erer.',
      hint: 'Tarih öncesini bitiren gelişme',
      id: 'exercise.history.eras.002.blank01',
      kind: 'fillBlank',
      provenance: DRAFT,
      skillIds: [SK_ERAS],
      solutionTokenIds: ['w-tarih', 'w-oncesi', 'w-yazinin', 'w-bulunmasi', 'w-ile', 'w-biter'],
      title: 'Cümleyi tamamla',
    },

    // --- Ünite 1 · Mini Challenge ------------------------------------------
    {
      correctOptionId: 'opt-hicret',
      difficulty: 3,
      explanation: 'Hicri takvimin başlangıcı hicret olayıdır.',
      id: 'exercise.history.time.003.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-hicret', label: 'Hicret' },
        { id: 'opt-birth', label: "Hz. İsa'nın doğumu" },
        { id: 'opt-olympics', label: 'İlk olimpiyatlar' },
        { id: 'opt-rome', label: "Roma'nın kuruluşu" },
      ],
      prompt: 'Hicri takvimin başlangıç olayı hangisidir?',
      provenance: DRAFT,
      skillIds: [SK_CALENDARS],
      tag: 'TARİH · MINI CHALLENGE',
    },
    {
      correctAnswer: true,
      difficulty: 3,
      explanation: 'Çağ ayrımı, toplumları geniş ölçekte etkileyen olaylara dayanır.',
      id: 'exercise.history.time.003.tf01',
      kind: 'trueFalse',
      provenance: DRAFT,
      skillIds: [SK_ERAS],
      statement: 'Çağların başlangıç ve bitişleri, toplumları derinden etkileyen olaylara dayanır.',
      tag: 'TARİH · MINI CHALLENGE',
    },

    // --- Ünite 2 · Devletleri Tanı -----------------------------------------
    {
      cards: [
        {
          back: 'Bilinen ilk Türk devleti; Mete Han döneminde ordu düzeniyle tanınır.',
          front: 'Asya Hun Devleti',
          hint: 'Onluk sistemin kaynağı sayılır.',
          id: 'card-hun',
        },
        {
          back: 'Orhun Yazıtları bu devlet döneminde dikilmiştir.',
          front: 'II. Göktürk Devleti',
          hint: 'Türk adının geçtiği ilk yazılı belgeler.',
          id: 'card-gokturk',
        },
        {
          back: 'Yerleşik hayata geçen, kendi alfabesini kullanan Türk devleti.',
          front: 'Uygur Devleti',
          hint: 'Matbaa ve kâğıtla anılır.',
          id: 'card-uygur',
        },
      ],
      difficulty: 1,
      explanation: 'Üç devlet, ayırt edici özellikleriyle birlikte hatırlanır.',
      id: 'exercise.history.states.001.card01',
      kind: 'flashcard',
      provenance: DRAFT,
      skillIds: [SK_STATES_IDENTIFY],
      tag: 'TARİH · DEVLETLER',
    },
    {
      correctOptionId: 'opt-gokturk',
      difficulty: 2,
      explanation:
        'Orhun Yazıtları II. Göktürk Devleti döneminde, Göktürk alfabesiyle yazılmıştır.',
      id: 'exercise.history.states.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-hun', label: 'Asya Hun Devleti' },
        { id: 'opt-gokturk', label: 'II. Göktürk Devleti' },
        { id: 'opt-uygur', label: 'Uygur Devleti' },
        { id: 'opt-avar', label: 'Avarlar' },
      ],
      prompt: 'Orhun Yazıtları hangi Türk devletine aittir?',
      provenance: DRAFT,
      skillIds: [SK_STATES_IDENTIFY],
      tag: 'TARİH · TUR 2',
    },
    {
      correctOptionId: 'opt-settled',
      difficulty: 3,
      explanation:
        'Uygurlar yerleşik hayata geçen ilk Türk devleti olarak bilinir; şehirler kurmuş ve kendi alfabelerini kullanmışlardır.',
      id: 'exercise.history.states.001.mcq02',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-settled', label: 'Yerleşik hayata geçmeleri' },
        { id: 'opt-nomad', label: 'Konar-göçer kalmaları' },
        { id: 'opt-navy', label: 'Güçlü bir donanma kurmaları' },
        { id: 'opt-coin', label: 'İlk parayı basmaları' },
      ],
      prompt: 'Uygurları diğer ilk Türk devletlerinden ayıran özellik nedir?',
      provenance: DRAFT,
      skillIds: [SK_STATES_IDENTIFY],
      tag: 'TARİH · DEVLETLER',
    },

    // --- Ünite 2 · Kavramları Eşleştir -------------------------------------
    {
      difficulty: 3,
      explanation:
        'Kurultay meclisi, töre yazısız hukuku, kut yönetme yetkisini, toy ise devlet şölenini karşılar.',
      id: 'exercise.history.kurultay.001.match01',
      kind: 'matching',
      pairs: [
        { id: 'pair-kurultay', left: 'Kurultay', right: 'Meclis' },
        { id: 'pair-tore', left: 'Töre', right: 'Yazısız hukuk' },
        { id: 'pair-kut', left: 'Kut', right: 'Yönetme yetkisi' },
        { id: 'pair-toy', left: 'Toy', right: 'Devlet şöleni' },
      ],
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_TERMS],
      subtitle: 'Kavramı karşılığıyla birleştir.',
      tag: 'TARİH · KAVRAMLAR',
      title: 'Eşleştir',
    },
    {
      correctOptionId: 'opt-envoy',
      difficulty: 4,
      explanation:
        'Kurultay; kağan, hatun ve boy beylerinin katıldığı bir meclistir. Yabancı elçiler bu meclisin üyesi değildir.',
      id: 'exercise.history.kurultay.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-kagan', label: 'Kağan' },
        { id: 'opt-hatun', label: 'Hatun' },
        { id: 'opt-beys', label: 'Boy beyleri' },
        { id: 'opt-envoy', label: 'Yabancı elçiler' },
      ],
      prompt: 'Aşağıdakilerden hangisi kurultayın üyeleri arasında gösterilemez?',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_MEMBERS],
      tag: 'TARİH · KURULTAY',
    },

    // --- Ünite 2 · Kronolojik Sırala ---------------------------------------
    {
      correctOrder: ['item-hun', 'item-gokturk', 'item-uygur'],
      difficulty: 3,
      explanation:
        'Asya Hun Devleti en eski, Uygurlar ise bu üçlü içinde en geç kurulan devlettir.',
      id: 'exercise.history.chronology.001.order01',
      items: [
        { id: 'item-gokturk', label: 'Göktürkler' },
        { id: 'item-hun', label: 'Asya Hun Devleti' },
        { id: 'item-uygur', label: 'Uygurlar' },
      ],
      kind: 'ordering',
      prompt: 'İlk Türk devletlerini eskiden yeniye sırala.',
      provenance: DRAFT,
      skillIds: [SK_STATES_CHRONOLOGY],
      tag: 'TARİH · KRONOLOJİ',
    },
    {
      correctOptionId: 'opt-hun-first',
      difficulty: 2,
      explanation: 'Bilinen ilk Türk devleti Asya Hun Devleti’dir.',
      id: 'exercise.history.chronology.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-hun-first', label: 'Asya Hun Devleti' },
        { id: 'opt-gokturk-first', label: 'I. Göktürk Devleti' },
        { id: 'opt-uygur-first', label: 'Uygur Devleti' },
        { id: 'opt-avar-first', label: 'Avarlar' },
      ],
      prompt: 'Bilinen ilk Türk devleti hangisidir?',
      provenance: DRAFT,
      skillIds: [SK_STATES_CHRONOLOGY],
      tag: 'TARİH · KRONOLOJİ',
    },
    {
      correctAnswer: true,
      difficulty: 3,
      explanation:
        'Kurultay, ilk Türk devletlerinde devlet işlerinin görüşüldüğü meclistir; kaynaklarda toy adıyla da geçer.',
      id: 'exercise.history.chronology.001.tf01',
      kind: 'trueFalse',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_FUNCTION],
      statement: 'Kurultay, ilk Türk devletlerinde devlet işlerinin görüşüldüğü meclistir.',
      tag: 'TARİH · KURULTAY',
    },

    // --- Ünite 2 · Kut ve Töre ---------------------------------------------
    {
      bank: [
        { id: 'w-kut', label: 'Kut' },
        { id: 'w-tore', label: 'Töre' },
        { id: 'w-kurultay', label: 'Kurultay' },
        { id: 'w-toy', label: 'Toy' },
        { id: 'w-denir', label: 'denir' },
      ],
      difficulty: 3,
      explanation:
        'Hükümdarın yönetme yetkisinin Tanrı’dan geldiğine inanılması kut anlayışıdır. Töre ise yazısız hukuk kurallarıdır.',
      hint: 'Yönetme yetkisinin kaynağı',
      id: 'exercise.history.kut.001.blank01',
      kind: 'fillBlank',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_TERMS],
      solutionTokenIds: ['w-kut', 'w-denir'],
      title: 'Boşluğu doldur',
    },
    {
      correctOptionId: 'opt-unwritten',
      difficulty: 3,
      explanation: 'Töre, yazılı olmayan ve geleneğe dayanan hukuk kurallarıdır.',
      id: 'exercise.history.kut.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-unwritten', label: 'Yazısız, geleneğe dayalı hukuk kuralları' },
        { id: 'opt-written', label: 'Kağan tarafından yazdırılan kanunlar' },
        { id: 'opt-tax', label: 'Vergi toplama yöntemi' },
        { id: 'opt-army', label: 'Ordu düzeni' },
      ],
      prompt: 'İlk Türk devletlerinde töre neyi ifade eder?',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_TERMS],
      tag: 'TARİH · KAVRAMLAR',
    },
    {
      correctAnswer: false,
      difficulty: 3,
      explanation:
        'Kut, yönetme yetkisinin Tanrı tarafından verildiği inancıdır; yazısız hukuk kuralları töredir.',
      id: 'exercise.history.kut.001.tf01',
      kind: 'trueFalse',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_TERMS],
      statement: 'Kut, ilk Türk devletlerindeki yazısız hukuk kurallarının adıdır.',
      tag: 'TARİH · KAVRAMLAR',
    },

    // --- Ünite 2 · Hızlı Tekrar --------------------------------------------
    {
      cards: [
        {
          back: 'Türk hükümdarına yönetme yetkisinin Tanrı tarafından verildiğine inanılması.',
          front: 'Kut',
          hint: 'Hükümdarın meşruiyetini açıklar.',
          id: 'card-kut',
        },
        {
          back: 'Yazılı olmayan, geleneğe dayalı hukuk kuralları.',
          front: 'Töre',
          hint: 'Kurultay kararları töreyi güncelleyebilirdi.',
          id: 'card-tore',
        },
        {
          back: 'Devlet işlerinin görüşüldüğü meclis.',
          front: 'Kurultay',
          hint: 'Kaynaklarda “toy” adıyla da geçer.',
          id: 'card-kurultay',
        },
        {
          back: 'II. Göktürk Devleti döneminde dikilen taş yazıtlar.',
          front: 'Orhun Yazıtları',
          hint: 'Türk adının geçtiği ilk yazılı belgeler.',
          id: 'card-orhun',
        },
      ],
      difficulty: 1,
      explanation: 'Ünitenin çatı kavramları tek turda toplanır.',
      id: 'exercise.history.review.001.card01',
      kind: 'flashcard',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_TERMS],
      tag: 'HIZLI TEKRAR',
    },

    // --- Ünite 2 · Ünite Challenge -----------------------------------------
    {
      correctOptionId: 'opt-assembly',
      difficulty: 4,
      explanation:
        'Kurultay, devlet işlerinin tartışılıp karara bağlandığı meclistir. Ordunun eğitimi ya da vergi toplama gibi işler yürütmenin görevidir.',
      id: 'exercise.history.challenge.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-assembly', label: 'Devlet işlerinin görüşülüp karara bağlanması' },
        { id: 'opt-drill', label: 'Ordunun günlük eğitiminin yürütülmesi' },
        { id: 'opt-tax', label: 'Ticaret yollarından vergi toplanması' },
        { id: 'opt-map', label: 'Sınır boylarının haritalanması' },
      ],
      prompt: 'İlk Türk devletlerinde kurultayın temel işlevi aşağıdakilerden hangisidir?',
      provenance: DRAFT,
      skillIds: [SK_KURULTAY_FUNCTION],
      tag: 'ÜNİTE CHALLENGE',
    },
    {
      correctOrder: ['ch-hun', 'ch-gokturk', 'ch-uygur'],
      difficulty: 4,
      explanation: 'Kuruluş sırası: Asya Hunları, Göktürkler, Uygurlar.',
      id: 'exercise.history.challenge.001.order01',
      items: [
        { id: 'ch-uygur', label: 'Uygurlar' },
        { id: 'ch-hun', label: 'Asya Hun Devleti' },
        { id: 'ch-gokturk', label: 'Göktürkler' },
      ],
      kind: 'ordering',
      prompt: 'Devletleri kuruluş sırasına göre diz.',
      provenance: DRAFT,
      skillIds: [SK_STATES_CHRONOLOGY],
      tag: 'ÜNİTE CHALLENGE',
    },
    {
      difficulty: 4,
      explanation: 'Her devlet, kendisini ayıran özellikle birlikte hatırlanır.',
      id: 'exercise.history.challenge.001.match01',
      kind: 'matching',
      pairs: [
        { id: 'pair-orhun', left: 'Orhun Yazıtları', right: 'II. Göktürk Devleti' },
        { id: 'pair-settle', left: 'Yerleşik hayat', right: 'Uygurlar' },
        { id: 'pair-army', left: 'Onluk ordu sistemi', right: 'Asya Hun Devleti' },
      ],
      provenance: DRAFT,
      skillIds: [SK_STATES_IDENTIFY],
      subtitle: 'Özelliği devletiyle birleştir.',
      tag: 'ÜNİTE CHALLENGE',
      title: 'Eşleştir',
    },
    {
      correctAnswer: false,
      difficulty: 4,
      explanation:
        'Orhun Yazıtları Uygurlara değil, II. Göktürk Devleti dönemine aittir.',
      id: 'exercise.history.challenge.001.tf01',
      kind: 'trueFalse',
      provenance: DRAFT,
      skillIds: [SK_STATES_IDENTIFY],
      statement: 'Orhun Yazıtları Uygur Devleti döneminde dikilmiştir.',
      tag: 'ÜNİTE CHALLENGE',
    },

    // --- Ünite 3 · Feodalite -----------------------------------------------
    {
      cards: [
        {
          back: 'Toprak karşılığı korunma ve hizmet ilişkisine dayanan Orta Çağ düzeni.',
          front: 'Feodalite',
          hint: 'Merkezî otoritenin zayıfladığı dönemde güçlenir.',
          id: 'card-feodalite',
        },
        {
          back: 'Toprağı işleyen, toprağa bağlı köylü.',
          front: 'Serf',
          hint: 'Toprakla birlikte el değiştirirdi.',
          id: 'card-serf',
        },
      ],
      difficulty: 1,
      explanation: 'Feodal düzenin iki temel kavramı.',
      id: 'exercise.history.medieval.001.card01',
      kind: 'flashcard',
      provenance: DRAFT,
      skillIds: [SK_FEUDALISM],
      tag: 'TARİH · ORTA ÇAĞ',
    },
    {
      correctOptionId: 'opt-weak-center',
      difficulty: 3,
      explanation:
        'Feodalite, merkezî otoritenin zayıfladığı ve güvenliğin yerel güçlere bırakıldığı koşullarda güçlenir.',
      id: 'exercise.history.medieval.001.mcq01',
      kind: 'multipleChoice',
      options: [
        { id: 'opt-weak-center', label: 'Merkezî otoritenin zayıflaması' },
        { id: 'opt-trade', label: 'Ticaretin hızla gelişmesi' },
        { id: 'opt-city', label: 'Şehir nüfusunun artması' },
        { id: 'opt-navy', label: 'Deniz aşırı seferler' },
      ],
      prompt: 'Feodal düzenin güçlenmesini kolaylaştıran temel koşul nedir?',
      provenance: DRAFT,
      skillIds: [SK_FEUDALISM],
      tag: 'TARİH · ORTA ÇAĞ',
    },
  ],

  lessons: [
    {
      estimatedMinutes: 3,
      exerciseIds: [
        'exercise.history.time.001.card01',
        'exercise.history.time.001.mcq01',
        'exercise.history.time.001.tf01',
      ],
      id: 'lesson.history.time.001',
      provenance: DRAFT,
      subtitle: 'Takvimler ve başlangıç noktaları',
      title: 'Zamanı Ölçmek',
      topicId: T_TIME,
    },
    {
      estimatedMinutes: 4,
      exerciseIds: [
        'exercise.history.eras.002.mcq01',
        'exercise.history.eras.002.order01',
        'exercise.history.eras.002.blank01',
      ],
      id: 'lesson.history.eras.002',
      provenance: DRAFT,
      subtitle: 'Tarihin bölümlenmesi',
      title: 'Çağlar ve Dönemler',
      topicId: T_ERAS,
    },
    {
      estimatedMinutes: 2,
      exerciseIds: ['exercise.history.time.003.mcq01', 'exercise.history.time.003.tf01'],
      id: 'lesson.history.time.003',
      provenance: DRAFT,
      subtitle: 'Ünitenin kısa sınavı',
      title: 'Mini Challenge',
      topicId: T_TIME,
    },
    {
      estimatedMinutes: 4,
      exerciseIds: [
        'exercise.history.states.001.card01',
        'exercise.history.states.001.mcq01',
        'exercise.history.states.001.mcq02',
      ],
      id: 'lesson.history.states.001',
      provenance: DRAFT,
      subtitle: 'İlk Türk devletlerinin ayırt edici özellikleri',
      title: 'Devletleri Tanı',
      topicId: T_STATES,
    },
    {
      estimatedMinutes: 3,
      exerciseIds: [
        'exercise.history.kurultay.001.match01',
        'exercise.history.kurultay.001.mcq01',
      ],
      id: 'lesson.history.kurultay.001',
      provenance: DRAFT,
      subtitle: 'Yönetim kavramları',
      title: 'Kavramları Eşleştir',
      topicId: T_KURULTAY,
    },
    {
      estimatedMinutes: 4,
      exerciseIds: [
        'exercise.history.chronology.001.order01',
        'exercise.history.chronology.001.mcq01',
        'exercise.history.chronology.001.tf01',
      ],
      id: 'lesson.history.chronology.001',
      provenance: DRAFT,
      subtitle: 'Devletleri sıraya koy',
      title: 'Kronolojik Sırala',
      topicId: T_STATES,
    },
    {
      estimatedMinutes: 4,
      exerciseIds: [
        'exercise.history.kut.001.blank01',
        'exercise.history.kut.001.mcq01',
        'exercise.history.kut.001.tf01',
      ],
      id: 'lesson.history.kut.001',
      provenance: DRAFT,
      subtitle: 'Yönetme yetkisi ve hukuk',
      title: 'Kut ve Töre',
      topicId: T_KURULTAY,
    },
    {
      estimatedMinutes: 2,
      exerciseIds: ['exercise.history.review.001.card01'],
      id: 'lesson.history.review.001',
      provenance: DRAFT,
      subtitle: 'Ünitenin kavramları',
      title: 'Hızlı Tekrar',
      topicId: T_KURULTAY,
    },
    {
      estimatedMinutes: 5,
      exerciseIds: [
        'exercise.history.challenge.001.mcq01',
        'exercise.history.challenge.001.order01',
        'exercise.history.challenge.001.match01',
        'exercise.history.challenge.001.tf01',
      ],
      id: 'lesson.history.challenge.001',
      provenance: DRAFT,
      subtitle: 'Ünitenin sonu',
      title: 'Ünite Challenge',
      topicId: T_STATES,
    },
    {
      estimatedMinutes: 3,
      exerciseIds: [
        'exercise.history.medieval.001.card01',
        'exercise.history.medieval.001.mcq01',
      ],
      id: 'lesson.history.medieval.001',
      provenance: DRAFT,
      subtitle: 'Toprak, koruma ve hizmet',
      title: 'Feodalite',
      topicId: T_FEUDALISM,
    },
  ],

  pathNodes: [
    {
      id: 'path.history.time.01',
      kind: 'lesson',
      lessonId: 'lesson.history.time.001',
      order: 1,
      prerequisiteIds: [],
      title: 'Zamanı Ölçmek',
      unitId: U_TIME,
    },
    {
      id: 'path.history.time.02',
      kind: 'lesson',
      lessonId: 'lesson.history.eras.002',
      order: 2,
      prerequisiteIds: ['path.history.time.01'],
      title: 'Çağlar ve Dönemler',
      unitId: U_TIME,
    },
    {
      id: 'path.history.time.03',
      kind: 'checkpoint',
      lessonId: 'lesson.history.time.003',
      order: 3,
      prerequisiteIds: ['path.history.time.02'],
      title: 'Mini Challenge',
      unitId: U_TIME,
    },
    {
      id: 'path.history.first-turkish-states.01',
      kind: 'lesson',
      lessonId: 'lesson.history.states.001',
      order: 1,
      prerequisiteIds: ['path.history.time.03'],
      title: 'Devletleri Tanı',
      unitId: U_TURKISH_STATES,
    },
    {
      id: 'path.history.first-turkish-states.02',
      kind: 'lesson',
      lessonId: 'lesson.history.kurultay.001',
      order: 2,
      prerequisiteIds: ['path.history.first-turkish-states.01'],
      title: 'Kavramları Eşleştir',
      unitId: U_TURKISH_STATES,
    },
    {
      id: 'path.history.first-turkish-states.03',
      kind: 'lesson',
      lessonId: 'lesson.history.chronology.001',
      order: 3,
      prerequisiteIds: ['path.history.first-turkish-states.02'],
      title: 'Kronolojik Sırala',
      unitId: U_TURKISH_STATES,
    },
    {
      id: 'path.history.first-turkish-states.04',
      kind: 'lesson',
      lessonId: 'lesson.history.kut.001',
      order: 4,
      prerequisiteIds: ['path.history.first-turkish-states.03'],
      title: 'Kut ve Töre',
      unitId: U_TURKISH_STATES,
    },
    {
      id: 'path.history.first-turkish-states.05',
      kind: 'practice',
      lessonId: 'lesson.history.review.001',
      order: 5,
      prerequisiteIds: ['path.history.first-turkish-states.04'],
      title: 'Hızlı Tekrar',
      unitId: U_TURKISH_STATES,
    },
    {
      id: 'path.history.first-turkish-states.06',
      kind: 'checkpoint',
      lessonId: 'lesson.history.challenge.001',
      order: 6,
      prerequisiteIds: ['path.history.first-turkish-states.05'],
      title: 'Ünite Challenge',
      unitId: U_TURKISH_STATES,
    },
    {
      id: 'path.history.medieval-world.01',
      kind: 'lesson',
      lessonId: 'lesson.history.medieval.001',
      order: 1,
      prerequisiteIds: ['path.history.first-turkish-states.06'],
      title: 'Feodalite',
      unitId: U_MEDIEVAL,
    },
  ],
};
