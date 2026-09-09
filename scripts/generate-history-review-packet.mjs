import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dataDir = path.join(root, 'apps/mobile/src/modules/curriculum/content/data');
const unitsDir = path.join(dataDir, 'units');
const subjectKey = process.argv.find((argument) => argument.startsWith('--subject='))?.split('=')[1] ?? 'history';
const configs = {
  geography: { label: 'Coğrafya', output: 'TYT_GEOGRAPHY_REVIEW_PACKET.md', subjectId: 'tyt.geography' },
  history: { label: 'Tarih', output: 'TYT_HISTORY_REVIEW_PACKET.md', subjectId: 'tyt.history' },
  philosophy: {
    label: 'Felsefe',
    output: 'TYT_PHILOSOPHY_REVIEW_PACKET.md',
    subjectId: 'tyt.philosophy',
    skillRepeatThreshold: 4,
  },
};
const config = configs[subjectKey];
if (!config) throw new Error(`Unsupported review subject: ${subjectKey}`);
const outputPath = path.join(root, 'docs/CONTENT_REVIEWS', config.output);
const subjectId = config.subjectId;
const scoredKinds = new Set(['fillBlank', 'matching', 'multipleChoice', 'ordering', 'trueFalse']);
const philosopherNames = [
  'aristoteles', 'bergson', 'bentham', 'comte', 'demokritos', 'descartes', 'farabi', 'gazali',
  'hegel', 'herakleitos', 'hobbes', 'hume', 'kant', 'kuhn', 'leibniz', 'locke', 'marx', 'mill',
  'nietzsche', 'parmenides', 'platon', 'popper', 'protagoras', 'rousseau', 'sartre', 'sokrates', 'spinoza',
];

const curriculum = JSON.parse(await readFile(path.join(dataDir, 'curriculum.json'), 'utf8'));
const reviewers = JSON.parse(await readFile(path.join(dataDir, 'reviewers.json'), 'utf8'));
const subject = curriculum.subjects.find((candidate) => candidate.id === subjectId);
if (!subject) throw new Error(`Subject not found: ${subjectId}`);

const subjectFiles = (await readdir(unitsDir))
  .filter((name) => name.startsWith(`${subjectId}.`) && name.endsWith('.json'))
  .sort();
const loaded = await Promise.all(
  subjectFiles.map(async (name) => JSON.parse(await readFile(path.join(unitsDir, name), 'utf8'))),
);
const unitFiles = new Map(loaded.map((unit) => [unit.unitId, unit]));
const missing = subject.unitIds.filter((unitId) => !unitFiles.has(unitId));
const extra = [...unitFiles.keys()].filter((unitId) => !subject.unitIds.includes(unitId));
if (missing.length || extra.length) {
  throw new Error(`${config.label} unit drift. Missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}.`);
}

const units = subject.unitIds.map((unitId) => unitFiles.get(unitId));
const definitions = new Map(curriculum.units.map((unit) => [unit.id, unit]));
const subjectExercises = units.flatMap((unit) => unit.exercises);
const promptGroups = groupBy(subjectExercises, duplicateFingerprint);
const duplicateIds = new Set(
  [...promptGroups.entries()]
    .filter(([key, group]) => key && group.length > 1)
    .flatMap(([, group]) => group.map((exercise) => exercise.id)),
);
const sharedStemGroups = [...groupBy(subjectExercises.filter((exercise) => scoredKinds.has(exercise.kind)), sharedStemFingerprint).entries()]
  .filter(([key, group]) => key && group.length > 1 && new Set(group.map(duplicateFingerprint)).size > 1)
  .map(([, group]) => group.map((exercise) => exercise.id));
const sharedStemByExercise = new Map(
  sharedStemGroups.flatMap((ids) => ids.map((id) => [id, ids])),
);
const reports = units.map((unit, index) => reportFor(unit, index));
const totals = {
  approvedExercises: sum(reports, 'approvedExercises'),
  approvedLessons: sum(reports, 'approvedLessons'),
  attention: reports.reduce((count, report) => count + report.attention.length, 0),
  exercises: sum(reports, 'exercises'), lessons: sum(reports, 'lessons'),
  scored: sum(reports, 'scored'), skills: sum(reports, 'skills'), topics: sum(reports, 'topics'),
};
const authorized = reviewers.filter((reviewer) =>
  reviewer.status === 'active' && reviewer.type === 'humanSubjectMatterExpert' && reviewer.subjectIds.includes(subjectId));
const document = render();

