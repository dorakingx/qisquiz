# Exam objective coverage

How the question bank maps onto the published blueprint for IBM exam
C1000-179, *Fundamentals of Quantum Computing Using Qiskit v2.X Developer*.

## Blueprint

The official certification page publishes the exam length, the pass mark, the
time limit, and a percentage weight for each of the eight sections. It does not
publish sub-objective detail: that lives in a study guide behind an IBM login.
Coverage below is therefore organised by the official section titles and
weights, with concept-level tags standing in for sub-objectives. Those tags were
derived from the official Qiskit and IBM Quantum documentation rather than from
any third-party material.

Section weights drive both the mock-exam composition and the per-section
authoring targets, using the largest-remainder method so the parts always sum
exactly to the whole. Nothing in the application hard-codes a derived number.

## Verification of areas at risk of being underrepresented

Each area called out as easy to miss was checked by reading the questions
rather than by trusting tags:

| Area | Covered by |
| --- | --- |
| Qubit ordering and phase reasoning | `little-endian`, `qubit-ordering`, `global-phase`, `relative-phase` across sections 1, 2, 5, 7 and 8 |
| Visualization behaviour and limitations | `state-visualization`, `bloch-sphere`, `histogram`, plus explicit items on what a single-basis histogram cannot show and where state plots stop scaling |
| Parameterized circuits | `parameterized-circuits` in sections 3 and 5, including binding semantics, parameter vectors, and compile-once/bind-many workflows |
| Transpilation and ISA circuits | `transpilation`, `isa-circuits`, `transpiler-stages`, `optimization-level`, `routing`, `layout` |
| BackendV2 and Target | `backend-v2`, `target` in sections 3 and 4 |
| Dynamic circuits and control flow | `dynamic-circuits`, `classical-control` in sections 3, 4 and 8 |
| Runtime execution modes | `execution-modes`, `session-mode`, `batch-mode` |
| Session versus Batch use cases | Dedicated items on workload dependency structure and on the throughput cost of choosing wrongly |
| Hardware execution and job lifecycle | `hardware-execution`, `runtime-jobs`, `job-lifecycle`, `job-monitoring`, `job-retrieval`, `job-limits`, `max-execution-time` |
| Primitive broadcasting | `array-broadcasting` and the `broadcasting-shape` question type in sections 5 and 6 |
| SamplerV2 PUBs and result structures | `pubs`, `bit-arrays`, `result-object` in section 5 |
| Sampler options | `options`, `shots`, `twirling`, `dynamical-decoupling` |
| Dynamical decoupling | `dynamical-decoupling` in sections 3 and 5, including why it requires a scheduled circuit |
| EstimatorV2 PUBs and result structures | `pubs`, `expectation-values`, `standard-errors` in section 6 |
| Observables and layout application | `observables` plus items on applying a compiled circuit's layout to an observable |
| Precision, uncertainty, resilience, mitigation | `precision`, `resilience`, `error-mitigation`, `error-suppression`, `zne`, `pec`, `noise-learning` |
| Retrieving and monitoring jobs | Section 7, `job-retrieval`, `job-monitoring`, `metadata` |
| Statistically responsible comparison | `analysis`, `hardware-results`, `reproducibility` — items that require sizing a deviation against its standard error before drawing a conclusion |
| OpenQASM 3 types, syntax, control flow, interop | Section 8, `openqasm-3`, `data-types`, `gate-declarations`, `classical-control`, `import`, `export`, `interoperability` |
| Qiskit and OpenQASM interoperability limits | Items on partial importer support and on semantic-versus-structural round trips |

**REST API note.** The current published blueprint lists eight sections with no
REST API section, so no questions target the Runtime REST API. If IBM adds one,
the section list in `src/config/exam.ts` and the targets derived from it are the
only places that need to change.

<!-- BEGIN:COVERAGE -->

Generated from the question bank on 2026-08-18.

Blueprint source: https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400 (read 2026-08-18).
Exam C1000-179: 68 questions, 47 to pass, 90 minutes.

