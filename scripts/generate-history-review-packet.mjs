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
};
const config = configs[subjectKey];
if (!config) throw new Error(`Unsupported review subject: ${subjectKey}`);
const outputPath = path.join(root, 'docs/CONTENT_REVIEWS', config.output);
const subjectId = config.subjectId;
const scoredKinds = new Set(['fillBlank', 'matching', 'multipleChoice', 'ordering', 'trueFalse']);

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
const promptGroups = groupBy(units.flatMap((unit) => unit.exercises), duplicateFingerprint);
const duplicateIds = new Set(
  [...promptGroups.entries()]
    .filter(([key, group]) => key && group.length > 1)
    .flatMap(([, group]) => group.map((exercise) => exercise.id)),
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
  return {
    approvedExercises: unit.exercises.filter((exercise) => statusOf(exercise) === 'approved').length,
    approvedLessons: unit.lessons.filter((lesson) => statusOf(lesson) === 'approved').length,
    attention,
    difficulty: [1, 2, 3, 4, 5].map((value) => unit.exercises.filter((exercise) => exercise.difficulty === value).length),
    exercises: unit.exercises.length, index: index + 1, lessons: unit.lessons.length,
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
    skills: unit.skills.length,
    skillsWithoutScored: unit.skills.filter((skill) => !measured.has(skill.id)).map((skill) => skill.id),
    title: definition?.title ?? unit.unitId,
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
    `Topics: ${unit.topics} · Skills: ${unit.skills} (${unit.measuredSkills} measured) · Lessons: ${unit.lessons} · Exercises: ${unit.exercises} (${unit.scored} scored) · Difficulty 1–5: ${unit.difficulty.join(' / ')} · Approved lessons/exercises: ${unit.approvedLessons}/${unit.approvedExercises}`, '',
    structural.length ? `Automated structural triage: **${structural.join(' ')}**` : 'Automated structural triage: clear.', '',
    unit.attention.length ? `Automatic attention items:\n\n${unit.attention.map((item) => `- [ ] \`${item.id}\`: ${item.reason}`).join('\n')}` : 'Automatic attention items: none.', '',
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
      : [];
  return normalize([exercise.kind, questionText(exercise), ...payload].join(' | '));
}
function statusOf(record) { return record.provenance?.reviewStatus ?? 'missing'; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
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