if (process.argv.includes('--write')) {
  await writeFile(outputPath, document, 'utf8');
  console.log(`Updated ${path.relative(root, outputPath)}.`);
} else {
  const current = await readFile(outputPath, 'utf8').catch(() => '');
  if (current !== document) {
    console.error(`TYT ${config.label} review packet is stale. Run \`npm run content:${subjectKey}:review:update\` and commit it.`);
    process.exitCode = 1;
  } else console.log(`TYT ${config.label} review packet matches ${units.length} authored units.`);
}

function reportFor(unit, index) {
  const definition = definitions.get(unit.unitId);
  const exerciseById = new Map(unit.exercises.map((exercise) => [exercise.id, exercise]));
  const referenced = new Set(unit.lessons.flatMap((lesson) => lesson.exerciseIds));
  const measured = new Set(unit.exercises.filter((exercise) => scoredKinds.has(exercise.kind)).flatMap((exercise) => exercise.skillIds));
  const attention = unit.exercises.flatMap((exercise) => attentionFor(exercise).map((reason) => ({ id: exercise.id, reason })));
  const skillLoads = unit.skills.map((skill) => ({
    count: unit.exercises.filter((exercise) => scoredKinds.has(exercise.kind) && exercise.skillIds.includes(skill.id)).length,
    id: skill.id,
  }));
  const similarQuestionGroups = [...new Map(
    unit.exercises
      .map((exercise) => sharedStemByExercise.get(exercise.id))
      .filter(Boolean)
      .map((ids) => [ids.join('|'), ids]),
  ).values()];
  return {
    approvedExercises: unit.exercises.filter((exercise) => statusOf(exercise) === 'approved').length,
    approvedLessons: unit.lessons.filter((lesson) => statusOf(lesson) === 'approved').length,
    attention,
    difficulty: [1, 2, 3, 4, 5].map((value) => unit.exercises.filter((exercise) => exercise.difficulty === value).length),
    scoredDifficulty: [1, 2, 3, 4, 5].map((value) => unit.exercises.filter((exercise) => scoredKinds.has(exercise.kind) && exercise.difficulty === value).length),
    exercises: unit.exercises.length, index: index + 1, lessons: unit.lessons.length,
    concepts: unit.concepts.map((concept) => ({
      definition: text(concept.definition), id: concept.id, term: text(concept.term), topicId: concept.topicId,
    })),
    measuredSkills: measured.size,
    records: unit.lessons.flatMap((lesson) => [
      { id: lesson.id, kind: 'lesson', label: [lesson.title, lesson.subtitle].filter(Boolean).join(' — '), skills: lesson.skillIds ?? [], status: statusOf(lesson) },
      ...lesson.exerciseIds.map((id) => exerciseById.get(id)).filter((exercise) => exercise && scoredKinds.has(exercise.kind)).map((exercise) => ({
        attention: attentionFor(exercise), difficulty: exercise.difficulty, id: exercise.id,
        answer: answerText(exercise), explanation: text(exercise.explanation),
        kind: exercise.kind, label: questionText(exercise), skills: exercise.skillIds, status: statusOf(exercise),
      })),
    ]),
    scored: unit.exercises.filter((exercise) => scoredKinds.has(exercise.kind)).length,
    repeatedSkills: skillLoads.filter(({ count }) => count > (config.skillRepeatThreshold ?? 6)),
    similarQuestionGroups,
    skills: unit.skills.length,
    skillsWithoutScored: unit.skills.filter((skill) => !measured.has(skill.id)).map((skill) => skill.id),
    title: definition?.title ?? unit.unitId,
    topicOrder: unit.topics.map((topic) => ({ id: topic.id, title: topic.title })),
    topicOrderMatches: equal(definition?.topicIds ?? [], unit.topics.map((topic) => topic.id)),
    topics: unit.topics.length, unitId: unit.unitId,
    unreferenced: unit.exercises.filter((exercise) => !referenced.has(exercise.id)).map((exercise) => exercise.id),
  };
}

