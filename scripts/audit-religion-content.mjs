import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const unitsDir = resolve(root, 'apps/mobile/src/modules/curriculum/content/data/units');
const names = (await readdir(unitsDir)).filter((name) => name.startsWith('tyt.religion.') && name.endsWith('.json')).sort();
const units = await Promise.all(names.map(async (name) => JSON.parse(await readFile(resolve(unitsDir, name), 'utf8'))));
const exercises = units.flatMap((unit) => unit.exercises);
const lessons = units.flatMap((unit) => unit.lessons);
const skills = units.flatMap((unit) => unit.skills);
const scored = exercises.filter((exercise) => exercise.kind !== 'flashcard');
const counts = (items, key) => Object.fromEntries([...new Set(items.map((item) => item[key]))].sort().map((value) => [value, items.filter((item) => item[key] === value).length]));
const coverage = new Map(skills.map((skill) => [skill.id, 0]));
for (const exercise of scored) for (const skillId of exercise.skillIds) coverage.set(skillId, (coverage.get(skillId) ?? 0) + 1);
const coverageValues = [...coverage.values()];
const referenced = new Set(lessons.flatMap((lesson) => lesson.exerciseIds));
const unreferenced = exercises.filter((exercise) => !referenced.has(exercise.id)).map((exercise) => exercise.id);
const underCovered = [...coverage].filter(([, value]) => value < 3).map(([skillId, value]) => ({ skillId, scoredExercises: value }));
const semantic = {
  directKnowledge: scored.filter((exercise) => exercise.kind === 'multipleChoice' && exercise.id.endsWith('.mcq01')).length,
  paragraphInterpretation: scored.filter((exercise) => exercise.kind === 'multipleChoice' && exercise.id.endsWith('.mcq02')).length,
  skillApplication: scored.filter((exercise) => exercise.kind === 'multipleChoice' && exercise.id.endsWith('.mcq03')).length,
  contextAndLimits: scored.filter((exercise) => exercise.kind === 'multipleChoice' && exercise.id.endsWith('.mcq04')).length,
  relationshipAndOrdering: scored.filter((exercise) => exercise.kind === 'matching' || exercise.kind === 'ordering').length,
  trueFalseJudgment: scored.filter((exercise) => exercise.kind === 'trueFalse').length,
};
const unitSummary = units.map((unit) => ({ unitId: unit.unitId, topics: unit.topics.length, skills: unit.skills.length, lessons: unit.lessons.length, exercises: unit.exercises.length }));
const report = {
  unitSummary,
  totals: { units: units.length, topics: units.reduce((n, unit) => n + unit.topics.length, 0), skills: skills.length, lessons: lessons.length, exercises: exercises.length, scoredExercises: scored.length },
  exerciseKinds: counts(exercises, 'kind'),
  difficulty: counts(exercises, 'difficulty'),
  semantic: Object.fromEntries(Object.entries(semantic).map(([key, value]) => [key, { count: value, percentOfScored: Number((value / scored.length * 100).toFixed(1)) }])),
  nonDirectKnowledgePercent: Number(((scored.length - semantic.directKnowledge) / scored.length * 100).toFixed(1)),
  skillCoverage: { min: Math.min(...coverageValues), average: Number((coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length).toFixed(2)), max: Math.max(...coverageValues), underThree: underCovered },
  integrity: { unreferencedExercises: unreferenced },
};
console.log(JSON.stringify(report, null, 2));
if (underCovered.length || unreferenced.length) process.exitCode = 1;