## Per-section coverage

### Section 1: Perform quantum operations

- **Official weight:** 16%
- **Questions:** 51 (blueprint target 51) — 16% of the bank
- **Difficulty:** easy 12, medium 22, hard 17
- **Question types:** code-behavior 19, code-output 16, concept 5, multi-step-reasoning 4, code-completion 3, debugging 2, workflow-selection 1, documentation-navigation 1
- **Code-based questions:** 40 (78%)
- **Tags covered:** `bell-state`, `circuit-structure`, `comparison`, `debugging`, `density-matrix`, `documentation`, `entanglement`, `expectation-values`, `gate-identities`, `ghz-state`, `global-phase`, `interference`, `little-endian`, `measurement`, `observables`, `operator-algebra`, `pauli-operators`, `phase-gates`, `probabilities`, `quantum-info`, `qubit-ordering`, `reduced-state`, `relative-phase`, `reset`, `rotation-gates`, `single-qubit-gates`, `state-collapse`, `statevector`, `superposition`, `two-qubit-gates`, `unitary-operations`, `workflow`
- **Question IDs:** s1-001, s1-002, s1-003, s1-004, s1-005, s1-006, s1-007, s1-008, s1-009, s1-010, s1-011, s1-012, s1-013, s1-014, s1-015, s1-016, s1-017, s1-018, s1-019, s1-020, s1-021, s1-022, s1-023, s1-024, s1-025, s1-026, s1-027, s1-028, s1-029, s1-030, s1-031, s1-032, s1-033, s1-034, s1-035, s1-036, s1-037, s1-038, s1-039, s1-040, s1-041, s1-042, s1-043, s1-044, s1-045, s1-046, s1-047, s1-048, s1-049, s1-050, s1-051
- **Last reviewed:** 2026-08-18

### Section 2: Visualize quantum circuits, measurements, and states

- **Official weight:** 11%
- **Questions:** 35 (blueprint target 35) — 11% of the bank
- **Difficulty:** easy 13, medium 11, hard 11
- **Question types:** workflow-selection 7, concept 7, code-behavior 7, result-interpretation 5, code-output 2, code-completion 2, debugging 2, multi-step-reasoning 2, documentation-navigation 1
- **Code-based questions:** 14 (40%)
- **Tags covered:** `analysis`, `backend-visualization`, `bloch-sphere`, `circuit-drawing`, `circuit-timing`, `counts`, `dag`, `debugging`, `density-matrix`, `documentation`, `entanglement`, `error-mitigation`, `hardware`, `hardware-results`, `histogram`, `interference`, `little-endian`, `measurement`, `noise`, `observables`, `quasi-probabilities`, `qubit-ordering`, `relative-phase`, `scalability`, `scheduling`, `shots`, `state-visualization`, `statevector`, `target`, `transpilation`, `visualization`
- **Question IDs:** s2-001, s2-002, s2-003, s2-004, s2-005, s2-006, s2-007, s2-008, s2-009, s2-010, s2-011, s2-012, s2-013, s2-014, s2-015, s2-016, s2-017, s2-018, s2-019, s2-020, s2-021, s2-022, s2-023, s2-024, s2-025, s2-026, s2-027, s2-028, s2-029, s2-030, s2-031, s2-032, s2-033, s2-034, s2-035
- **Last reviewed:** 2026-08-18

### Section 3: Create quantum circuits

