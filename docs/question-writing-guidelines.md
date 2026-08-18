# Question writing guidelines

Every rule here is enforced by `npm run validate:questions`, which fails the
build. Where a rule cannot be checked mechanically, it is called out as a
judgement call.

## The one rule everything else serves

**A learner must be able to see the entire pre-answer screen without being
shown the answer or an unfair clue.** If anything visible before they choose
narrows the option set, the question is broken, however elegant it looks.

## Answer leakage

### Naming questions

If a question asks for the *name* of a function, method, class, property,
argument, module, or return field, that identifier must not appear anywhere the
learner can see: not in the code block, not in an import line, not in a variable
name, not in a tag, heading, concept, or objective.

When you find yourself wanting to show the code anyway, pick a different shape:

- Drop the code block entirely.
- Replace the target token with a clearly marked `_____` blank and set
  `codeStatus: "partial-completion"`.
- Turn it into a question about behaviour, output, result shape, or failure
  mode, where showing the complete call is exactly right.
- Ask the learner to diagnose an error or choose the correction.

### Behaviour questions

A complete API call *may* be shown when the question is about what it does,
what it prints, what shape it returns, when it fails, or when to reach for it.
The distinction is whether the visible code answers the question or poses it.

### The mechanical check

The validator extracts every identifier-shaped token that appears in the correct
choice and in none of the distractors. If such a token appears in the code, the
tags, the concept, or the objective, the question fails. This catches the
subtle cases: an import that names the answer, a tag such as
`assign_parameters`, a completion snippet that already contains the completion.

## Metadata visibility

Before an answer is submitted, the interface never shows tags, concept,
objective, references, common mistakes, correctness styling, or explanations.
Study mode reveals them once the learner answers; the mock exam withholds them,
along with section and difficulty, until the whole exam is submitted.

If you add a field to `QuizQuestion`, decide explicitly which side of that line
it sits on before rendering it.

## Distractors

Every distractor must represent a realistic misconception or a nearby API, take
the same grammatical form as the key, be comparable in length and specificity,
be plausible enough to require knowledge, and be clearly wrong under the stated
assumptions.

Avoid:

- Joke answers, random product names, or anything referring to this application
  rather than to Qiskit. The validator rejects a list of known offenders
  (favicons, home-page rendering, UI colours, arbitrary JSON filenames).
- "All of the above" and "none of the above".
- Two defensible answers, or options that overlap.
- A key that is conspicuously longer or more precise than its distractors. If
  the key needs a justifying clause, move it to the explanation.
- Absolutes such as "always" or "never" unless they are technically necessary.

## Explanations

An explanation must say why the key is correct *and* engage with the wrong
options: at least one for a medium question, at least two for a hard one. It
must describe any version-sensitive assumption, and it must not simply restate
the answer.

**Never refer to a choice by its letter.** Display order is shuffled per
session, so "answer (b)" means different things to different learners. Name the
option's content instead. The validator rejects letter references.

Minimum lengths are 90, 150, and 200 characters for easy, medium, and hard.
These are floors, not targets.

## References and review dates

Every question cites at least one exact official documentation URL and records
`lastReviewedAt`.

- Use the canonical `https://quantum.cloud.ibm.com/docs/en/...` form. The
  shorter `/docs/...` path is a redirect and is rejected.
- Link the specific page that supports the claim, not a section index.
- URLs are checked against `scripts/data/known-doc-urls.txt`, a snapshot of the
  official docs sitemap, so the check runs offline in CI. Refresh that file when
  the documentation is restructured.
- Non-IBM references need an explicit entry in the validator's allow list. Today
  that is the OpenQASM language specification and the IBM certification page.

## Identity and structure

- **Ids are permanent.** `s<section>-<nnn>`, authored explicitly, never derived
  from array position. Published ids are protected by a test: removing one
  fails the build, because stored learner progress refers to it.
- **Choice ids are permanent too.** Authoring keys are `a` through `d`, and
  correctness is carried by `answer`, never by array position. Reordering the
  keys in the source cannot change which answer is correct, and the interface
  shuffles display order independently.
- If a question turns out to be wrong or duplicated, rewrite it in place rather
  than deleting the id.

## Diversity

Enforced across the whole bank:

| Rule | Threshold |
| --- | --- |
| Total questions | at least 320 |
| Per section | at least the blueprint target derived from the official weights |
| Meaningfully code-based | at least 45% |
| Direct recall (`concept`) | at most 20% |
| Any single question type | at most 30% |
| Difficulty | 25/45/30 easy/medium/hard, tolerance 8 points |
| Per section | at least 4 question types, all 3 difficulties, none above 60% |

A question is *meaningfully code-based* when it carries a snippet the learner
must read to answer. Attaching a listing to a definition question does not
count, so `concept` and `documentation-navigation` items are excluded.

## Duplicates

A question is not new when only a variable name, a numeric constant, a qubit
index, a backend placeholder, or the order of two phrases changes. The validator
compares stem, code, and key using trigram similarity: above 0.78 fails, above
0.68 warns.

Note that stem and code are compared together, so several questions may share a
short generic stem such as "What does this program print?" provided the snippets
genuinely differ. Prefer varied stems anyway.

## Waivers

`qualityWaivers` suppresses one named rule for one question. Every waiver needs
a concrete reason of at least twenty characters, and the validator prints all
waivers on every run so none can hide.

Waivers are for cases where a rule is genuinely wrong about a specific item, not
for avoiding a rewrite. The bank currently ships **zero** waivers; adding one
should feel like a decision worth defending in review.

## Adding a question

1. Pick the section, and check `docs/exam-objective-coverage.md` for a gap.
2. Add a seed to the matching `src/data/questions/section-N.ts` with the next
   free id.
3. Write the key first, then distractors that a learner with a specific
   misconception would actually pick.
4. Write the explanation last, refuting the strongest distractors by name.
5. Cite the exact documentation page you used, and set `lastReviewedAt` to
   today.
6. Set `codeStatus` honestly: `executable` means it runs offline and is
   verified, so do not use it for anything needing credentials.
7. Run `npm run validate:questions`, then `npm run check`.
8. If the snippet is executable, run the Qiskit verifier
   (`docs/qiskit-code-verification.md`).

## After a Qiskit release

1. Refresh the documentation snapshot:
   `curl -s https://quantum.cloud.ibm.com/docs/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | grep -E '/docs/en/(guides|api)/' | sort -u > scripts/data/known-doc-urls.txt`
2. Run `npm run validate:questions` and fix any reference that has moved.
3. Re-run the Qiskit verifier against the new release and investigate every
   failure before changing a question: a changed output may be a genuine
   behavioural change worth teaching.
4. Update `qiskitVersion` and `lastReviewedAt` on anything you re-checked.
5. Re-read the official blueprint. If the weights or the pass mark moved, change
   `src/config/exam.ts` only — every target is derived from it.
