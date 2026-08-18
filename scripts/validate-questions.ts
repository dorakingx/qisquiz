/**
 * Question-bank quality gate.
 *
 * Run with `npm run validate:questions`. Fails the build on any error and
 * always reports warnings and waivers so nothing is hidden.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EXAM_SECTIONS,
  QUESTION_BANK_MINIMUM,
  QUESTION_BANK_SECTION_TARGETS,
} from "../src/config/exam";
import { QUIZ_QUESTIONS } from "../src/data/questions";
import {
  findAnswerLeaks,
  findDistractorIssues,
  findDuplicates,
  findExplanationIssues,
  issue,
} from "../src/lib/quality";
import type { QualityIssue } from "../src/lib/quality";
import type { QuestionType, QuizQuestion } from "../src/types/quiz";
import {
  CHOICE_IDS,
  QUESTION_TYPES,
  RECALL_QUESTION_TYPES,
  isCodeQuestion,
} from "../src/types/quiz";

const here = path.dirname(fileURLToPath(import.meta.url));
const KNOWN_URLS_FILE = path.join(here, "data", "known-doc-urls.txt");

const knownDocUrls = new Set(
  fs
    .readFileSync(KNOWN_URLS_FILE, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);

/** Non-IBM-docs references that are allowed by explicit decision. */
const ALLOWED_EXTERNAL_URLS = new Set([
  "https://openqasm.com/language/index.html",
  "https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400",
]);

/** Question ids published before this change set; they must never disappear. */
const PROTECTED_IDS: string[] = EXAM_SECTIONS.flatMap((section) =>
  Array.from(
    { length: 15 },
    (_, index) => `s${section.number}-${String(index + 1).padStart(3, "0")}`,
  ),
);

/**
 * Objective areas the coverage matrix must not leave empty. Each entry names a
 * tag that at least one question has to carry.
 */
const REQUIRED_TAGS: string[] = [
  "qubit-ordering",
  "little-endian",
  "global-phase",
  "relative-phase",
  "entanglement",
  "pauli-operators",
  "observables",
  "measurement",
  "unitary-operations",
  "circuit-drawing",
  "histogram",
  "state-visualization",
  "bloch-sphere",
  "backend-visualization",
  "quantum-circuit",
  "registers",
  "parameterized-circuits",
  "circuit-library",
  "transpilation",
  "transpiler-stages",
  "isa-circuits",
  "optimization-level",
  "routing",
  "layout",
  "dynamic-circuits",
  "classical-control",
  "scheduling",
  "dynamical-decoupling",
  "backend-v2",
  "target",
  "execution-modes",
  "session-mode",
  "batch-mode",
  "runtime-jobs",
  "job-monitoring",
  "job-retrieval",
  "job-limits",
  "max-execution-time",
  "hardware-execution",
  "local-testing",
  "simulation",
  "sampler-v2",
  "pubs",
  "shots",
  "bit-arrays",
  "array-broadcasting",
  "post-selection",
  "twirling",
  "estimator-v2",
  "expectation-values",
  "precision",
  "resilience",
  "error-mitigation",
  "error-suppression",
  "standard-errors",
  "noise-learning",
  "zne",
  "pec",
  "metadata",
  "result-object",
  "counts",
  "analysis",
  "hardware-results",
  "reproducibility",
  "quasi-probabilities",
  "openqasm-3",
  "data-types",
  "gate-declarations",
  "interoperability",
  "import",
  "export",
  "documentation",
];

const MAX_REVIEW_AGE_DAYS = 400;

const errors: QualityIssue[] = [];
const warnings: QualityIssue[] = [];
const waivers: { questionId: string; rule: string; reason: string }[] = [];

function record(list: QualityIssue[]): void {
  for (const item of list) {
    if (item.severity === "error") errors.push(item);
    else warnings.push(item);
  }
}

function fail(questionId: string, rule: string, message: string): void {
  errors.push(issue(questionId, rule, "error", message));
}