function attentionFor(exercise) {
  const reasons = [];
  const explanation = text(exercise.explanation);
  if (duplicateIds.has(exercise.id)) reasons.push('Aynı soru metni');
  if (questionText(exercise).includes('kazanımının doğru karşılığıdır')) {
    reasons.push('Kazanım metnini soru cümlesinde kullanıyor');
  }
  if (explanation.length < 45) reasons.push('Kısa açıklama (<45 karakter)');
  if (normalize(explanation) === normalize(questionText(exercise))) reasons.push('Açıklama soru metnini tekrarlıyor');
  const combinedText = normalize(`${questionText(exercise)} ${exercise.hint ?? ''} ${exercise.subtitle ?? ''} ${answerText(exercise)}`);
  if (subjectKey === 'philosophy') {
    if (promptExplanationOverlap(exercise) >= 0.8) reasons.push('Açıklama soru kökünü büyük ölçüde tekrarlıyor');
    if (count(explanation, '“') !== count(explanation, '”')) reasons.push('Açıklamada eşleşmeyen akıllı tırnak');
    if (exercise.kind === 'fillBlank') reasons.push('Kavram tanımı/doğrudan kavram karşılığı insan reviewer tarafından doğrulanmalı');
    if (exercise.kind === 'matching') reasons.push('Kavram veya görüş eşleştirmeleri insan reviewer tarafından tek tek doğrulanmalı');
    if (exercise.kind === 'trueFalse' && /ayni kavram degildir|ayirt/u.test(combinedText)) {
      reasons.push('Benzer kavramların ayrımı ve ifadenin doğruluk kapsamı doğrulanmalı');
    }
    if (containsPhilosopherName(combinedText)) reasons.push('Filozof/görüş eşleştirmesi insan reviewer tarafından doğrulanmalı');
    if (/\b(her zaman|hicbir zaman|asla|daima|tamamen|yalnizca|kesinlikle|tek basina|degismez|zorunlu olarak)\b/u.test(combinedText)) {
      reasons.push('Mutlak ifade veya kolay elenen mutlak çeldirici; kapsamı ve ayırt ediciliği doğrulanmalı');
    }
  }
  if (/\b(asagidaki|yukaridaki|verilen)\s+(harita|gorsel|sekil|grafik|tablo|profil)\p{L}*\b/u.test(combinedText)) {
    reasons.push('Referans verilen harita/görsel bağlamı payload içinde doğrulanmalı');
  }
  if (subjectKey === 'geography' && /\b(izohips|harita|koordinat|profil|dagilis)\p{L}*\b/u.test(combinedText)) {
    reasons.push('Harita/görsel bağlamı veya text-only yeterliliği insan reviewer tarafından değerlendirilmeli');
  }
  if (exercise.kind === 'multipleChoice') {
    const labels = exercise.options.map((option) => normalize(option.label));
    if (new Set(labels).size !== labels.length) reasons.push('Tekrarlanan seçenek metni');
  }
  if (exercise.kind === 'matching') {
    for (const key of ['left', 'right']) {
      const labels = exercise.pairs.map((pair) => normalize(pair[key]));
      if (new Set(labels).size !== labels.length) reasons.push('Tekrarlanan eşleştirme tarafı');
    }
  }
  return [...new Set(reasons)];
}

