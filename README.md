# Qisquiz

**Master Qiskit, one quiz at a time.**

Qisquiz is a focused quiz application for mastering [Qiskit v2.X](https://docs.quantum.ibm.com/) and preparing for the **IBM Certified Quantum Computation using Qiskit Developer** exam (C1000-179).

It presents original multiple-choice questions organized across the eight major exam domains, with instant feedback, study-mode filters, and a review screen for missed questions.

## Disclaimer

Qisquiz is an **independent study tool** and is **not affiliated with IBM or Qiskit**. All quiz questions are original and created for learning purposes only — they are not copied from official exams or copyrighted exam materials.

## Features

- Landing page with quick access to quiz, topics, and resources
- 24+ original questions (3 per exam section), including code snippets
- Study mode: filter by section, difficulty, and sequential/random order
- Review mode: score summary, missed-question review, retry incorrect, restart all
- Resources page with official and community study links

## Run locally

```bash
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

1. Push this repository to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Use the default **Next.js** framework preset (no custom `vercel.json` needed).
4. Deploy — Vercel runs `next build` automatically.

## Add new questions

1. Open [`src/types/quiz.ts`](src/types/quiz.ts) for the `QuizQuestion` type.
2. Append entries to the `QUIZ_QUESTIONS` array in [`src/data/questions.ts`](src/data/questions.ts).

Each question needs: `id`, `section` (1–8), `sectionTitle`, `difficulty`, `question`, `choices`, `correctAnswerIndex`, `explanation`, and `tags`. Optional: `code`, `sourceReference`, `relatedDocsUrl`.

Section titles and descriptions live in `EXAM_SECTIONS` in `src/types/quiz.ts`.

## Update resources

Edit the `STUDY_RESOURCES` array in [`src/data/resources.ts`](src/data/resources.ts). Each entry has `title`, `description`, `url`, and `category` (`Official` | `Community` | `Practice` | `Slides`).

## Study references

Qisquiz was structured using these public materials (questions are original):

- [Qiskit v2.X Certification Exam Tutorial](https://github.com/kibrahim757/qiskit_2x_certification_exam_tutorial)
- [Qiskit Advocate-created practice exams](https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/advocate_created_practice_exams.md)
- [Qiskit Study Group kickoff slides (PDF)](https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/SG_kickoff_slides.pdf)
- [Qiskit documentation](https://docs.quantum.ibm.com/)
- [IBM Qiskit Developer Certification](https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-developer-v2-C1000-179)

## Project structure

```
src/
  app/           # Routes: /, /quiz, /topics, /resources
  components/    # Quiz UI, topic selector, resource cards
  data/          # questions.ts, resources.ts
  lib/           # Quiz filtering and URL helpers
  types/         # Shared TypeScript types
```