function warn(questionId: string, rule: string, message: string): void {
  warnings.push(issue(questionId, rule, "warning", message));
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

// ------------------------------------------------------------- per-question

const seenIds = new Set<string>();

for (const question of QUIZ_QUESTIONS as QuizQuestion[]) {
  const id = question.id;

  if (!id || typeof id !== "string") {
    fail("<missing id>", "MISSING_ID", "Every question needs a non-empty id.");
    continue;
  }
  if (seenIds.has(id)) {
    fail(id, "DUPLICATE_ID", "Question ids must be unique across the bank.");
  }
  seenIds.add(id);

  if (!/^s[1-8]-\d{3}$/.test(id)) {
    fail(id, "MALFORMED_ID", 'Ids must look like "s<section>-<nnn>".');
  }
  if (!id.startsWith(`s${question.section}-`)) {
    fail(id, "MALFORMED_ID", "The id's section prefix must match the section.");
  }

  if (
    !Number.isInteger(question.section) ||
    question.section < 1 ||
    question.section > 8
  ) {
    fail(id, "UNSUPPORTED_SECTION", "Section must be an integer from 1 to 8.");
  }

  if (!QUESTION_TYPES.includes(question.questionType)) {
    fail(id, "INVALID_QUESTION_TYPE", `Unknown questionType "${question.questionType}".`);
  }

  // Choices and correctness
  if (question.choices.length !== 4) {
    fail(id, "CHOICE_COUNT", "Every question must have exactly four choices.");
  }
  const choiceIds = question.choices.map((choice) => choice.id);
  if (new Set(choiceIds).size !== choiceIds.length) {
    fail(id, "DUPLICATE_CHOICE_ID", "Choice ids must be unique within a question.");
  }
  for (const choiceId of choiceIds) {
    if (!CHOICE_IDS.includes(choiceId)) {
      fail(id, "INVALID_CHOICE_ID", `Unexpected choice id "${choiceId}".`);
    }
  }
  if (!choiceIds.includes(question.correctChoiceId)) {
    fail(
      id,
      "INVALID_CORRECT_CHOICE",
      `correctChoiceId "${question.correctChoiceId}" matches no choice.`,
    );
    continue;
  }

  // Required metadata
  if (!question.question.trim()) {
    fail(id, "MISSING_METADATA", "The question stem is empty.");
  }
  if (!question.concept.trim()) {
    fail(id, "MISSING_METADATA", "concept is required.");
  }
  if (!question.objective.trim()) {
    fail(id, "MISSING_METADATA", "objective is required.");
  }
  if (!Array.isArray(question.tags) || question.tags.length === 0) {
    fail(id, "MISSING_METADATA", "At least one tag is required.");
  }
  if (!question.qiskitVersion) {
    fail(id, "MISSING_METADATA", "qiskitVersion is required.");
  }
  if (
    !Number.isFinite(question.estimatedTimeSeconds) ||
    question.estimatedTimeSeconds <= 0
  ) {
    fail(id, "MISSING_METADATA", "estimatedTimeSeconds must be positive.");
  }

  // Review date
  if (!question.lastReviewedAt || !isIsoDate(question.lastReviewedAt)) {
    fail(id, "MISSING_REVIEW_DATE", "lastReviewedAt must be an ISO date.");
  } else {
    const reviewed = new Date(question.lastReviewedAt).getTime();
    const now = Date.now();
    if (reviewed > now + 24 * 3600 * 1000) {
      fail(id, "FUTURE_REVIEW_DATE", "lastReviewedAt is in the future.");
    } else {
      const ageDays = (now - reviewed) / (24 * 3600 * 1000);
      if (ageDays > MAX_REVIEW_AGE_DAYS) {
        warn(
          id,
          "STALE_REVIEW_DATE",
          `Last reviewed ${Math.round(ageDays)} days ago; re-check against current documentation.`,
        );
      }
    }
  }

  // References
  if (!Array.isArray(question.referenceUrls) || question.referenceUrls.length === 0) {
    fail(id, "MISSING_REFERENCE", "At least one official reference URL is required.");
  } else {
    for (const url of question.referenceUrls) {
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        fail(id, "INVALID_URL", `"${url}" is not a valid URL.`);
        continue;
      }
      if (parsed.protocol !== "https:") {
        fail(id, "INVALID_URL", `"${url}" must use https.`);
      }
      if (ALLOWED_EXTERNAL_URLS.has(url)) continue;
      if (
        parsed.hostname === "quantum.cloud.ibm.com" &&
        !parsed.pathname.startsWith("/docs/en/")
      ) {
        fail(
          id,
          "REDIRECTING_REFERENCE",
          `"${url}" is a redirecting form; use the canonical /docs/en/ path.`,
        );
        continue;
      }
      if (!knownDocUrls.has(url)) {
        fail(
          id,
          "UNKNOWN_REFERENCE",
          `"${url}" is not in the verified documentation snapshot.`,
        );
      }
    }
  }

  // Code consistency
  if (question.code && question.codeStatus === "none") {
    fail(id, "CODE_STATUS_MISMATCH", 'A question with code cannot have codeStatus "none".');
  }
  if (!question.code && question.codeStatus !== "none") {
    fail(
      id,
      "CODE_STATUS_MISMATCH",
      `codeStatus is "${question.codeStatus}" but there is no code block.`,
    );
  }
  if (!question.code && question.codeLanguage) {
    fail(id, "CODE_STATUS_MISMATCH", "codeLanguage is set without any code.");
  }

  // Display order is shuffled, so referring to a choice by its letter in an
  // explanation is always wrong for some learners.
  if (/\((?:[a-d])\)/.test(question.explanation)) {
    fail(
      id,
      "CHOICE_LETTER_REFERENCE",
      "Explanations must not refer to choices by letter, because display order is shuffled.",
    );
  }

  record(findAnswerLeaks(question));
  record(findDistractorIssues(question));
  record(findExplanationIssues(question));

  for (const waiver of question.qualityWaivers ?? []) {
    if (!waiver.reason || waiver.reason.trim().length < 20) {
      fail(
        id,
        "UNJUSTIFIED_WAIVER",
        `Waiver for "${waiver.rule}" needs a concrete reason of at least 20 characters.`,
      );
    }
    waivers.push({ questionId: id, rule: waiver.rule, reason: waiver.reason });
  }
}

