import type { ContentIssue } from '@/modules/curriculum/domain/validate-content-bundle';

/**
 * The app's own complaints, verbatim.
 *
 * These are the two gates the app runs at startup, so an empty list here means
 * the app will load this content and a full one means it would refuse.
 */
export function IssueList({ issues }: { issues: readonly ContentIssue[] }) {
  if (issues.length === 0) {
    return (
      <section className="issues ok">
        <h3>Doğrulama</h3>
        <p>Uygulama bu içeriği olduğu gibi yükler.</p>
      </section>
    );
  }

  return (
    <section className="issues bad">
      <h3>Doğrulama · {issues.length} sorun</h3>
      <ul>
        {issues.map((issue, index) => (
          <li key={`${issue.at}-${index}`}>
            <code>{issue.at}</code>
            <span className="issue-code">{issue.code}</span>
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
