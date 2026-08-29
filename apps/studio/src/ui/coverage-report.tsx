import type { UnitCoverage } from '../model/coverage';

/** Where the curriculum is thin, counted rather than felt. */
export function CoverageReport({ coverage }: { coverage: readonly UnitCoverage[] }) {
  return (
    <section className="coverage">
      <h2>Kapsam raporu</h2>
      {coverage.map((unit) => (
        <article key={unit.unitId}>
          <h3>{unit.title}</h3>
          <p className="muted">
            {unit.exercises} soru · {unit.draft} taslak · {unit.reviewed} incelendi ·{' '}
            {unit.approved} onaylandı
            {unit.unmeasuredSkills > 0
              ? ` · ${unit.unmeasuredSkills} kazanım hiç ölçülmüyor`
              : ''}
          </p>
          <table className="records">
            <thead>
              <tr>
                <th>Kazanım</th>
                <th>Alt konu</th>
                <th>Soru</th>
                <th>Puanlanan</th>
                <th>Zorluk 1–5</th>
              </tr>
            </thead>
            <tbody>
              {unit.skills.map((skill) => (
                <tr className={skill.exercises === 0 ? 'gap' : undefined} key={skill.skillId}>
                  <td>{skill.title}</td>
                  <td>{skill.topicTitle}</td>
                  <td>{skill.exercises}</td>
                  <td>{skill.scored}</td>
                  <td>{skill.byDifficulty.join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ))}
    </section>
  );
}