// Waivers suppress the matching rule for that question.
const waivedKeys = new Set(
  waivers.map((waiver) => `${waiver.questionId}::${waiver.rule}`),
);
const activeErrors = errors.filter(
  (error) => !waivedKeys.has(`${error.questionId}::${error.rule}`),
);
const activeWarnings = warnings.filter(
  (warning) => !waivedKeys.has(`${warning.questionId}::${warning.rule}`),
);

// ------------------------------------------------------------ bank-wide gates

const bankErrors: string[] = [];
const bankWarnings: string[] = [];

const total = QUIZ_QUESTIONS.length;
if (total < QUESTION_BANK_MINIMUM) {
  bankErrors.push(
    `Bank has ${total} questions; at least ${QUESTION_BANK_MINIMUM} are required.`,
  );
}

for (const protectedId of PROTECTED_IDS) {
  if (!seenIds.has(protectedId)) {
    bankErrors.push(
      `Previously published question id "${protectedId}" is missing; existing ids must be preserved.`,
    );
  }
}

const bySection = new Map<number, QuizQuestion[]>();
for (const question of QUIZ_QUESTIONS) {
  const list = bySection.get(question.section) ?? [];
  list.push(question);
  bySection.set(question.section, list);
}

for (const section of EXAM_SECTIONS) {
  const list = bySection.get(section.number) ?? [];
  const target = QUESTION_BANK_SECTION_TARGETS[section.number];
  if (list.length < target) {
    bankErrors.push(
      `Section ${section.number} has ${list.length} questions; the blueprint target is ${target}.`,
    );
  }

  const types = new Set(list.map((question) => question.questionType));
  if (types.size < 4) {
    bankErrors.push(
      `Section ${section.number} uses only ${types.size} question type(s); at least 4 are required.`,
    );
  }

  const difficulties = new Map<string, number>();
  for (const question of list) {
    difficulties.set(
      question.difficulty,
      (difficulties.get(question.difficulty) ?? 0) + 1,
    );
  }
  if (difficulties.size < 3) {
    bankErrors.push(
      `Section ${section.number} is missing at least one difficulty level.`,
    );
  }
  for (const [difficulty, count] of difficulties) {
    if (list.length > 0 && count / list.length > 0.6) {
      bankErrors.push(
        `Section ${section.number} is dominated by "${difficulty}" questions (${Math.round((count / list.length) * 100)}%).`,
      );
    }
  }
}

const codeQuestions = QUIZ_QUESTIONS.filter(isCodeQuestion).length;
const codeShare = codeQuestions / total;
if (codeShare < 0.45) {
  bankErrors.push(
    `Only ${Math.round(codeShare * 100)}% of questions are meaningfully code-based; at least 45% are required.`,
  );
}

const recallCount = QUIZ_QUESTIONS.filter((question) =>
  RECALL_QUESTION_TYPES.includes(question.questionType),
).length;
if (recallCount / total > 0.2) {
  bankErrors.push(
    `Direct recall questions are ${Math.round((recallCount / total) * 100)}% of the bank; the limit is 20%.`,
  );
}

const typeCounts = new Map<QuestionType, number>();
for (const question of QUIZ_QUESTIONS) {
  typeCounts.set(
    question.questionType,
    (typeCounts.get(question.questionType) ?? 0) + 1,
  );
}
for (const [type, count] of typeCounts) {
  if (count / total > 0.3) {
    bankErrors.push(
      `Question type "${type}" is ${Math.round((count / total) * 100)}% of the bank; the limit is 30%.`,
    );
  }
}