- **Official weight:** 18%
- **Questions:** 58 (blueprint target 58) — 18% of the bank
- **Difficulty:** easy 13, medium 29, hard 16
- **Question types:** code-behavior 22, concept 10, code-output 9, workflow-selection 7, debugging 4, multi-step-reasoning 3, code-completion 2, documentation-navigation 1
- **Code-based questions:** 39 (67%)
- **Tags covered:** `analysis`, `backend-v2`, `basis-gates`, `circuit-composition`, `circuit-library`, `circuit-metrics`, `classical-control`, `custom-gates`, `debugging`, `documentation`, `dynamic-circuits`, `dynamical-decoupling`, `hardware`, `isa-circuits`, `layout`, `measurement`, `noise`, `optimization-level`, `parameterized-circuits`, `pass-manager`, `quantum-circuit`, `qubit-ordering`, `registers`, `reproducibility`, `reset`, `result-object`, `routing`, `runtime`, `scheduling`, `serialization`, `state-preparation`, `target`, `transpilation`, `transpiler-stages`, `workflow`
- **Question IDs:** s3-001, s3-002, s3-003, s3-004, s3-005, s3-006, s3-007, s3-008, s3-009, s3-010, s3-011, s3-012, s3-013, s3-014, s3-015, s3-016, s3-017, s3-018, s3-019, s3-020, s3-021, s3-022, s3-023, s3-024, s3-025, s3-026, s3-027, s3-028, s3-029, s3-030, s3-031, s3-032, s3-033, s3-034, s3-035, s3-036, s3-037, s3-038, s3-039, s3-040, s3-041, s3-042, s3-043, s3-044, s3-045, s3-046, s3-047, s3-048, s3-049, s3-050, s3-051, s3-052, s3-053, s3-054, s3-055, s3-056, s3-057, s3-058
- **Last reviewed:** 2026-08-18

### Section 4: Run quantum circuits

- **Official weight:** 15%
- **Questions:** 48 (blueprint target 48) — 15% of the bank
- **Difficulty:** easy 14, medium 20, hard 14
- **Question types:** code-behavior 19, concept 12, workflow-selection 8, debugging 5, multi-step-reasoning 3, documentation-navigation 1
- **Code-based questions:** 23 (48%)
- **Tags covered:** `analysis`, `backend-selection`, `backend-v2`, `batch-mode`, `debugging`, `documentation`, `dynamic-circuits`, `estimator-v2`, `execution-modes`, `hardware-execution`, `isa-circuits`, `job-lifecycle`, `job-limits`, `job-monitoring`, `job-retrieval`, `local-testing`, `max-execution-time`, `noise`, `reproducibility`, `runtime`, `runtime-jobs`, `sampler-v2`, `scheduling`, `service`, `session-mode`, `setup`, `shots`, `simulation`, `target`, `transpilation`, `usage`, `workflow`
- **Question IDs:** s4-001, s4-002, s4-003, s4-004, s4-005, s4-006, s4-007, s4-008, s4-009, s4-010, s4-011, s4-012, s4-013, s4-014, s4-015, s4-016, s4-017, s4-018, s4-019, s4-020, s4-021, s4-022, s4-023, s4-024, s4-025, s4-026, s4-027, s4-028, s4-029, s4-030, s4-031, s4-032, s4-033, s4-034, s4-035, s4-036, s4-037, s4-038, s4-039, s4-040, s4-041, s4-042, s4-043, s4-044, s4-045, s4-046, s4-047, s4-048
- **Last reviewed:** 2026-08-18

### Section 5: Use the sampler primitive

- **Official weight:** 12%
- **Questions:** 39 (blueprint target 39) — 12% of the bank
- **Difficulty:** easy 8, medium 19, hard 12
- **Question types:** code-behavior 8, concept 8, result-interpretation 6, debugging 4, broadcasting-shape 4, workflow-selection 3, multi-step-reasoning 3, code-output 1, code-completion 1, documentation-navigation 1
- **Code-based questions:** 14 (36%)
- **Tags covered:** `analysis`, `array-broadcasting`, `bit-arrays`, `debugging`, `documentation`, `dynamic-circuits`, `dynamical-decoupling`, `error-mitigation`, `error-suppression`, `estimator-v2`, `hardware-results`, `little-endian`, `measurement`, `measurement-sampling`, `metadata`, `noise`, `observables`, `options`, `parameterized-circuits`, `post-selection`, `pubs`, `registers`, `result-interpretation`, `result-object`, `sampler-v2`, `shots`, `transpilation`, `twirling`, `workflow`
- **Question IDs:** s5-001, s5-002, s5-003, s5-004, s5-005, s5-006, s5-007, s5-008, s5-009, s5-010, s5-011, s5-012, s5-013, s5-014, s5-015, s5-016, s5-017, s5-018, s5-019, s5-020, s5-021, s5-022, s5-023, s5-024, s5-025, s5-026, s5-027, s5-028, s5-029, s5-030, s5-031, s5-032, s5-033, s5-034, s5-035, s5-036, s5-037, s5-038, s5-039
- **Last reviewed:** 2026-08-18

