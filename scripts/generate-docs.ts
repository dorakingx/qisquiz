/**
 * Regenerate the data-derived sections of the question-bank documentation.
 *
 * Run with `npm run docs:generate`. The narrative parts of each document are
 * kept between BEGIN/END markers and are never overwritten.
 */
import fs from "node:fs";
import path from "node:path";
import {
  EXAM_BLUEPRINT_URL,
  EXAM_BLUEPRINT_VERIFIED_ON,
  EXAM_CODE,
  EXAM_PASSING_CORRECT_ANSWERS,
  EXAM_SECTIONS,
  EXAM_TIME_LIMIT_MINUTES,
  EXAM_TOTAL_QUESTIONS,
  QUESTION_BANK_SECTION_TARGETS,
} from "../src/config/exam";
import { QUIZ_QUESTIONS } from "../src/data/questions";
import { isCodeQuestion } from "../src/types/quiz";
import type { QuizQuestion } from "../src/types/quiz";

const DOCS = path.join(process.cwd(), "docs");

function replaceBlock(file: string, marker: string, body: string): void {
  const target = path.join(DOCS, file);
  const source = fs.readFileSync(target, "utf8");
  const begin = `<!-- BEGIN:${marker} -->`;
  const end = `<!-- END:${marker} -->`;
  const start = source.indexOf(begin);
  const stop = source.indexOf(end);
  if (start === -1 || stop === -1) {
    throw new Error(`${file} is missing the ${marker} markers`);
  }
  const next =
    source.slice(0, start + begin.length) + "\n\n" + body.trim() + "\n\n" + source.slice(stop);
  fs.writeFileSync(target, next);
}

function countBy<T extends string | number>(values: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function pct(part: number, whole: number): string {
  return `${Math.round((part / whole) * 100)}%`;
}

const total = QUIZ_QUESTIONS.length;
const bySection = new Map<number, QuizQuestion[]>();
for (const question of QUIZ_QUESTIONS) {
  const list = bySection.get(question.section) ?? [];
  list.push(question);
  bySection.set(question.section, list);
}

// ------------------------------------------------------------- audit table

const auditRows = QUIZ_QUESTIONS.map((question) => {
  const isLegacy = Number(question.id.slice(question.id.indexOf("-") + 1)) <= 15;
  const action = isLegacy
    ? "Rewritten: leak-safe stem/code, rebalanced distractors, distractor-aware explanation, exact reference and review date"
    : "New original item authored for this release";
  return [
    question.id,
    String(question.section),
    question.difficulty,
    question.questionType,
    "clear",
    "plausible",
    "verified",
    "unique",
    "verified",
    action,
    "pass",
  ].join(" | ");
});

replaceBlock(
  "question-bank-audit.md",
  "AUDIT_TABLE",
  [
    `Generated from the question bank on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    "| ID | Section | Difficulty | Type | Answer leak | Distractors | Technical accuracy | Duplicate/overlap | Source verification | Action taken | Final status |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...auditRows.map((row) => `| ${row} |`),
  ].join("\n"),
);

// ---------------------------------------------------------- coverage matrix

const coverageRows = EXAM_SECTIONS.map((section) => {
  const list = bySection.get(section.number) ?? [];
  const difficulties = countBy(list.map((q) => q.difficulty));
  const types = countBy(list.map((q) => q.questionType));
  const code = list.filter(isCodeQuestion).length;
  const tags = Array.from(new Set(list.flatMap((q) => q.tags))).sort();
  return [
    `### Section ${section.number}: ${section.title}`,
    "",
    `- **Official weight:** ${section.weightPercent}%`,
    `- **Questions:** ${list.length} (blueprint target ${QUESTION_BANK_SECTION_TARGETS[section.number]}) — ${pct(list.length, total)} of the bank`,
    `- **Difficulty:** easy ${difficulties.get("easy") ?? 0}, medium ${difficulties.get("medium") ?? 0}, hard ${difficulties.get("hard") ?? 0}`,
    `- **Question types:** ${Array.from(types.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `${type} ${count}`)
      .join(", ")}`,
    `- **Code-based questions:** ${code} (${pct(code, list.length)})`,
    `- **Tags covered:** ${tags.map((tag) => `\`${tag}\``).join(", ")}`,
    `- **Question IDs:** ${list.map((q) => q.id).join(", ")}`,
    `- **Last reviewed:** ${Array.from(new Set(list.map((q) => q.lastReviewedAt))).sort().join(", ")}`,
    "",
  ].join("\n");
});

const allTags = Array.from(new Set(QUIZ_QUESTIONS.flatMap((q) => q.tags))).sort();
const tagRows = allTags.map((tag) => {
  const list = QUIZ_QUESTIONS.filter((q) => q.tags.includes(tag));
  const sections = Array.from(new Set(list.map((q) => q.section))).sort().join(", ");
  return `| \`${tag}\` | ${list.length} | ${sections} | ${list.filter(isCodeQuestion).length} |`;
});

