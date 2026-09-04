import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { assertParsedContentBundle } from '@/modules/curriculum/domain/parse-content-bundle';
import { ContentValidationError } from '@/modules/curriculum/domain/validate-content-bundle';

/** The authored bundle as raw data, the way it leaves the JSON files. */
function raw(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(tytDraftBundle)) as Record<string, unknown>;
}

function issuesOf(mutate: (bundle: Record<string, unknown>) => void): readonly string[] {
  const bundle = raw();
  mutate(bundle);
  try {
    assertParsedContentBundle(bundle);
  } catch (cause) {
    if (cause instanceof ContentValidationError) {
      return cause.issues.map((issue) => issue.at);
    }
    throw cause;
  }

  return [];
}

describe('content shape parsing', () => {
  it('accepts the authored bundle unchanged', () => {
    expect(assertParsedContentBundle(raw())).toMatchObject({
      contentVersion: tytDraftBundle.contentVersion,
    });
  });

  it('rejects an exercise kind the app has no contract for', () => {
    const issues = issuesOf((bundle) => {
      const exercises = bundle.exercises as Record<string, unknown>[];
      exercises[0]!.kind = 'multipleChoise';
    });

    expect(issues).toContain('exercises[0].kind');
  });

  it('rejects a question that lost a field its kind requires', () => {
    const issues = issuesOf((bundle) => {
      const exercises = bundle.exercises as Record<string, unknown>[];
      const multipleChoice = exercises.find((exercise) => exercise.kind === 'multipleChoice')!;
      delete multipleChoice.prompt;
    });

    expect(issues.some((at) => at.endsWith('.prompt'))).toBe(true);
  });

  it('rejects a difficulty outside the authored scale', () => {
    const issues = issuesOf((bundle) => {
      const exercises = bundle.exercises as Record<string, unknown>[];
      exercises[0]!.difficulty = 9;
    });

    expect(issues).toContain('exercises[0].difficulty');
  });

  it('rejects a review status that is not one of the three', () => {
    const issues = issuesOf((bundle) => {
      const exercises = bundle.exercises as Record<string, unknown>[];
      (exercises[0]!.provenance as Record<string, unknown>).reviewStatus = 'onaylandi';
    });

    expect(issues).toContain('exercises[0].provenance.reviewStatus');
  });

  it('requires reviewer attribution for reviewed and approved content', () => {
    const issues = issuesOf((bundle) => {
      const exercises = bundle.exercises as Record<string, unknown>[];
      (exercises[0]!.provenance as Record<string, unknown>).reviewStatus = 'approved';
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        'exercises[0].provenance.reviewedBy',
        'exercises[0].provenance.reviewedAt',
      ]),
    );
  });

  it('rejects an empty title rather than rendering a blank card', () => {
    const issues = issuesOf((bundle) => {
      const lessons = bundle.lessons as Record<string, unknown>[];
      lessons[0]!.title = '   ';
    });

    expect(issues).toContain('lessons[0].title');
  });

  it('reports every malformed record at once', () => {
    const issues = issuesOf((bundle) => {
      const exercises = bundle.exercises as Record<string, unknown>[];
      exercises[0]!.difficulty = 0;
      exercises[1]!.explanation = '';
      (bundle.lessons as Record<string, unknown>[])[0]!.estimatedMinutes = 'beş';
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        'exercises[0].difficulty',
        'exercises[1].explanation',
        'lessons[0].estimatedMinutes',
      ]),
    );
  });

  it('refuses data that is not a bundle at all', () => {
    expect(() => assertParsedContentBundle([])).toThrow(ContentValidationError);
    expect(() => assertParsedContentBundle(null)).toThrow(ContentValidationError);
  });
});
