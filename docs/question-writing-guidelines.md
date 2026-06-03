# Question Writing Guidelines

Qisquiz is an independent certification-prep tool. The question bank must help learners practice the concepts behind the IBM Certified Quantum Computation using Qiskit v2.X Developer - Associate exam without copying protected or unethical material.

## Originality Rules

- All questions must be original.
- Do not copy official exam questions.
- Do not use paid or leaked exam dumps.
- Do not directly duplicate third-party practice questions.
- Public references may be used to identify concepts, APIs, and study objectives, but the final wording, code, choices, and explanations must be newly written.

## Question Design

- Each question should test one clear concept.
- Prefer practical Qiskit v2.x APIs and workflows.
- Use code snippets for realistic Qiskit, Runtime, Sampler, Estimator, transpilation, visualization, or OpenQASM questions.
- Keep code snippets short enough to read during a timed practice session.
- Use the `tags`, `examSkill`, `concept`, and `objective` fields to make analytics useful.
- Include official documentation links whenever possible.

## Answer Choices

- Every question must have exactly four choices.
- One choice must be clearly correct.
- Each wrong answer should represent a realistic misconception, not random nonsense.
- Avoid trick wording. Difficulty should come from the concept or reasoning, not ambiguity.
- For medium and hard questions, include at least one tempting wrong answer and address it in the explanation.

## Explanations

- Explanations should teach the concept, not just state the correct answer.
- Explain why the correct answer is correct.
- For medium and hard questions, explain why at least one tempting wrong answer is wrong.
- Mention common mistakes when they help learners avoid repeated errors.
- Keep explanations concise but complete.

## Required Fields

Each question must include:

- `id`
- `section`
- `sectionTitle`
- `difficulty`
- `question`
- `choices`
- `correctAnswerIndex`
- `explanation`
- `tags`
- `examSkill`

Use optional fields when useful:

- `code`
- `commonMistake`
- `sourceReference`
- `relatedDocsUrl`
- `estimatedTimeSeconds`
- `concept`
- `objective`
- `qiskitVersion`
- `lastReviewedAt`

## Validation

Run this before committing question-bank changes:

```bash
npm run validate:questions
```

The validation checks IDs, sections, answer counts, correct answer indices, explanations, tags, and documentation URLs.
