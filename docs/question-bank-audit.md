# Question-bank audit

Every question in the bank was examined individually against the criteria
below before this release. The per-question table is generated from the source
of truth, so it can never drift from what ships.

## Method

Each item was read in full — stem, code block, all four choices, the key, the
explanation, the common-mistake note, the tags, and the referenced
documentation — and checked for:

- **Answer leakage.** Does anything visible before the learner answers reveal or
  narrow the answer? This covers the exact answer text appearing in the stem or
  code, an API identifier that distinguishes the key showing up in the snippet
  or an import line, the same identifier hiding in the tags, concept, or
  objective, and completion snippets that already contain the completed answer.
- **Distractor quality.** Is every wrong option a realistic misconception or a
  nearby API, in the same grammatical form, of comparable length and
  specificity, and clearly wrong under the stated assumptions?
- **Technical accuracy.** Does the claim hold against current official Qiskit
  and IBM Quantum documentation, and does executable code actually behave as
  described?
- **Duplicate and overlap.** Is the item distinct from every other item, rather
  than a superficial variant differing only in a name, a constant, or an index?
- **Source verification.** Does it cite an exact, non-redirecting official
  documentation page, with a review date?

## What was wrong before

The 120 questions that existed before this release shared a set of systematic
defects. All of them were fixed rather than waived.

### Answer leakage

The largest category. Thirty items displayed the very identifier the learner
was asked to name.

| Pattern | Examples | Fix |
| --- | --- | --- |
| `EXACT_ANSWER_IN_CODE` — the key was printed verbatim in the snippet | asking which method draws a circuit while showing `qc.draw()`; which argument selects Matplotlib output while showing `qc.draw(output="mpl")`; which method measures every qubit while showing `qc.measure_all()`; which method binds parameters while showing `qc.assign_parameters(...)`; which call retrieves a job while showing `service.job(job_id)`; which method reports status while showing `job.status()`; how to read Sampler counts while showing `result[0].data.meas.get_counts()`; how to read Estimator values while showing `result[0].data.evs`; every OpenQASM syntax item, each of which displayed the exact statement, declaration, include, or loader it asked about | Rewritten as behaviour, output, debugging, or completion questions, or the snippet removed entirely |
| `ANSWER_IDENTIFIER_IN_IMPORT` — an import line named the key | `from qiskit.circuit import Parameter` while asking which object holds a symbolic angle; `from qiskit.quantum_info import SparsePauliOp` while asking which class represents a Pauli observable; `from qiskit_ibm_runtime import QiskitRuntimeService` while asking for the service entry point; `from qiskit.visualization import plot_bloch_vector` while asking which function plots a Bloch vector | Imports removed or the question reframed around behaviour |
| `TAG_LEAK` — tags were rendered before the learner answered, and several named the answer | tags such as `circuit.draw`, `assign_parameters`, `generate_preset_pass_manager`, `if_test`, `plot_bloch_vector`, `loads`, `dumps` | Tags are now hidden until after answering, and identifier-shaped tags were replaced with concept tags |
| Semantic leak | asking which workflow visualises a state without measuring, while showing `Statevector.from_instruction(qc)` | Reframed so the snippet illustrates rather than answers |

### Other defects

- **`INCORRECT_API`** — one item imported `generate_preset_pass_manager` from
  the top-level `qiskit` package rather than `qiskit.transpiler`.
- **`IMPLAUSIBLE_DISTRACTOR`** — options referring to favicons, home-page
  rendering, drawing "in cyan", decorative colours, arbitrary JSON filenames,
  and alphabetical backend ordering. All replaced with realistic
  misconceptions.
- **`OUT_OF_SCOPE_FOR_EXAM`** — one item asked how to find weak sections in a
  quiz session, which is about this application rather than the certification.
- **`NEAR_DUPLICATE`** — overlapping pairs across sections, including two items
  on extracting Sampler counts, two on extracting Estimator values, two on
  mapping results to inputs by index, two on choosing a session for iterative
  work, two on untranspiled circuits failing on hardware, and two on checking
  backend support for dynamic circuits. Each pair was rewritten so only one
  covers the objective and the other addresses a distinct one.
- **`ANSWER_LENGTH_CUE`** — a systematic tendency for the key to be longer and
  more specific than its distractors. Every flagged item was rebalanced.