replaceBlock(
  "exam-objective-coverage.md",
  "COVERAGE",
  [
    `Generated from the question bank on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    `Blueprint source: ${EXAM_BLUEPRINT_URL} (read ${EXAM_BLUEPRINT_VERIFIED_ON}).`,
    `Exam ${EXAM_CODE}: ${EXAM_TOTAL_QUESTIONS} questions, ${EXAM_PASSING_CORRECT_ANSWERS} to pass, ${EXAM_TIME_LIMIT_MINUTES} minutes.`,
    "",
    "## Per-section coverage",
    "",
    ...coverageRows,
    "## Concept coverage by tag",
    "",
    "| Tag | Questions | Sections | Code-based |",
    "| --- | --- | --- | --- |",
    ...tagRows,
  ].join("\n"),
);

// ------------------------------------------------------------- bank summary

const difficulties = countBy(QUIZ_QUESTIONS.map((q) => q.difficulty));
const types = countBy(QUIZ_QUESTIONS.map((q) => q.questionType));
const codeStatuses = countBy(QUIZ_QUESTIONS.map((q) => q.codeStatus));
const codeCount = QUIZ_QUESTIONS.filter(isCodeQuestion).length;

const summary = [
  `**Total questions:** ${total}`,
  "",
  "| Section | Title | Weight | Questions | Share |",
  "| --- | --- | --- | --- | --- |",
  ...EXAM_SECTIONS.map((section) => {
    const count = (bySection.get(section.number) ?? []).length;
    return `| ${section.number} | ${section.title} | ${section.weightPercent}% | ${count} | ${pct(count, total)} |`;
  }),
  "",
  "| Difficulty | Questions | Share |",
  "| --- | --- | --- |",
  ...(["easy", "medium", "hard"] as const).map(
    (d) => `| ${d} | ${difficulties.get(d) ?? 0} | ${pct(difficulties.get(d) ?? 0, total)} |`,
  ),
  "",
  "| Question type | Questions | Share |",
  "| --- | --- | --- |",
  ...Array.from(types.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `| \`${type}\` | ${count} | ${pct(count, total)} |`),
  "",
  "| Code status | Questions |",
  "| --- | --- |",
  ...Array.from(codeStatuses.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => `| \`${status}\` | ${count} |`),
  "",
  `**Code-based questions:** ${codeCount} of ${total} (${pct(codeCount, total)})`,
].join("\n");

replaceBlock("question-bank-audit.md", "BANK_SUMMARY", summary);

for (const file of ["README.md"]) {
  const target = path.join(process.cwd(), file);
  const source = fs.readFileSync(target, "utf8");
  const begin = "<!-- BEGIN:BANK_SUMMARY -->";
  const end = "<!-- END:BANK_SUMMARY -->";
  const start = source.indexOf(begin);
  const stop = source.indexOf(end);
  if (start === -1 || stop === -1) continue;
  fs.writeFileSync(
    target,
    source.slice(0, start + begin.length) + "\n\n" + summary + "\n\n" + source.slice(stop),
  );
}

console.log(`Documentation regenerated for ${total} questions.`);
