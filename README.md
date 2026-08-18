# Qisquiz

A study app for **IBM exam C1000-179: Fundamentals of Quantum Computing Using
Qiskit v2.X Developer**. Practise by section, or sit a full-length mock exam
under real conditions.

Live: <https://qisquiz.vercel.app/>

> Qisquiz is an independent study tool. It is not affiliated with, endorsed by,
> or sponsored by IBM. Every question is original and written for learning; none
> is taken from, reconstructed from, or predictive of the real exam. A passing
> result here is an unofficial estimate, not a forecast.

## What it does

- **Section practice** across all eight exam sections, filterable by difficulty,
  tag, and question type.
- **Mock exam** matching the published exam configuration, with a real timer,
  mark-for-review, resume after a refresh, and a raw-score result.
- **Review** of every missed question, including the original code block, your
  answer, the key, an explanation that addresses the wrong options, and a link
  to the exact documentation page behind the question.
- **Dashboard** tracking coverage and accuracy, kept in this browser only.

## Exam configuration

Verified against the [official IBM certification page](https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400)
on **2026-08-18**:

| | |
| --- | --- |
| Exam code | C1000-179 |
| Questions | 68 |
| Questions to pass | 47 |
| Time allowed | 90 minutes |

**The pass criterion is a raw score, not a percentage.** 47 of 68 is 69.1%, so a
"70% to pass" rule would wrongly fail a passing score. The app compares correct
answers against 47 and never derives pass/fail from a rounded percentage. This
is covered by tests asserting that 47/68 passes, 46/68 fails, 68/68 passes, and
that unanswered questions count as incorrect.

Section weights (16/11/18/15/12/12/10/6) live in `src/config/exam.ts` and drive
both the mock-exam composition and the per-section authoring targets by the
largest-remainder method. Nothing else hard-codes a derived number, so if IBM
changes the blueprint, that one file is the only place to edit.

## The question bank

<!-- BEGIN:BANK_SUMMARY -->

**Total questions:** 321

| Section | Title | Weight | Questions | Share |
| --- | --- | --- | --- | --- |
| 1 | Perform quantum operations | 16% | 51 | 16% |
| 2 | Visualize quantum circuits, measurements, and states | 11% | 35 | 11% |
| 3 | Create quantum circuits | 18% | 58 | 18% |
| 4 | Run quantum circuits | 15% | 48 | 15% |
| 5 | Use the sampler primitive | 12% | 39 | 12% |
| 6 | Use the estimator primitive | 12% | 38 | 12% |
| 7 | Retrieve and analyze the results of quantum circuits | 10% | 32 | 10% |
| 8 | Operate with OpenQASM | 6% | 20 | 6% |

| Difficulty | Questions | Share |
| --- | --- | --- |
| easy | 80 | 25% |
| medium | 142 | 44% |
| hard | 99 | 31% |

| Question type | Questions | Share |
| --- | --- | --- |
| `code-behavior` | 94 | 29% |
| `concept` | 62 | 19% |
| `workflow-selection` | 36 | 11% |
| `code-output` | 30 | 9% |
| `debugging` | 27 | 8% |
| `multi-step-reasoning` | 24 | 7% |
| `result-interpretation` | 24 | 7% |
| `code-completion` | 10 | 3% |
| `documentation-navigation` | 8 | 2% |
| `broadcasting-shape` | 6 | 2% |

| Code status | Questions |
| --- | --- |
| `none` | 156 |
| `illustrative` | 79 |
| `executable` | 64 |
| `intentional-error` | 12 |
| `partial-completion` | 10 |

**Code-based questions:** 165 of 321 (51%)

<!-- END:BANK_SUMMARY -->

Full breakdowns:

- [`docs/question-bank-audit.md`](docs/question-bank-audit.md) — what was wrong
  before this release and the per-question audit
- [`docs/exam-objective-coverage.md`](docs/exam-objective-coverage.md) — coverage
  against the blueprint, by section and by concept