- **`GENERIC_OR_INCORRECT_REFERENCE`** — all 120 items pointed at one
  section-wide page on the retired `docs.quantum.ibm.com` domain, and several
  of those paths no longer exist. Every question now cites specific pages on
  the canonical `quantum.cloud.ibm.com/docs/en/` host, checked against a
  snapshot of the official sitemap.
- **`MISSING_REVIEW_DATE`** — no item recorded when it was last checked. All
  now do.

### Outcome

- **Rewritten:** 120 (every pre-existing question)
- **Removed:** 0 — every published id is preserved so stored progress stays
  valid; near-duplicates were rewritten to cover distinct objectives instead of
  being deleted
- **Added:** 201

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

## Per-question audit

Status columns reflect the state after this release: every item passes the
automated gates in `npm run validate:questions`, which enforce each criterion
above. Regenerate with `npm run docs:generate`.

<!-- BEGIN:AUDIT_TABLE -->

Generated from the question bank on 2026-08-18.

| ID | Section | Difficulty | Type | Answer leak | Distractors | Technical accuracy | Duplicate/overlap | Source verification | Action taken | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s1-001 | 1 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-002 | 1 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-003 | 1 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-004 | 1 | easy | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-005 | 1 | easy | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-006 | 1 | medium | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-007 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-008 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-009 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-010 | 1 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-011 | 1 | hard | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-012 | 1 | hard | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-013 | 1 | hard | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-014 | 1 | hard | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-015 | 1 | hard | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s1-016 | 1 | easy | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-017 | 1 | easy | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-018 | 1 | easy | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-019 | 1 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-020 | 1 | easy | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-021 | 1 | easy | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-022 | 1 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-023 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-024 | 1 | easy | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-025 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-026 | 1 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-027 | 1 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-028 | 1 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-029 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-030 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-031 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-032 | 1 | medium | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-033 | 1 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-034 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-035 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-036 | 1 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-037 | 1 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-038 | 1 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-039 | 1 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-040 | 1 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-041 | 1 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-042 | 1 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-043 | 1 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-044 | 1 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-045 | 1 | hard | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-046 | 1 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-047 | 1 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-048 | 1 | medium | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-049 | 1 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-050 | 1 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s1-051 | 1 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-001 | 2 | easy | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-002 | 2 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-003 | 2 | easy | code-completion | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-004 | 2 | easy | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-005 | 2 | easy | code-completion | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-006 | 2 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-007 | 2 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-008 | 2 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-009 | 2 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-010 | 2 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-011 | 2 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-012 | 2 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-013 | 2 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-014 | 2 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-015 | 2 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s2-016 | 2 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-017 | 2 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-018 | 2 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-019 | 2 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-020 | 2 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-021 | 2 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-022 | 2 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-023 | 2 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-024 | 2 | medium | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-025 | 2 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-026 | 2 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-027 | 2 | hard | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-028 | 2 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-029 | 2 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-030 | 2 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-031 | 2 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-032 | 2 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-033 | 2 | hard | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-034 | 2 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s2-035 | 2 | hard | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-001 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-002 | 3 | medium | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-003 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-004 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-005 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-006 | 3 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-007 | 3 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-008 | 3 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-009 | 3 | medium | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-010 | 3 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-011 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-012 | 3 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-013 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-014 | 3 | medium | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-015 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s3-016 | 3 | medium | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-017 | 3 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-018 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-019 | 3 | easy | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-020 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-021 | 3 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-022 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-023 | 3 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-024 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-025 | 3 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-026 | 3 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-027 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-028 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-029 | 3 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-030 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-031 | 3 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-032 | 3 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-033 | 3 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-034 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-035 | 3 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-036 | 3 | medium | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-037 | 3 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-038 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-039 | 3 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-040 | 3 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-041 | 3 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-042 | 3 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-043 | 3 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-044 | 3 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-045 | 3 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-046 | 3 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-047 | 3 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-048 | 3 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-049 | 3 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-050 | 3 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-051 | 3 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-052 | 3 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-053 | 3 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-054 | 3 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-055 | 3 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-056 | 3 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-057 | 3 | hard | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s3-058 | 3 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-001 | 4 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-002 | 4 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-003 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-004 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-005 | 4 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-006 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-007 | 4 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-008 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-009 | 4 | medium | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-010 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-011 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-012 | 4 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-013 | 4 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-014 | 4 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-015 | 4 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s4-016 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-017 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-018 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-019 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-020 | 4 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-021 | 4 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-022 | 4 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-023 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-024 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-025 | 4 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-026 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-027 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-028 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-029 | 4 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-030 | 4 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-031 | 4 | easy | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-032 | 4 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-033 | 4 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-034 | 4 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-035 | 4 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-036 | 4 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-037 | 4 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-038 | 4 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-039 | 4 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-040 | 4 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-041 | 4 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-042 | 4 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-043 | 4 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-044 | 4 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-045 | 4 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-046 | 4 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-047 | 4 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s4-048 | 4 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-001 | 5 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-002 | 5 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-003 | 5 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-004 | 5 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-005 | 5 | medium | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-006 | 5 | easy | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-007 | 5 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-008 | 5 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-009 | 5 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-010 | 5 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-011 | 5 | medium | broadcasting-shape | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-012 | 5 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-013 | 5 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-014 | 5 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-015 | 5 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s5-016 | 5 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-017 | 5 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-018 | 5 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-019 | 5 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-020 | 5 | medium | broadcasting-shape | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-021 | 5 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-022 | 5 | medium | code-output | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-023 | 5 | medium | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-024 | 5 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-025 | 5 | medium | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-026 | 5 | easy | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-027 | 5 | hard | broadcasting-shape | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-028 | 5 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-029 | 5 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-030 | 5 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-031 | 5 | hard | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-032 | 5 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-033 | 5 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-034 | 5 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-035 | 5 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-036 | 5 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-037 | 5 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-038 | 5 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s5-039 | 5 | hard | broadcasting-shape | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-001 | 6 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-002 | 6 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-003 | 6 | easy | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-004 | 6 | easy | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-005 | 6 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-006 | 6 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-007 | 6 | easy | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-008 | 6 | medium | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-009 | 6 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-010 | 6 | medium | code-output | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-011 | 6 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-012 | 6 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-013 | 6 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-014 | 6 | medium | broadcasting-shape | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-015 | 6 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s6-016 | 6 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-017 | 6 | medium | code-completion | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-018 | 6 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-019 | 6 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-020 | 6 | medium | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-021 | 6 | medium | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-022 | 6 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-023 | 6 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-024 | 6 | medium | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-025 | 6 | medium | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-026 | 6 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-027 | 6 | hard | broadcasting-shape | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-028 | 6 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-029 | 6 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-030 | 6 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-031 | 6 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-032 | 6 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-033 | 6 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-034 | 6 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-035 | 6 | hard | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-036 | 6 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-037 | 6 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s6-038 | 6 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-001 | 7 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-002 | 7 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-003 | 7 | easy | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-004 | 7 | easy | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-005 | 7 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-006 | 7 | easy | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-007 | 7 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-008 | 7 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-009 | 7 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-010 | 7 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-011 | 7 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-012 | 7 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-013 | 7 | medium | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-014 | 7 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-015 | 7 | medium | result-interpretation | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s7-016 | 7 | medium | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-017 | 7 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-018 | 7 | medium | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-019 | 7 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-020 | 7 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-021 | 7 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-022 | 7 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-023 | 7 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-024 | 7 | hard | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-025 | 7 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-026 | 7 | hard | workflow-selection | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-027 | 7 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-028 | 7 | hard | result-interpretation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-029 | 7 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-030 | 7 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-031 | 7 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s7-032 | 7 | hard | concept | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s8-001 | 8 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-002 | 8 | easy | debugging | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-003 | 8 | easy | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-004 | 8 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-005 | 8 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-006 | 8 | easy | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-007 | 8 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-008 | 8 | medium | code-completion | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-009 | 8 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-010 | 8 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-011 | 8 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-012 | 8 | medium | concept | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-013 | 8 | medium | workflow-selection | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-014 | 8 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-015 | 8 | medium | code-behavior | clear | plausible | verified | unique | verified | Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date | pass |
| s8-016 | 8 | hard | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s8-017 | 8 | medium | debugging | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s8-018 | 8 | hard | multi-step-reasoning | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s8-019 | 8 | medium | documentation-navigation | clear | plausible | verified | unique | verified | New original item authored for this release | pass |
| s8-020 | 8 | hard | code-behavior | clear | plausible | verified | unique | verified | New original item authored for this release | pass |

<!-- END:AUDIT_TABLE -->