const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
for (const question of QUIZ_QUESTIONS) {
  difficultyCounts[question.difficulty] += 1;
}
const difficultyTargets = { easy: 0.25, medium: 0.45, hard: 0.3 };
for (const key of ["easy", "medium", "hard"] as const) {
  const share = difficultyCounts[key] / total;
  const delta = Math.abs(share - difficultyTargets[key]);
  if (delta > 0.08) {
    bankErrors.push(
      `Difficulty "${key}" is ${Math.round(share * 100)}% of the bank; the target is ${Math.round(difficultyTargets[key] * 100)}% (tolerance 8 points).`,
    );
  } else if (delta > 0.05) {
    bankWarnings.push(
      `Difficulty "${key}" is ${Math.round(share * 100)}% of the bank; the target is ${Math.round(difficultyTargets[key] * 100)}%.`,
    );
  }
}

const allTags = new Set(QUIZ_QUESTIONS.flatMap((question) => question.tags));
for (const tag of REQUIRED_TAGS) {
  if (!allTags.has(tag)) {
    bankErrors.push(`Objective coverage gap: no question carries the tag "${tag}".`);
  }
}

const tagCounts = new Map<string, number>();
for (const question of QUIZ_QUESTIONS) {
  for (const tag of question.tags) {
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
}
for (const [tag, count] of tagCounts) {
  if (count / total > 0.25) {
    bankWarnings.push(
      `Tag "${tag}" appears on ${Math.round((count / total) * 100)}% of questions.`,
    );
  }
}

// Repeated stem templates
const stemPrefixes = new Map<string, number>();
for (const question of QUIZ_QUESTIONS) {
  const prefix = question.question.toLowerCase().split(" ").slice(0, 4).join(" ");
  stemPrefixes.set(prefix, (stemPrefixes.get(prefix) ?? 0) + 1);
}
for (const [prefix, count] of stemPrefixes) {
  if (count > total * 0.06) {
    bankWarnings.push(
      `Stem template "${prefix}…" is reused by ${count} questions (${Math.round((count / total) * 100)}%).`,
    );
  }
}

const duplicates = findDuplicates(QUIZ_QUESTIONS);
for (const pair of duplicates.exact) {
  bankErrors.push(`Exact duplicate stems: ${pair.a} and ${pair.b}.`);
}
for (const pair of duplicates.strong) {
  bankErrors.push(
    `Strong near-duplicate: ${pair.a} and ${pair.b} (similarity ${pair.similarity.toFixed(2)}).`,
  );
}
for (const pair of duplicates.near) {
  bankWarnings.push(
    `Near-duplicate: ${pair.a} and ${pair.b} (similarity ${pair.similarity.toFixed(2)}).`,
  );
}

// ------------------------------------------------------------------- report

function group(items: QualityIssue[]): Map<string, QualityIssue[]> {
  const grouped = new Map<string, QualityIssue[]>();
  for (const item of items) {
    const list = grouped.get(item.rule) ?? [];
    list.push(item);
    grouped.set(item.rule, list);
  }
  return grouped;
}

console.log(`Validating ${total} questions across ${bySection.size} sections.`);
console.log(
  `  code-based: ${codeQuestions} (${Math.round(codeShare * 100)}%) · easy ${difficultyCounts.easy} · medium ${difficultyCounts.medium} · hard ${difficultyCounts.hard}`,
);

if (waivers.length > 0) {
  console.log(`\nWaivers in effect (${waivers.length}):`);
  for (const waiver of waivers) {
    console.log(`  - ${waiver.questionId} [${waiver.rule}]: ${waiver.reason}`);
  }
}

const allWarnings = [
  ...activeWarnings.map((item) => `${item.questionId} [${item.rule}] ${item.message}`),
  ...bankWarnings,
];
if (allWarnings.length > 0) {
  console.log(`\nWarnings (${allWarnings.length}):`);
  for (const message of allWarnings) console.log(`  ! ${message}`);
}

const allErrors = [
  ...activeErrors.map((item) => `${item.questionId} [${item.rule}] ${item.message}`),
  ...bankErrors,
];

if (allErrors.length > 0) {
  console.error(`\nQuestion validation FAILED with ${allErrors.length} error(s):`);
  const grouped = group(activeErrors);
  for (const [rule, items] of grouped) {
    console.error(`\n  ${rule} (${items.length})`);
    for (const item of items) {
      console.error(`    - ${item.questionId}: ${item.message}`);
    }
  }
  if (bankErrors.length > 0) {
    console.error(`\n  BANK_LEVEL (${bankErrors.length})`);
    for (const message of bankErrors) console.error(`    - ${message}`);
  }
  process.exit(1);
}

console.log(
  `\nQuestion validation passed: ${total} questions, ${allWarnings.length} warning(s), ${waivers.length} waiver(s).`,
);
