# Qisquiz

**Master Qiskit, one quiz at a time.**

Qisquiz is a focused Q&A quiz app for mastering [Qiskit v2.X](https://docs.quantum.ibm.com/) and preparing for the **IBM Certified Quantum Computation using Qiskit Developer** exam (**C1000-179**).

**Live app:** [https://qisquiz.vercel.app](https://qisquiz.vercel.app)

## Disclaimer

Qisquiz is an **independent study tool** and is **not affiliated with IBM or Qiskit**. All quiz questions are **original** and created for learning purposes only — they are not copied from official exams, exam dumps, or copyrighted materials.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Syntax highlighting | [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) |
| Deployment | [Vercel](https://vercel.com/) |

## Features

- **Landing page** — branding, tagline, quick links, disclaimer
- **24 original questions** — 3 per exam section, with Python/OpenQASM code snippets
- **Study mode** — filter by section, difficulty (`easy` / `medium` / `hard`), sequential or random order
- **Instant feedback** — correct/incorrect state and explanation after each answer
- **Review mode** — score summary, missed-question review, retry incorrect, restart all
- **Resources page** — official docs and community study links

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/quiz` | Quiz session (supports URL filters) |
| `/topics` | Browse exam sections and configure study mode |
| `/resources` | External study references |

### Study mode URL parameters

Configure a session via query string on `/quiz`:

| Parameter | Values | Default |
|-----------|--------|---------|
| `section` | `all` or `1`–`8` | `all` |
| `difficulty` | `all`, `easy`, `medium`, `hard` | `all` |
| `order` | `sequential`, `random` | `sequential` |
| `retry` | Comma-separated question IDs | — |

Examples:

```
/quiz
/quiz?section=4&difficulty=medium
/quiz?section=5&order=random
/quiz?retry=s5-pub-013,s6-pub-016&section=5
```

## Exam sections (C1000-179)

1. Perform quantum operations
2. Visualize quantum circuits, measurements, and states
3. Create quantum circuits
4. Run quantum circuits
5. Use the Sampler primitive
6. Use the Estimator primitive
7. Retrieve and analyze results of quantum circuits
8. Operate with OpenQASM

Section metadata is defined in [`src/types/quiz.ts`](src/types/quiz.ts) as `EXAM_SECTIONS`.

## Run locally

```bash
git clone https://github.com/dorakingx/qisquiz.git
cd qisquiz
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint    # ESLint
npm run build   # Production build
npm start       # Serve production build
```

**Node.js:** Next.js 15 requires Node **≥ 18.18** (recommended **≥ 20.9** on Vercel).

## Deploy to Vercel

### GitHub (recommended)

1. Push this repository to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Use the default **Next.js** framework preset — no `vercel.json` required.
4. Deploy; Vercel runs `next build` on each push to `main`.

### Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link --project qisquiz --yes
vercel --prod --yes
```

## Add new questions

1. Review the `QuizQuestion` type in [`src/types/quiz.ts`](src/types/quiz.ts).
2. Append entries to `QUIZ_QUESTIONS` in [`src/data/questions.ts`](src/data/questions.ts).

Required fields: `id`, `section` (1–8), `sectionTitle`, `difficulty`, `question`, `choices`, `correctAnswerIndex`, `explanation`, `tags`.

Optional: `code`, `sourceReference`, `relatedDocsUrl`.

Example:

```typescript
{
  id: "s4-example-001",
  section: 4,
  sectionTitle: "Run quantum circuits",
  difficulty: "medium",
  question: "When should you use a Runtime Session?",
  choices: ["...", "...", "...", "..."],
  correctAnswerIndex: 0,
  explanation: "...",
  tags: ["session", "runtime"],
  sourceReference: "Qiskit v2.X Tutorial — Section 4",
  relatedDocsUrl: "https://docs.quantum.ibm.com/guides/run-jobs-session",
}
```

Question data lives in a local TypeScript file today; the types and [`src/lib/quiz.ts`](src/lib/quiz.ts) helpers are structured so a database or CMS can replace the static array later.

## Update resources

Edit `STUDY_RESOURCES` in [`src/data/resources.ts`](src/data/resources.ts).

Each entry: `title`, `description`, `url`, `category` (`Official` | `Community` | `Practice` | `Slides`).

## Study references

Qisquiz topics were aligned with these public materials (questions remain original):

- [IBM Qiskit Developer Certification (C1000-179)](https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-developer-v2-C1000-179)
- [Qiskit documentation](https://docs.quantum.ibm.com/)
- [Qiskit v2.X Certification Exam Tutorial](https://github.com/kibrahim757/qiskit_2x_certification_exam_tutorial)
- [Qiskit Advocate-created practice exams](https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/advocate_created_practice_exams.md)
- [Qiskit Study Group kickoff slides (PDF)](https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/SG_kickoff_slides.pdf)

## Project structure

```
src/
  app/
    page.tsx          # Landing (/)
    quiz/page.tsx     # Quiz session
    topics/page.tsx   # Section browser + study config
    resources/page.tsx
    layout.tsx        # Root layout + site header
    globals.css
  components/
    Quiz.tsx          # Quiz state machine
    QuizCard.tsx      # Question display
    AnswerChoice.tsx
    ScoreSummary.tsx  # Results + review
    TopicSelector.tsx
    ResourceCard.tsx
    SiteHeader.tsx
    CodeBlock.tsx
  data/
    questions.ts      # Question bank
    resources.ts      # External links
  lib/
    quiz.ts           # Filter, shuffle, URL helpers
  types/
    quiz.ts           # Shared types + EXAM_SECTIONS
```

## License

Private project. See repository owner for usage terms.
