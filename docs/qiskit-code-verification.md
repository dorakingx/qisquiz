# Qiskit code verification

Every code snippet in the question bank is checked against a real Qiskit
installation before release. This document records how, and what the last run
found.

## Environment

| Component | Version |
| --- | --- |
| Qiskit | 2.5.2 |
| qiskit-ibm-runtime | 0.49.0 |
| Python | 3.14.4 |
| Matplotlib backend | `Agg` (headless) |
| Date of run | 2026-08-18 |

No IBM Quantum credentials are configured during verification and no hardware
job is ever submitted. Snippets that would need an account or a device are
identified by their `codeStatus` and are checked statically instead.

## Reproducing the run

```bash
python -m venv .venv-qiskit
./.venv-qiskit/bin/pip install "qiskit[visualization]==2.*" qiskit-ibm-runtime
npm run export:snippets -- snippets.json
./.venv-qiskit/bin/python scripts/verify-qiskit-code.py snippets.json
```

The verifier exits non-zero if any executable snippet raises, or if any snippet
that should parse does not. CI runs the same three commands.

## What each `codeStatus` means for verification

| Status | Verification performed |
| --- | --- |
| `executable` | Executed in a fresh namespace with stdout captured. Any exception fails the run. |
| `illustrative` | Parsed to confirm it is syntactically valid Python. Not executed, because it needs credentials, a live backend, or names supplied by surrounding context. |
| `intentional-error` | Not executed: the defect is the subject of the question. Recorded as expected. |
| `partial-completion` | Not parsed: the snippet contains a deliberate `_____` blank. |
| OpenQASM programs | Complete programs are round-tripped through Qiskit's OpenQASM 3 importer. Bare fragments without a version header, and deliberately broken programs, are recorded rather than parsed. |

## Result of the last run

**165 snippets checked, 0 failures.**

| Outcome | Snippets |
| --- | --- |
| blank | 9 |
| fragment | 1 |
| intentional-error | 2 |
| ok | 64 |
| parsed | 3 |
| partial-completion | 1 |
| syntax ok | 85 |

## Predicted outputs

Beyond running without error, every `code-output` question that prints
something was compared against the value the key claims. All matched. Where
the printed representation differs from a mathematically equivalent form — for
example NumPy scalar reprs, or complex amplitudes printed as `0.+0.j` — the
question was reworded to ask for the value rather than the exact printed text,
so the key can never be contradicted by a formatting change.

Claims made by code questions that print nothing were checked separately by
computing the quantity directly. Three of those checks initially appeared to
fail and were traced to the checking script rather than the questions:

- Two "which outcomes are possible" claims were compared against
  `probabilities_dict()`, which lists basis states carrying floating-point
  noise around 1e-17. Re-checked with a probability threshold, both claims hold.
- A Pauli-product claim was compared using `Pauli.compose`, which applies its
  argument *after* the receiver, so it computes `Y·X` rather than the matrix
  product `X·Y` the question asks about. Verified directly against the matrix
  product, the claim holds.

## Version sensitivity

Questions whose answer depends on a version-specific behaviour say so in the
stem or the explanation. `qiskitVersion` is recorded on every question, and
`lastReviewedAt` records when the claim was last checked against the
documentation. The validator warns when a review date grows stale.

## Per-snippet results

