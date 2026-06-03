# Qisquiz

**Master Qiskit, one quiz at a time.**

Qisquiz is a certification-prep app for the **IBM Certified Quantum Computation using Qiskit v2.X Developer - Associate** exam (**C1000-179**).

**Live app:** [https://qisquiz.vercel.app](https://qisquiz.vercel.app)

## Disclaimer

Qisquiz is an **independent study tool** and is **not affiliated with IBM or Qiskit**. All questions are original and created for learning purposes only. They are not copied from official exams, exam dumps, paid dumps, or copyrighted practice materials.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org/) App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Syntax highlighting | prism-react-renderer |
| Persistence | Browser LocalStorage |
| Deployment | Vercel |

## Features

- **Study Mode**: choose one or more exam sections, difficulty, question count, and sequential or randomized order.
- **Mock Exam Mode**: `/mock-exam` simulates a 68-question, 90-minute exam session with no instant feedback.
- **Dashboard**: `/dashboard` shows local progress analytics, weak tags, section accuracy, recent mock scores, and suggested next study section.
- **Instant feedback**: Study Mode shows answer feedback, explanations, common mistakes, and related docs links.
- **Review Mode**: retry incorrect questions, retry by section, tag, or difficulty, bookmark questions, and clear local progress.
- **Resources Page**: curated official, API, Runtime, Sampler, Estimator, OpenQASM, community, practice, and slide references.
- **Question validation**: `npm run validate:questions` checks the static question bank.

## Routes

| Path | Description |
| --- | --- |
| `/` | Landing page |
| `/topics` | Section browser and Study Mode configuration |
| `/quiz` | Study session with URL filters |
| `/mock-exam` | Timed mock exam |
| `/dashboard` | Local progress analytics |
| `/resources` | Exam-prep references |

## Study Mode

Study Mode supports:

- selecting one or more exam sections
- difficulty filters: `all`, `easy`, `medium`, `hard`
- question counts: `10`, `20`, `40`, or all matching questions
- sequential or randomized order
- retrying missed questions
- tag-based and difficulty-based review links

Query parameters on `/quiz`:

| Parameter | Values | Default |
| --- | --- | --- |
| `sections` | comma-separated `1`-`8`, or omitted for all | all |
| `difficulty` | `all`, `easy`, `medium`, `hard` | all |
| `count` | `10`, `20`, `40`, `68`, or omitted for all | all |
| `order` | `sequential`, `random` | sequential |
| `tag` | exact question tag | none |
| `retry` | comma-separated question IDs | none |

Examples:

```text
/quiz
/quiz?sections=4&difficulty=medium&count=10
/quiz?sections=5,6&order=random
/quiz?tag=sampler-v2&count=10&order=random
/quiz?retry=s5-001,s6-004
```

## Mock Exam Mode

`/mock-exam` uses:

- 68 questions
- 90 minutes
- randomized question selection
- balanced section coverage across the 8 C1000-179 sections
- no instant feedback
- question navigation
- mark-for-review controls
- auto-submit when time runs out

After submission, the app shows:

- total score
- percentage
- pass/fail estimate
- section-by-section performance
- difficulty-by-difficulty performance
- incorrect and unanswered questions
- marked questions
- explanations and documentation links

## Dashboard And Progress Persistence

Qisquiz currently stores progress in browser LocalStorage. There is no backend, database, or authentication yet.

Persisted data includes:

- answered question IDs
- correct and incorrect history
- missed questions
- bookmarked questions
- last selected section and difficulty
- mock exam attempts
- best and latest mock score

The persistence utilities live in [`src/lib/progress.ts`](src/lib/progress.ts). They are intentionally isolated so a database-backed implementation can replace LocalStorage later.

## Question Bank Structure

Question types are defined in [`src/types/quiz.ts`](src/types/quiz.ts). The static question bank lives in [`src/data/questions.ts`](src/data/questions.ts).

Each question supports:

- `id`
- `section`
- `sectionTitle`
- `difficulty`
- `question`
- `code`
- `choices`
- `correctAnswerIndex`
- `explanation`
- `tags`
- `examSkill`
- `commonMistake`
- `sourceReference`
- `relatedDocsUrl`
- `estimatedTimeSeconds`
- `concept`
- `objective`
- `qiskitVersion`
- `lastReviewedAt`

The current bank is structured to scale toward 300-500 original questions.

## Add Questions

1. Read [`docs/question-writing-guidelines.md`](docs/question-writing-guidelines.md).
2. Add original questions to [`src/data/questions.ts`](src/data/questions.ts).
3. Prefer Qiskit v2.x APIs and official documentation links.
4. Keep each question focused on one clear exam concept.
5. Run validation:

```bash
npm run validate:questions
```

## Run Locally

```bash
git clone https://github.com/dorakingx/qisquiz.git
cd qisquiz
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint
npm run validate:questions
npm run build
npm start
```

**Node.js:** Next.js 15 requires Node **>= 18.18**. Node **>= 20.9** is recommended for the current ESLint toolchain.

## Exam Sections

1. Perform quantum operations
2. Visualize quantum circuits, measurements, and states
3. Create quantum circuits
4. Run quantum circuits
5. Use the Sampler primitive
6. Use the Estimator primitive
7. Retrieve and analyze results of quantum circuits
8. Operate with OpenQASM

Section metadata is defined in [`src/types/quiz.ts`](src/types/quiz.ts) as `EXAM_SECTIONS`.

## Study References

Qisquiz uses public references to identify concepts and APIs. The questions remain original.

- [IBM certification page](https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400)
- [Qiskit documentation](https://docs.quantum.ibm.com/)
- [Qiskit API reference](https://docs.quantum.ibm.com/api/qiskit)
- [Sampler guide](https://docs.quantum.ibm.com/guides/sampler)
- [Estimator guide](https://docs.quantum.ibm.com/guides/estimator)
- [OpenQASM 3 interoperability](https://docs.quantum.ibm.com/guides/interoperate-qiskit-qasm3)
- [Qiskit v2.X Certification Exam Tutorial](https://github.com/kibrahim757/qiskit_2x_certification_exam_tutorial)
- [Qiskit Advocate-created practice exams](https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/advocate_created_practice_exams.md)

## Project Structure

```text
src/
  app/
    dashboard/page.tsx
    mock-exam/page.tsx
    page.tsx
    quiz/page.tsx
    resources/page.tsx
    topics/page.tsx
  components/
    Dashboard.tsx
    MockExam.tsx
    Quiz.tsx
    QuizCard.tsx
    ScoreSummary.tsx
    TopicSelector.tsx
  data/
    questions.ts
    resources.ts
  lib/
    progress.ts
    quiz.ts
  types/
    quiz.ts
docs/
  question-writing-guidelines.md
scripts/
  validate-questions.mjs
```

## License

This project is licensed under the [MIT License](LICENSE).