### Section 6: Use the estimator primitive

- **Official weight:** 12%
- **Questions:** 38 (blueprint target 38) — 12% of the bank
- **Difficulty:** easy 8, medium 18, hard 12
- **Question types:** code-behavior 11, concept 8, debugging 4, result-interpretation 4, multi-step-reasoning 3, code-output 2, broadcasting-shape 2, workflow-selection 2, code-completion 1, documentation-navigation 1
- **Code-based questions:** 17 (45%)
- **Tags covered:** `analysis`, `array-broadcasting`, `debugging`, `documentation`, `error-mitigation`, `error-suppression`, `estimator-v2`, `expectation-values`, `isa-circuits`, `measurement`, `metadata`, `noise`, `noise-learning`, `observables`, `options`, `parameterized-circuits`, `pauli-operators`, `pec`, `precision`, `pubs`, `qubit-ordering`, `resilience`, `result-object`, `shots`, `standard-errors`, `transpilation`, `twirling`, `usage`, `workflow`, `zne`
- **Question IDs:** s6-001, s6-002, s6-003, s6-004, s6-005, s6-006, s6-007, s6-008, s6-009, s6-010, s6-011, s6-012, s6-013, s6-014, s6-015, s6-016, s6-017, s6-018, s6-019, s6-020, s6-021, s6-022, s6-023, s6-024, s6-025, s6-026, s6-027, s6-028, s6-029, s6-030, s6-031, s6-032, s6-033, s6-034, s6-035, s6-036, s6-037, s6-038
- **Last reviewed:** 2026-08-18

### Section 7: Retrieve and analyze the results of quantum circuits

- **Official weight:** 10%
- **Questions:** 32 (blueprint target 32) — 10% of the bank
- **Difficulty:** easy 6, medium 13, hard 13
- **Question types:** result-interpretation 9, concept 7, workflow-selection 6, multi-step-reasoning 4, debugging 3, code-behavior 2, documentation-navigation 1
- **Code-based questions:** 7 (22%)
- **Tags covered:** `analysis`, `bit-arrays`, `counts`, `debugging`, `documentation`, `dynamic-circuits`, `error-mitigation`, `estimator-v2`, `hardware-results`, `job-lifecycle`, `job-monitoring`, `job-retrieval`, `little-endian`, `metadata`, `noise`, `post-selection`, `pubs`, `quasi-probabilities`, `registers`, `reproducibility`, `result-interpretation`, `result-object`, `runtime`, `runtime-jobs`, `sampler-v2`, `shots`, `simulation`, `standard-errors`, `transpilation`, `usage`, `workflow`
- **Question IDs:** s7-001, s7-002, s7-003, s7-004, s7-005, s7-006, s7-007, s7-008, s7-009, s7-010, s7-011, s7-012, s7-013, s7-014, s7-015, s7-016, s7-017, s7-018, s7-019, s7-020, s7-021, s7-022, s7-023, s7-024, s7-025, s7-026, s7-027, s7-028, s7-029, s7-030, s7-031, s7-032
- **Last reviewed:** 2026-08-18

### Section 8: Operate with OpenQASM