- [`docs/qiskit-code-verification.md`](docs/qiskit-code-verification.md) — how
  code snippets are executed and checked
- [`docs/question-writing-guidelines.md`](docs/question-writing-guidelines.md) —
  the rules, all of them enforced automatically

## Answer integrity

The app is built so that nothing visible before you answer can narrow the option
set.

- Correctness is carried by a stable `correctChoiceId`, so the display order is
  shuffled every session without any risk of mis-grading.
- Study mode withholds tags, concept, objective, references, common mistakes,
  and explanations until you answer.
- The mock exam additionally hides section, difficulty, and question type until
  the whole exam is submitted, because those labels narrow answers and are not
  part of a realistic mixed sitting.
- `npm run validate:questions` fails the build on answer leakage, including an
  identifier that distinguishes the key appearing in the code, an import line,
  or the metadata.

## Your progress

Progress is stored in your browser's local storage under
`qisquiz.studyProgress.v2`. There is no account, no server, and no telemetry.

Data written by an earlier version (`qisquiz.studyProgress.v1`) is migrated
automatically on first load. Attempt counts, correct and incorrect tallies,
bookmarks, mock attempts, and study preferences are all carried forward, and the
v1 key is left in place so nothing is lost. One thing cannot be carried forward:
v1 recorded which answer you picked as a position in a rotated list that no
longer exists, so those are marked "recorded before this app tracked stable
answer ids" rather than being reinterpreted as a different answer.

Clearing progress is explicit and never automatic.

The dashboard distinguishes figures that are easy to confuse:

- **Unique questions attempted** versus **total attempts**, so repeats are visible.
- **First-attempt accuracy** versus **all-attempt accuracy**, so retrying the
  same question cannot inflate an apparent readiness score.
- **Not attempted** versus **low accuracy**, which are different problems.
- Weak areas are only named once at least five answers exist for them, and every
  figure shows its sample size.

## Development

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run validate:questions` | Question-quality gate: leakage, duplicates, references, coverage, diversity |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, desktop and mobile) |
| `npm run build` | Production build |
| `npm run check` | Every non-destructive release gate, in order |
| `npm run docs:generate` | Regenerate the data-derived documentation tables |
| `npm run export:snippets` | Dump code snippets for the Qiskit verifier |

CI runs the same gates on every pull request, plus the Qiskit snippet
verification in a real Python environment.

### Adding a question

See [`docs/question-writing-guidelines.md`](docs/question-writing-guidelines.md)
for the rules. In short: add a seed to the relevant
`src/data/questions/section-N.ts` with the next free id, write distractors that
a learner with a specific misconception would actually pick, refute the strong
ones by name in the explanation, cite the exact documentation page, set
`lastReviewedAt`, and run `npm run check`.

Question ids and choice ids are permanent. Published ids are protected by a
test, because stored progress refers to them; rewrite a bad question in place
rather than deleting it.

### Verifying Qiskit code

```bash
python -m venv .venv-qiskit
./.venv-qiskit/bin/pip install "qiskit[visualization]==2.*" qiskit-ibm-runtime
npm run export:snippets -- snippets.json
./.venv-qiskit/bin/python scripts/verify-qiskit-code.py snippets.json
```

Snippets marked `executable` are run and their output compared against the key.
Everything else is syntax-checked or, for OpenQASM, parsed by Qiskit's importer.
No credentials are used and no hardware job is ever submitted.

### After a Qiskit release

Refresh the documentation URL snapshot, re-run the validator and the Qiskit
verifier, update `qiskitVersion` and `lastReviewedAt` on anything re-checked,
and re-read the official blueprint. The exact commands are in
[`docs/question-writing-guidelines.md`](docs/question-writing-guidelines.md).

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4,
prism-react-renderer. Vitest for unit tests, Playwright for browser tests.

## License

MIT. See [LICENSE](LICENSE).