function render() {
  const reviewerState = authorized.length
    ? `Yetkili aktif reviewer: ${authorized.map((r) => `${r.displayName} (\`${r.id}\`)`).join(', ')}`
    : `**BLOCKED:** Registry’de TYT ${config.label} için aktif insan alan uzmanı yok. Hiçbir kayıt yükseltilmemelidir.`;
  return `${[
    `# TYT ${config.label} academic review packet`, '',
    `<!-- Generated by npm run content:${subjectKey}:review:update. Do not edit by hand. -->`, '',
    `Content version: \`${curriculum.contentVersion}\`  `,
    `Curriculum version: \`${curriculum.curriculumVersion}\`  `,
    `Subject: \`${subjectId}\`  `,
    `Unit order source: \`curriculum.json\` (${units.length} units)`, '',
    '## Review boundary', '',
    'This packet is an inventory and triage aid. Automated checks prove shape, references and answerability; they do not prove historical accuracy, curriculum suitability or pedagogical quality. Only a registered human subject-matter expert may move records from `draft` to `reviewed`, and then from `reviewed` to `approved` in a separate attestation.', '',
    reviewerState, '', '## Summary', '',
    '| Units | Topics | Skills | Lessons | Scored exercises | All exercises | Approved lessons | Approved exercises |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${units.length} | ${totals.topics} | ${totals.skills} | ${totals.lessons} | ${totals.scored} | ${totals.exercises} | ${totals.approvedLessons} | ${totals.approvedExercises} |`, '',
    `${totals.attention} automatic attention item(s). These prioritize human review; they are not claims of academic error.`, '',
    ...(subjectKey === 'philosophy' ? [
      'Philosophy-specific triage covers concept definitions, concept/view matching, closely related concepts, absolute wording, prompt–explanation overlap, repeated skill coverage and shared-stem question candidates. A signal is a request for human judgment, not an academic finding.', '',
      `Named philosopher terms detected by the deterministic vocabulary scan: ${countPhilosopherMentions(subjectExercises)}. A zero count must be reviewed as a possible curriculum-completeness gap; the scan does not prove names are required or absent from every pedagogically acceptable treatment.`, '',
    ] : []),
    '## Human reviewer workflow', '',
    '- [ ] Confirm each unit/topic order and TYT curriculum scope.',
    '- [ ] Check every lesson for factual accuracy, missing context and misleading simplification.',
    '- [ ] Solve every scored exercise independently; confirm keyed answers and distractors.',
    '- [ ] Confirm explanations teach why the answer is correct and introduce no new error.',
    '- [ ] Confirm skill mappings match what each exercise measures.',
    '- [ ] Resolve or explicitly accept every automatic attention item.',
    '- [ ] In Studio, select the registered reviewer and attest records as `reviewed`.',
    '- [ ] In a subsequent signed pass, move reviewed records to `approved` and inspect the Git diff.', '',
    'After final human attestations, run:', '', '```sh',
    `npm run content:${subjectKey}:review:update`, `npm run content:${subjectKey}:review:check`,
    'npm run content:production:check', 'npm run lint', 'npm run typecheck', 'npm test', '```', '',
    'The production check validates the approved subset and may pass with an empty production catalogue. A green gate therefore proves that nothing unapproved leaked into production; it does not prove academic readiness. Release remains blocked until the summary shows the intended human-approved lesson/exercise totals and no critical academic item remains.', '',
    ...reports.flatMap(renderUnit),
  ].join('\n')}\n`;
}

function renderUnit(unit) {
  const structural = [
    unit.topicOrderMatches ? null : 'Curriculum and unit-file topic order differ.',
    unit.skillsWithoutScored.length ? `Skills without scored exercise: ${unit.skillsWithoutScored.join(', ')}` : null,
    unit.unreferenced.length ? `Unreferenced exercises: ${unit.unreferenced.join(', ')}` : null,
  ].filter(Boolean);
  return [
    `## ${String(unit.index).padStart(2, '0')} — ${unit.title}`, '', `\`${unit.unitId}\``, '',
    `Topics: ${unit.topics} · Skills: ${unit.skills} (${unit.measuredSkills} measured) · Lessons: ${unit.lessons} · Exercises: ${unit.exercises} (${unit.scored} scored) · Difficulty 1–5: ${unit.difficulty.join(' / ')}${subjectKey === 'philosophy' ? ` (scored: ${unit.scoredDifficulty.join(' / ')})` : ''} · Approved lessons/exercises: ${unit.approvedLessons}/${unit.approvedExercises}`, '',
    structural.length ? `Automated structural triage: **${structural.join(' ')}**` : 'Automated structural triage: clear.', '',
    unit.attention.length ? `Automatic attention items:\n\n${unit.attention.map((item) => `- [ ] \`${item.id}\`: ${item.reason}`).join('\n')}` : 'Automatic attention items: none.', '',
    ...(subjectKey === 'philosophy' ? [
      '### Curriculum topic order', '',
      ...unit.topicOrder.map((topic, index) => `${index + 1}. ${topic.title} — \`${topic.id}\``), '',
      '### Concept definitions', '',
      '| Sign-off | Concept | Topic | Term | Definition |',
      '| --- | --- | --- | --- | --- |',
      ...unit.concepts.map((concept) => `| [ ] | \`${concept.id}\` | \`${concept.topicId}\` | ${escapeCell(concept.term)} | ${escapeCell(concept.definition)} |`), '',
      '### Repetition and similarity triage', '',
      unit.repeatedSkills.length
        ? `Skills mapped by more than ${config.skillRepeatThreshold ?? 6} scored exercises (review for excessive repetition):\n\n${unit.repeatedSkills.map((skill) => `- [ ] \`${skill.id}\`: ${skill.count} scored exercises`).join('\n')}`
        : `No skill exceeds the automatic repetition threshold of ${config.skillRepeatThreshold ?? 6} scored exercises.`, '',
      unit.similarQuestionGroups.length
        ? `Shared-stem / very-similar question candidates (confirm that each measures a distinct judgment):\n\n${unit.similarQuestionGroups.map((ids) => `- [ ] ${ids.map((id) => `\`${id}\``).join(' ↔ ')}`).join('\n')}`
        : 'Shared-stem / very-similar question candidates: none.', '',
      '### Lesson and scored-exercise sign-off', '',
    ] : []),
    '| Sign-off | Record | Type | Diff. | Status | Skills | Prompt/title | Key/payload | Explanation | Attention |',
    '| --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |',
    ...unit.records.map((r) => `| [ ] | \`${r.id}\` | ${r.kind} | ${r.difficulty ?? '—'} | ${r.status} | ${r.skills.map((s) => `\`${s}\``).join('<br>') || '—'} | ${escapeCell(r.label)} | ${escapeCell(r.answer ?? '—')} | ${escapeCell(r.explanation ?? '—')} | ${r.attention?.join('; ') || '—'} |`), '',
    '- [ ] Unit scope/order approved by human reviewer.',
    '- [ ] Every lesson and scored exercise above checked and signed off.',
    '- [ ] No unresolved critical academic question/report remains.', '',
  ];
}

function questionText(exercise) {
  return exercise.kind === 'flashcard' ? exercise.cards.map((card) => card.front).join(' · ') : text(exercise.prompt ?? exercise.statement ?? exercise.title ?? exercise.id);
}
function answerText(exercise) {
  if (exercise.kind === 'multipleChoice') {
    const option = exercise.options.find((candidate) => candidate.id === exercise.correctOptionId);
    return `${exercise.options.map((candidate) => `${candidate.id}: ${candidate.label}`).join(' / ')} → Doğru: ${option?.label ?? exercise.correctOptionId}`;
  }
  if (exercise.kind === 'trueFalse') return exercise.correctAnswer ? 'Doğru' : 'Yanlış';
  if (exercise.kind === 'fillBlank') {
    const labels = new Map(exercise.bank.map((token) => [token.id, token.label]));
    return exercise.solutionTokenIds.map((id) => labels.get(id) ?? id).join(' / ');
  }
  if (exercise.kind === 'matching') return exercise.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(' / ');
  if (exercise.kind === 'ordering') return exercise.correctOrder.map((id) => exercise.items.find((item) => item.id === id)?.label ?? id).join(' → ');
  return 'Puanlanmayan kart';
}
function duplicateFingerprint(exercise) {
  const payload = exercise.kind === 'matching'
    ? exercise.pairs.flatMap((pair) => [pair.left, pair.right])
    : exercise.kind === 'ordering'
      ? exercise.items.map((item) => item.label)
      : subjectKey === 'philosophy' && exercise.kind === 'fillBlank'
        ? [exercise.hint, ...exercise.bank.map((token) => token.label)]
      : [];
  return normalize([exercise.kind, questionText(exercise), ...payload].join(' | '));
}
function sharedStemFingerprint(exercise) {
  const stem = text(questionText(exercise)).split(/\n\s*\n/u)[0];
  return normalize(stem).length >= 40 ? normalize(stem) : '';
}
function promptExplanationOverlap(exercise) {
  const prompt = new Set(normalize(questionText(exercise).split(/\n\s*\n/u)[0]).split(' ').filter(Boolean));
  if (prompt.size < 6) return 0;
  const explanation = new Set(normalize(exercise.explanation).split(' ').filter(Boolean));
  return [...prompt].filter((word) => explanation.has(word)).length / prompt.size;
}
function containsPhilosopherName(value) {
  return philosopherNames.some((name) => new RegExp(`\\b${name}\\b`, 'u').test(value));
}
function countPhilosopherMentions(exercises) {
  return exercises.filter((exercise) => containsPhilosopherName(normalize(`${questionText(exercise)} ${answerText(exercise)} ${exercise.explanation ?? ''}`))).length;
}
function statusOf(record) { return record.provenance?.reviewStatus ?? 'missing'; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function count(value, needle) { return [...text(value)].filter((character) => character === needle).length; }
function normalize(value) {
  return text(value)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .replaceAll('ı', 'i')
    .replace(/[\p{P}\p{S}\s]+/gu, ' ')
    .trim();
}
function escapeCell(value) { return text(value).replaceAll('|', '\\|').replaceAll('\n', ' '); }
function sum(items, key) { return items.reduce((total, item) => total + item[key], 0); }
function equal(left, right) { return left.length === right.length && left.every((value, index) => value === right[index]); }
function groupBy(items, keyOf) {
  const groups = new Map();
  for (const item of items) { const key = keyOf(item); groups.set(key, [...(groups.get(key) ?? []), item]); }
  return groups;
}