- **Official weight:** 6%
- **Questions:** 20 (blueprint target 19) — 6% of the bank
- **Difficulty:** easy 6, medium 10, hard 4
- **Question types:** code-behavior 6, concept 5, debugging 3, workflow-selection 2, multi-step-reasoning 2, code-completion 1, documentation-navigation 1
- **Code-based questions:** 11 (55%)
- **Tags covered:** `classical-control`, `data-types`, `debugging`, `documentation`, `dynamic-circuits`, `export`, `gate-declarations`, `import`, `interoperability`, `little-endian`, `openqasm-3`, `parameterized-circuits`, `reproducibility`, `result-interpretation`, `syntax`, `transpilation`, `workflow`
- **Question IDs:** s8-001, s8-002, s8-003, s8-004, s8-005, s8-006, s8-007, s8-008, s8-009, s8-010, s8-011, s8-012, s8-013, s8-014, s8-015, s8-016, s8-017, s8-018, s8-019, s8-020
- **Last reviewed:** 2026-08-18

## Concept coverage by tag

| Tag | Questions | Sections | Code-based |
| --- | --- | --- | --- |
| `analysis` | 49 | 2, 3, 4, 5, 6, 7 | 6 |
| `array-broadcasting` | 9 | 5, 6 | 2 |
| `backend-selection` | 2 | 4 | 2 |
| `backend-v2` | 7 | 3, 4 | 4 |
| `backend-visualization` | 3 | 2 | 2 |
| `basis-gates` | 2 | 3 | 1 |
| `batch-mode` | 7 | 4 | 2 |
| `bell-state` | 1 | 1 | 1 |
| `bit-arrays` | 6 | 5, 7 | 2 |
| `bloch-sphere` | 3 | 2 | 2 |
| `circuit-composition` | 5 | 3 | 5 |
| `circuit-drawing` | 6 | 2 | 4 |
| `circuit-library` | 4 | 3 | 2 |
| `circuit-metrics` | 8 | 3 | 8 |
| `circuit-structure` | 3 | 1 | 3 |
| `circuit-timing` | 1 | 2 | 0 |
| `classical-control` | 10 | 3, 8 | 7 |
| `comparison` | 2 | 1 | 2 |
| `counts` | 8 | 2, 7 | 1 |
| `custom-gates` | 1 | 3 | 1 |
| `dag` | 1 | 2 | 1 |
| `data-types` | 4 | 8 | 3 |
| `debugging` | 27 | 1, 2, 3, 4, 5, 6, 7, 8 | 11 |
| `density-matrix` | 4 | 1, 2 | 3 |
| `documentation` | 9 | 1, 2, 3, 4, 5, 6, 7, 8 | 0 |
| `dynamic-circuits` | 12 | 3, 4, 5, 7, 8 | 6 |
| `dynamical-decoupling` | 3 | 3, 5 | 2 |
| `entanglement` | 13 | 1, 2 | 10 |
| `error-mitigation` | 15 | 2, 5, 6, 7 | 3 |
| `error-suppression` | 4 | 5, 6 | 2 |
| `estimator-v2` | 44 | 4, 5, 6, 7 | 17 |
| `execution-modes` | 12 | 4 | 5 |
| `expectation-values` | 7 | 1, 6 | 6 |
| `export` | 4 | 8 | 3 |
| `gate-declarations` | 3 | 8 | 2 |
| `gate-identities` | 4 | 1 | 3 |
| `ghz-state` | 2 | 1 | 1 |
| `global-phase` | 6 | 1 | 5 |
| `hardware` | 3 | 2, 3 | 2 |
| `hardware-execution` | 7 | 4 | 4 |
| `hardware-results` | 14 | 2, 5, 7 | 1 |
| `histogram` | 11 | 2 | 2 |
| `import` | 4 | 8 | 2 |
| `interference` | 4 | 1, 2 | 0 |
| `interoperability` | 9 | 8 | 3 |
| `isa-circuits` | 12 | 3, 4, 6 | 7 |
| `job-lifecycle` | 7 | 4, 7 | 4 |
| `job-limits` | 3 | 4 | 2 |
| `job-monitoring` | 9 | 4, 7 | 6 |
| `job-retrieval` | 6 | 4, 7 | 4 |
| `layout` | 2 | 3 | 2 |
| `little-endian` | 13 | 1, 2, 5, 7, 8 | 7 |
| `local-testing` | 5 | 4 | 2 |
| `max-execution-time` | 2 | 4 | 1 |
| `measurement` | 19 | 1, 2, 3, 5, 6 | 12 |
| `measurement-sampling` | 3 | 5 | 1 |
| `metadata` | 10 | 5, 6, 7 | 4 |
| `noise` | 14 | 2, 3, 4, 5, 6, 7 | 5 |
| `noise-learning` | 2 | 6 | 1 |
| `observables` | 24 | 1, 2, 5, 6 | 13 |
| `openqasm-3` | 20 | 8 | 11 |
| `operator-algebra` | 10 | 1 | 8 |
| `optimization-level` | 7 | 3 | 3 |
| `options` | 8 | 5, 6 | 6 |
| `parameterized-circuits` | 15 | 3, 5, 6, 8 | 10 |
| `pass-manager` | 6 | 3 | 6 |
| `pauli-operators` | 11 | 1, 6 | 8 |
| `pec` | 1 | 6 | 0 |
| `phase-gates` | 2 | 1 | 2 |
| `post-selection` | 3 | 5, 7 | 0 |
| `precision` | 6 | 6 | 4 |
| `probabilities` | 1 | 1 | 1 |
| `pubs` | 15 | 5, 6, 7 | 7 |
| `quantum-circuit` | 15 | 3 | 14 |
| `quantum-info` | 1 | 1 | 0 |
| `quasi-probabilities` | 2 | 2, 7 | 0 |
| `qubit-ordering` | 13 | 1, 2, 3, 6 | 8 |
| `reduced-state` | 2 | 1 | 2 |
| `registers` | 12 | 3, 5, 7 | 8 |
| `relative-phase` | 11 | 1, 2 | 6 |
| `reproducibility` | 11 | 3, 4, 7, 8 | 1 |
| `reset` | 2 | 1, 3 | 2 |
| `resilience` | 3 | 6 | 1 |
| `result-interpretation` | 8 | 5, 7, 8 | 1 |
| `result-object` | 19 | 3, 5, 6, 7 | 11 |
| `rotation-gates` | 3 | 1 | 3 |
| `routing` | 3 | 3 | 0 |
| `runtime` | 24 | 3, 4, 7 | 14 |
| `runtime-jobs` | 8 | 4, 7 | 5 |
| `sampler-v2` | 41 | 4, 5, 7 | 16 |
| `scalability` | 1 | 2 | 0 |
| `scheduling` | 5 | 2, 3, 4 | 2 |
| `serialization` | 1 | 3 | 0 |
| `service` | 6 | 4 | 3 |
| `session-mode` | 6 | 4 | 2 |
| `setup` | 2 | 4 | 0 |
| `shots` | 17 | 2, 4, 5, 6, 7 | 7 |
| `simulation` | 8 | 4, 7 | 3 |
| `single-qubit-gates` | 7 | 1 | 6 |
| `standard-errors` | 7 | 6, 7 | 1 |
| `state-collapse` | 1 | 1 | 1 |
| `state-preparation` | 1 | 3 | 1 |
| `state-visualization` | 10 | 2 | 6 |
| `statevector` | 11 | 1, 2 | 9 |
| `superposition` | 1 | 1 | 1 |
| `syntax` | 6 | 8 | 4 |
| `target` | 8 | 2, 3, 4 | 6 |
| `transpilation` | 41 | 2, 3, 4, 5, 6, 7, 8 | 18 |
| `transpiler-stages` | 3 | 3 | 1 |
| `twirling` | 3 | 5, 6 | 2 |
| `two-qubit-gates` | 11 | 1 | 10 |
| `unitary-operations` | 7 | 1 | 6 |
| `usage` | 6 | 4, 6, 7 | 4 |
| `visualization` | 24 | 2 | 10 |
| `workflow` | 23 | 1, 3, 4, 5, 6, 7, 8 | 2 |
| `zne` | 1 | 6 | 1 |

<!-- END:COVERAGE -->