| Question | Code status | Language | Result |
| --- | --- | --- | --- |
| `s1-002` | executable | python | ok |
| `s1-003` | executable | python | ok |
| `s1-004` | executable | python | ok |
| `s1-005` | executable | python | ok |
| `s1-006` | executable | python | ok |
| `s1-007` | executable | python | ok |
| `s1-008` | executable | python | ok |
| `s1-009` | executable | python | ok |
| `s1-010` | illustrative | python | syntax ok |
| `s1-012` | executable | python | ok |
| `s1-013` | illustrative | python | syntax ok |
| `s1-016` | executable | python | ok |
| `s1-017` | executable | python | ok |
| `s1-018` | executable | python | ok |
| `s1-019` | executable | python | ok |
| `s1-021` | executable | python | ok |
| `s1-022` | executable | python | ok |
| `s1-023` | executable | python | ok |
| `s1-024` | partial-completion | python | blank (not parsed) |
| `s1-025` | illustrative | python | syntax ok |
| `s1-026` | executable | python | ok |
| `s1-027` | executable | python | ok |
| `s1-028` | intentional-error | python | syntax ok |
| `s1-029` | executable | python | ok |
| `s1-030` | executable | python | ok |
| `s1-031` | executable | python | ok |
| `s1-033` | executable | python | ok |
| `s1-034` | executable | python | ok |
| `s1-035` | executable | python | ok |
| `s1-037` | executable | python | ok |
| `s1-039` | executable | python | ok |
| `s1-040` | executable | python | ok |
| `s1-041` | executable | python | ok |
| `s1-042` | executable | python | ok |
| `s1-044` | executable | python | ok |
| `s1-045` | partial-completion | python | blank (not parsed) |
| `s1-046` | intentional-error | python | syntax ok |
| `s1-048` | partial-completion | python | blank (not parsed) |
| `s1-049` | executable | python | ok |
| `s1-051` | executable | python | ok |
| `s2-001` | executable | python | ok |
| `s2-003` | partial-completion | python | blank (not parsed) |
| `s2-005` | partial-completion | python | blank (not parsed) |
| `s2-006` | executable | python | ok |
| `s2-009` | illustrative | python | syntax ok |
| `s2-013` | executable | python | ok |
| `s2-014` | illustrative | python | syntax ok |
| `s2-018` | illustrative | python | syntax ok |
| `s2-019` | executable | python | ok |
| `s2-020` | executable | python | ok |
| `s2-022` | intentional-error | python | syntax ok |
| `s2-023` | executable | python | ok |
| `s2-025` | executable | python | ok |
| `s2-029` | illustrative | python | syntax ok |
| `s3-001` | executable | python | ok |
| `s3-002` | executable | python | ok |
| `s3-003` | executable | python | ok |
| `s3-004` | executable | python | ok |
| `s3-005` | executable | python | ok |
| `s3-009` | executable | python | ok |
| `s3-011` | executable | python | ok |
| `s3-012` | executable | python | ok |
| `s3-013` | executable | python | ok |
| `s3-014` | executable | python | ok |
| `s3-015` | executable | python | ok |
| `s3-016` | partial-completion | python | blank (not parsed) |
| `s3-017` | executable | python | ok |
| `s3-018` | illustrative | python | syntax ok |
| `s3-020` | illustrative | python | syntax ok |
| `s3-022` | illustrative | python | syntax ok |
| `s3-024` | illustrative | python | syntax ok |
| `s3-025` | executable | python | ok |
| `s3-026` | intentional-error | python | syntax ok |
| `s3-027` | illustrative | python | syntax ok |
| `s3-028` | illustrative | python | syntax ok |
| `s3-030` | executable | python | ok |
| `s3-032` | executable | python | ok |
| `s3-033` | executable | python | ok |
| `s3-034` | illustrative | python | syntax ok |
| `s3-036` | partial-completion | python | blank (not parsed) |
| `s3-037` | illustrative | python | syntax ok |
| `s3-038` | executable | python | ok |
| `s3-040` | illustrative | python | syntax ok |
| `s3-041` | executable | python | ok |
| `s3-043` | illustrative | python | syntax ok |
| `s3-044` | intentional-error | python | syntax ok |
| `s3-047` | illustrative | python | syntax ok |
| `s3-049` | illustrative | python | syntax ok |
| `s3-050` | illustrative | python | syntax ok |
| `s3-052` | intentional-error | python | syntax ok |
| `s3-053` | illustrative | python | syntax ok |
| `s3-055` | illustrative | python | syntax ok |
| `s3-057` | executable | python | ok |
| `s4-002` | illustrative | python | syntax ok |
| `s4-003` | illustrative | python | syntax ok |
| `s4-004` | illustrative | python | syntax ok |
| `s4-006` | illustrative | python | syntax ok |
| `s4-008` | illustrative | python | syntax ok |
| `s4-009` | intentional-error | python | syntax ok |
| `s4-010` | illustrative | python | syntax ok |
| `s4-011` | illustrative | python | syntax ok |
| `s4-012` | illustrative | python | syntax ok |
| `s4-016` | illustrative | python | syntax ok |
| `s4-017` | illustrative | python | syntax ok |
| `s4-018` | illustrative | python | syntax ok |
| `s4-019` | illustrative | python | syntax ok |
| `s4-023` | illustrative | python | syntax ok |
| `s4-024` | illustrative | python | syntax ok |
| `s4-026` | illustrative | python | syntax ok |
| `s4-027` | illustrative | python | syntax ok |
| `s4-028` | illustrative | python | syntax ok |
| `s4-031` | executable | python | ok |
| `s4-032` | illustrative | python | syntax ok |
| `s4-043` | illustrative | python | syntax ok |
| `s4-046` | illustrative | python | syntax ok |
| `s4-048` | intentional-error | python | syntax ok |
| `s5-001` | illustrative | python | syntax ok |
| `s5-003` | illustrative | python | syntax ok |
| `s5-004` | illustrative | python | syntax ok |
| `s5-005` | intentional-error | python | syntax ok |
| `s5-006` | illustrative | python | syntax ok |
| `s5-008` | illustrative | python | syntax ok |
| `s5-009` | illustrative | python | syntax ok |
| `s5-010` | illustrative | python | syntax ok |
| `s5-012` | illustrative | python | syntax ok |
| `s5-013` | illustrative | python | syntax ok |
| `s5-018` | illustrative | python | syntax ok |
| `s5-022` | executable | python | ok |
| `s5-025` | partial-completion | python | blank (not parsed) |
| `s5-039` | illustrative | python | syntax ok |
| `s6-001` | illustrative | python | syntax ok |
| `s6-002` | executable | python | ok |
| `s6-003` | intentional-error | python | syntax ok |
| `s6-004` | executable | python | ok |
| `s6-005` | illustrative | python | syntax ok |
| `s6-007` | illustrative | python | syntax ok |
| `s6-008` | illustrative | python | syntax ok |
| `s6-009` | illustrative | python | syntax ok |
| `s6-010` | executable | python | ok |
| `s6-011` | illustrative | python | syntax ok |
| `s6-013` | illustrative | python | syntax ok |
| `s6-016` | illustrative | python | syntax ok |
| `s6-017` | partial-completion | python | blank (not parsed) |
| `s6-023` | illustrative | python | syntax ok |
| `s6-025` | illustrative | python | syntax ok |
| `s6-030` | executable | python | ok |
| `s6-038` | illustrative | python | syntax ok |
| `s7-001` | illustrative | python | syntax ok |
| `s7-002` | illustrative | python | syntax ok |
| `s7-004` | illustrative | python | syntax ok |
| `s7-006` | illustrative | python | syntax ok |
| `s7-009` | illustrative | python | syntax ok |
| `s7-015` | illustrative | python | syntax ok |
| `s7-018` | illustrative | python | syntax ok |
| `s8-002` | intentional-error | openqasm | intentional-error (not parsed) |
| `s8-004` | illustrative | python | syntax ok |
| `s8-005` | illustrative | openqasm | parsed |
| `s8-006` | illustrative | openqasm | parsed |
| `s8-008` | partial-completion | openqasm | partial-completion (not parsed) |
| `s8-009` | illustrative | openqasm | fragment (not parsed) |
| `s8-013` | illustrative | python | syntax ok |
| `s8-015` | illustrative | python | syntax ok |
| `s8-016` | intentional-error | openqasm | intentional-error (not parsed) |
| `s8-017` | illustrative | python | syntax ok |
| `s8-020` | illustrative | openqasm | parsed |
