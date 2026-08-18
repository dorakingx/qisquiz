/** Emit every question code snippet as JSON for the Python verifier. */
import fs from "node:fs";
import { QUIZ_QUESTIONS } from "../src/data/questions";

const snippets = QUIZ_QUESTIONS.filter((q) => q.code).map((q) => ({
  id: q.id,
  codeStatus: q.codeStatus,
  language: q.codeLanguage ?? "python",
  code: q.code,
}));

const target = process.argv[2] ?? "snippets.json";
fs.writeFileSync(target, JSON.stringify(snippets, null, 2));
console.log(`Wrote ${snippets.length} snippets to ${target}`);
