import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const questionFile = path.join(root, "src/data/questions.ts");
const source = fs.readFileSync(questionFile, "utf8");

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

const sandbox = {
  exports: {},
  module: { exports: {} },
  process: { env: { NODE_ENV: "test" } },
  console,
  require(specifier) {
    throw new Error(`Unexpected runtime require in question data: ${specifier}`);
  },
};
sandbox.exports = sandbox.module.exports;

vm.runInNewContext(compiled, sandbox, {
  filename: questionFile,
});

const questions = sandbox.module.exports.QUIZ_QUESTIONS;
const errors = [];

function fail(questionId, message) {
  errors.push(`${questionId}: ${message}`);
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

if (!Array.isArray(questions)) {
  errors.push("QUIZ_QUESTIONS must be an array.");
} else {
  const ids = new Set();

  for (const question of questions) {
    const id = question?.id ?? "<missing id>";

    if (!question.id || typeof question.id !== "string") {
      fail(id, "id must be a non-empty string.");
    } else if (ids.has(question.id)) {
      fail(id, "id must be unique.");
    } else {
      ids.add(question.id);
    }

    if (!Number.isInteger(question.section) || question.section < 1 || question.section > 8) {
      fail(id, "section must be an integer from 1 to 8.");
    }
    if (!Array.isArray(question.choices) || question.choices.length !== 4) {
      fail(id, "must have exactly 4 choices.");
    }
    if (
      !Number.isInteger(question.correctAnswerIndex) ||
      question.correctAnswerIndex < 0 ||
      question.correctAnswerIndex > 3
    ) {
      fail(id, "correctAnswerIndex must be between 0 and 3.");
    }
    if (!question.explanation || typeof question.explanation !== "string") {
      fail(id, "explanation must be non-empty.");
    }
    if (!Array.isArray(question.tags) || question.tags.length === 0) {
      fail(id, "must have at least one tag.");
    }
    if (question.relatedDocsUrl && !isValidUrl(question.relatedDocsUrl)) {
      fail(id, "relatedDocsUrl must be a valid URL when present.");
    }
  }
}

if (errors.length > 0) {
  console.error(`Question validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Question validation passed for ${questions.length} questions.`);
}
