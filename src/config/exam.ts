/**
 * Single source of truth for the official IBM C1000-179 exam configuration.
 *
 * Verified against the official IBM certification page on 2026-08-18:
 * https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400
 *
 * The page states, verbatim:
 *   "Number of questions: 68"
 *   "Number of questions to pass: 47"
 *   "Time allowed: 90 minutes"
 *   "Status: Live"
 *
 * Nothing in the application may hard-code these values independently.
 */

export const EXAM_CODE = "C1000-179" as const;
export const CREDENTIAL_CODE = "C9008400" as const;
export const EXAM_TITLE =
  "Fundamentals of Quantum Computing Using Qiskit v2.X Developer" as const;

export const EXAM_BLUEPRINT_URL =
  "https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400" as const;

/** Date the blueprint above was last read from the official IBM page. */
export const EXAM_BLUEPRINT_VERIFIED_ON = "2026-08-18" as const;

/** Total scored questions in one official exam sitting. */
export const EXAM_TOTAL_QUESTIONS = 68;

/**
 * Raw number of correct answers required to pass.
 *
 * This is a raw-score threshold, NOT a percentage. 47/68 is 69.1%, and a
 * rounded percentage must never be used in its place: 46/68 rounds to 68% and
 * 47/68 rounds to 69%, so a "percentage >= 70" rule would wrongly fail a
 * passing score.
 */
export const EXAM_PASSING_CORRECT_ANSWERS = 47;

/** Time limit in minutes. */
export const EXAM_TIME_LIMIT_MINUTES = 90;

/** Time limit in seconds, derived. */
export const EXAM_TIME_LIMIT_SECONDS = EXAM_TIME_LIMIT_MINUTES * 60;

export type ExamSectionNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ExamSectionBlueprint = {
  number: ExamSectionNumber;
  /** Official section title, reproduced from the IBM certification page. */
  title: string;
  /** Official percentage weight, reproduced from the IBM certification page. */
  weightPercent: number;
  /** Short study description written for this app (not official IBM copy). */
  description: string;
};

export const EXAM_SECTIONS: ExamSectionBlueprint[] = [
  {
    number: 1,
    title: "Perform quantum operations",
    weightPercent: 16,
    description:
      "Pauli operators, standard gates, unitary operations, qubit ordering, entanglement, and global versus relative phase.",
  },
  {
    number: 2,
    title: "Visualize quantum circuits, measurements, and states",
    weightPercent: 11,
    description:
      "Circuit drawing, histogram and distribution plots, statevector and Bloch visualizations, and the limits of each view.",
  },
  {
    number: 3,
    title: "Create quantum circuits",
    weightPercent: 18,
    description:
      "QuantumCircuit construction, registers, parameterized circuits, control flow, transpilation, and ISA circuits.",
  },
  {
    number: 4,
    title: "Run quantum circuits",
    weightPercent: 15,
    description:
      "QiskitRuntimeService, BackendV2 and Target, execution modes, sessions, batches, and the job lifecycle.",
  },
  {
    number: 5,
    title: "Use the sampler primitive",
    weightPercent: 12,
    description:
      "SamplerV2 PUBs, shots, broadcasting, sampler options, and navigating BitArray results.",
  },
  {
    number: 6,
    title: "Use the estimator primitive",
    weightPercent: 12,
    description:
      "EstimatorV2 PUBs, observables, precision versus shots, resilience levels, and expectation-value results.",
  },
  {
    number: 7,
    title: "Retrieve and analyze the results of quantum circuits",
    weightPercent: 10,
    description:
      "Retrieving jobs, reading PrimitiveResult objects, metadata, and comparing simulator and hardware data responsibly.",
  },
  {
    number: 8,
    title: "Operate with OpenQASM",
    weightPercent: 6,
    description:
      "OpenQASM 3 syntax, types, control flow, Qiskit import and export, and interoperability limits.",
  },
];

export const EXAM_SECTION_NUMBERS: ExamSectionNumber[] = EXAM_SECTIONS.map(
  (section) => section.number,
);

export function getExamSection(section: number): ExamSectionBlueprint {
  const found = EXAM_SECTIONS.find((item) => item.number === section);
  if (!found) {
    throw new Error(`Unknown exam section: ${section}`);
  }
  return found;
}

export function getExamSectionTitle(section: number): string {
  return getExamSection(section).title;
}

/**
 * Distribute `total` items across the official section weights using the
 * largest-remainder (Hare-Niemeyer) method, so the parts always sum exactly to
 * `total` and stay as close as possible to the published weights.
 */
export function distributeByWeight(total: number): Record<number, number> {
  const exact = EXAM_SECTIONS.map((section) => ({
    number: section.number,
    exact: (section.weightPercent / 100) * total,
  }));

  const result: Record<number, number> = {};
  let assigned = 0;
  for (const item of exact) {
    const floor = Math.floor(item.exact);
    result[item.number] = floor;
    assigned += floor;
  }

  const remainders = exact
    .map((item) => ({ number: item.number, remainder: item.exact - Math.floor(item.exact) }))
    .sort((a, b) => b.remainder - a.remainder || a.number - b.number);

  let index = 0;
  while (assigned < total && remainders.length > 0) {
    result[remainders[index % remainders.length].number] += 1;
    assigned += 1;
    index += 1;
  }

  return result;
}

/**
 * Integer per-section question targets for one 68-question mock exam sitting.
 * Derived from the official weights: {1:11, 2:8, 3:12, 4:10, 5:8, 6:8, 7:7, 8:4}.
 */
export const MOCK_EXAM_SECTION_TARGETS: Record<number, number> =
  distributeByWeight(EXAM_TOTAL_QUESTIONS);

/** Minimum size of the authored question bank. */
export const QUESTION_BANK_MINIMUM = 320;

/**
 * Per-section authoring targets for the full bank, derived from the same
 * official weights: {1:51, 2:35, 3:58, 4:48, 5:38, 6:38, 7:32, 8:20}.
 */
export const QUESTION_BANK_SECTION_TARGETS: Record<number, number> =
  distributeByWeight(QUESTION_BANK_MINIMUM);

/**
 * Official raw-score pass criterion. Never derive this from a percentage.
 */
export function isPassingRawScore(
  correctAnswers: number,
  totalQuestions: number = EXAM_TOTAL_QUESTIONS,
): boolean {
  if (totalQuestions === EXAM_TOTAL_QUESTIONS) {
    return correctAnswers >= EXAM_PASSING_CORRECT_ANSWERS;
  }
  // For non-standard sitting lengths, scale the official ratio and require the
  // same proportion of correct answers, rounded up.
  const required = Math.ceil(
    (EXAM_PASSING_CORRECT_ANSWERS / EXAM_TOTAL_QUESTIONS) * totalQuestions,
  );
  return correctAnswers >= required;
}

export function requiredCorrectAnswers(
  totalQuestions: number = EXAM_TOTAL_QUESTIONS,
): number {
  if (totalQuestions === EXAM_TOTAL_QUESTIONS) {
    return EXAM_PASSING_CORRECT_ANSWERS;
  }
  return Math.ceil(
    (EXAM_PASSING_CORRECT_ANSWERS / EXAM_TOTAL_QUESTIONS) * totalQuestions,
  );
}
