import type { QuizChoice, QuizQuestion } from "@/types/quiz";
import { getCorrectChoice } from "@/types/quiz";

export type Severity = "error" | "warning";

export type QualityIssue = {
  questionId: string;
  rule: string;
  severity: Severity;
  message: string;
};

export function issue(
  questionId: string,
  rule: string,
  severity: Severity,
  message: string,
): QualityIssue {
  return { questionId, rule, severity, message };
}

// ---------------------------------------------------------------- utilities

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`'"]/g, "")
    .replace(/[^a-z0-9|<>+\-.=_ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "for", "on", "is", "are",
  "what", "which", "does", "do", "that", "this", "with", "it", "its", "be",
  "as", "at", "by", "from", "not", "can", "when", "why", "how", "you", "your",
  "was", "were", "has", "have", "but", "so", "than", "then", "them", "they",
  "one", "two", "into", "each", "only", "will", "would", "should", "after",
  "before", "over", "under", "same", "other", "more", "most", "much", "many",
  "given", "using", "used", "use", "make", "makes", "made", "still", "also",
]);

export function contentWords(value: string): string[] {
  // Split on dots and equals as well as spaces, so an option written as
  // `options.default_shots = 8192` contributes the words an explanation is
  // likely to use when discussing it.
  return normalizeText(value)
    .split(/[ .=]+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

/**
 * Crude suffix stripping so an explanation that paraphrases a distractor
 * ("significance" for "significant") still counts as addressing it. This is a
 * deliberately loose match: the rule exists to catch explanations that ignore
 * the distractors entirely, not to police wording.
 */
export function stem(word: string): string {
  let result = word;
  for (const suffix of [
    "ations", "ation", "ically", "ingly", "ments", "ment", "nesses", "ness",
    "ities", "ility", "ances", "ance", "ences", "ence", "ives", "ive", "ions",
    "ion", "ers", "est", "ies", "ing", "ers", "ed", "ly", "al", "es", "s",
  ]) {
    if (result.length - suffix.length >= 4 && result.endsWith(suffix)) {
      result = result.slice(0, -suffix.length);
      break;
    }
  }
  return result;
}

export function stemmedWords(value: string): string[] {
  return contentWords(value).map(stem);
}

/**
 * Tokens that look like code identifiers: dotted paths, snake_case names, and
 * CamelCase names. Plain English words are deliberately excluded, so this can
 * be used to detect API-name leakage without flagging ordinary prose.
 */
export function codeLikeTokens(value: string): string[] {
  const tokens = new Set<string>();
  const pattern = /[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)+|[A-Za-z_][A-Za-z0-9]*_[A-Za-z0-9_]+|\b[a-z]+[A-Z][A-Za-z0-9]*\b|\b[A-Z][a-z0-9]+[A-Z][A-Za-z0-9]*\b/g;
  for (const match of value.matchAll(pattern)) {
    const token = match[0];
    if (token.length >= 3) tokens.add(token);
  }
  return Array.from(tokens);
}

export function trigrams(value: string): Set<string> {
  const normalized = normalizeText(value).replace(/ /g, " ");
  const result = new Set<string>();
  for (let i = 0; i + 3 <= normalized.length; i++) {
    result.add(normalized.slice(i, i + 3));
  }
  return result;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// ------------------------------------------------------------ answer leakage

/**
 * Stems that ask the learner to *name* an API element. For these, showing the
 * identifier anywhere in the visible material gives the answer away.
 */
const NAMING_STEM_PATTERNS = [
  /which (method|function|class|argument|parameter|option|module|submodule|property|attribute|keyword|statement|include|declaration|call|import|field|setting|constructor)/i,
  /what is the name of/i,
  /which line belongs/i,
  /belongs (in|on) the blank/i,
];

export function asksToNameAnIdentifier(question: QuizQuestion): boolean {
  return NAMING_STEM_PATTERNS.some((pattern) => pattern.test(question.question));
}

/** Tokens that appear in the correct choice but in none of the distractors. */
export function distinguishingTokens(question: QuizQuestion): string[] {
  const correct = getCorrectChoice(question);
  const distractorText = question.choices
    .filter((choice) => choice.id !== question.correctChoiceId)
    .map((choice) => choice.text)
    .join(" ");
  const distractorTokens = new Set(
    codeLikeTokens(distractorText).map((token) => token.toLowerCase()),
  );
  return codeLikeTokens(correct.text).filter(
    (token) => !distractorTokens.has(token.toLowerCase()),
  );
}

export function findAnswerLeaks(question: QuizQuestion): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const correct = getCorrectChoice(question);
  const normalizedCorrect = normalizeText(correct.text);
  const normalizedStem = normalizeText(question.question);
  const normalizedCode = question.code ? normalizeText(question.code) : "";

  if (
    normalizedCorrect.length >= 12 &&
    normalizedStem.includes(normalizedCorrect)
  ) {
    issues.push(
      issue(
        question.id,
        "ANSWER_IN_STEM",
        "error",
        "The full text of the correct choice appears in the question stem.",
      ),
    );
  }

  if (
    question.code &&
    normalizedCorrect.length >= 10 &&
    normalizedCode.includes(normalizedCorrect)
  ) {
    issues.push(
      issue(
        question.id,
        "EXACT_ANSWER_IN_CODE",
        "error",
        "The full text of the correct choice appears verbatim in the code block.",
      ),
    );
  }

  // A token that separates the correct answer from every distractor must not be
  // visible before the learner answers.
  const tokens = distinguishingTokens(question);
  const metadataText = [
    ...question.tags,
    question.concept,
    question.objective,
  ].join(" ");

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (question.code && question.code.toLowerCase().includes(lower)) {
      const rule = /^(from|import)\b/m.test(question.code)
        ? codeImportLines(question.code).some((line) =>
            line.toLowerCase().includes(lower),
          )
          ? "ANSWER_IDENTIFIER_IN_IMPORT"
          : "ANSWER_IDENTIFIER_IN_CODE"
        : "ANSWER_IDENTIFIER_IN_CODE";
      issues.push(
        issue(
          question.id,
          rule,
          "error",
          `Identifier "${token}" distinguishes the correct answer but is visible in the code block.`,
        ),
      );
    }
    if (metadataText.toLowerCase().includes(lower)) {
      issues.push(
        issue(
          question.id,
          "METADATA_LEAK",
          "error",
          `Identifier "${token}" distinguishes the correct answer but appears in tags, concept, or objective.`,
        ),
      );
    }
  }

  // Naming questions must not display the thing being named at all.
  if (asksToNameAnIdentifier(question) && question.code) {
    for (const token of codeLikeTokens(correct.text)) {
      if (
        question.code.toLowerCase().includes(token.toLowerCase()) &&
        !question.choices
          .filter((choice) => choice.id !== question.correctChoiceId)
          .some((choice) =>
            choice.text.toLowerCase().includes(token.toLowerCase()),
          )
      ) {
        issues.push(
          issue(
            question.id,
            "ANSWER_IDENTIFIER_IN_CODE",
            "error",
            `The stem asks the learner to name an element, and "${token}" from the correct answer is shown in the code.`,
          ),
        );
      }
    }
  }

  if (question.codeStatus === "partial-completion") {
    if (!question.code || !question.code.includes("_____")) {
      issues.push(
        issue(
          question.id,
          "MISSING_PLACEHOLDER",
          "error",
          'codeStatus is "partial-completion" but the code has no _____ blank.',
        ),
      );
    } else if (
      normalizedCorrect.length >= 6 &&
      normalizedCode.includes(normalizedCorrect)
    ) {
      issues.push(
        issue(
          question.id,
          "PLACEHOLDER_ANSWER_LEAK",
          "error",
          "The completion snippet already contains the completed answer.",
        ),
      );
    }
  } else if (question.code?.includes("_____")) {
    issues.push(
      issue(
        question.id,
        "UNEXPECTED_PLACEHOLDER",
        "error",
        'The code contains a _____ blank but codeStatus is not "partial-completion".',
      ),
    );
  }

  return issues;
}

function codeImportLines(code: string): string[] {
  return code
    .split("\n")
    .filter((line) => /^\s*(from|import)\b/.test(line));
}

// -------------------------------------------------------- distractor quality

/**
 * Patterns that have no place in a certification distractor: jokes, UI trivia,
 * and references to this application rather than to Qiskit.
 */
const NONSENSE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /favicon/i, label: "favicon" },
  { pattern: /\bhome page\b/i, label: "home page" },
  { pattern: /\bin cyan\b|\bcolor scheme\b|\bcolour scheme\b/i, label: "UI colors" },
  { pattern: /\.json\b/i, label: "arbitrary JSON filename" },
  { pattern: /\bterminal\b.*\bcolor/i, label: "terminal colors" },
  { pattern: /\bdecorative\b/i, label: "decorative styling" },
  { pattern: /\bbilling address\b/i, label: "billing address" },
  { pattern: /\balphabetic(al)? order of the backend/i, label: "backend name ordering" },
];

const ABSOLUTE_PATTERNS = /\b(all of the above|none of the above)\b/i;

export function findDistractorIssues(question: QuizQuestion): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const correct = getCorrectChoice(question);
  const distractors = question.choices.filter(
    (choice) => choice.id !== question.correctChoiceId,
  );

  const seen = new Map<string, QuizChoice>();
  for (const choice of question.choices) {
    const key = normalizeText(choice.text);
    if (key.length === 0) {
      issues.push(
        issue(question.id, "EMPTY_CHOICE", "error", `Choice ${choice.id} is empty.`),
      );
      continue;
    }
    const previous = seen.get(key);
    if (previous) {
      issues.push(
        issue(
          question.id,
          "DUPLICATE_CHOICE_TEXT",
          "error",
          `Choices ${previous.id} and ${choice.id} have the same text.`,
        ),
      );
    }
    seen.set(key, choice);
  }

  for (const choice of question.choices) {
    for (const { pattern, label } of NONSENSE_PATTERNS) {
      if (pattern.test(choice.text)) {
        issues.push(
          issue(
            question.id,
            "IMPLAUSIBLE_DISTRACTOR",
            "error",
            `Choice ${choice.id} references ${label}, which is not a realistic misconception.`,
          ),
        );
      }
    }
    if (ABSOLUTE_PATTERNS.test(choice.text)) {
      issues.push(
        issue(
          question.id,
          "ALL_OR_NONE_CHOICE",
          "error",
          `Choice ${choice.id} uses an "all/none of the above" form.`,
        ),
      );
    }
  }

  // Length cue: a correct answer that is far longer and more specific than
  // every distractor is guessable without knowledge.
  const distractorLengths = distractors.map((choice) => choice.text.length);
  const maxDistractor = Math.max(...distractorLengths);
  const meanDistractor =
    distractorLengths.reduce((sum, value) => sum + value, 0) /
    distractorLengths.length;
  if (
    correct.text.length > maxDistractor + 40 &&
    correct.text.length > meanDistractor * 1.8
  ) {
    issues.push(
      issue(
        question.id,
        "ANSWER_LENGTH_CUE",
        "warning",
        `Correct choice is ${correct.text.length} characters against a distractor mean of ${Math.round(meanDistractor)}.`,
      ),
    );
  }

  // Grammatical form: choices should agree on sentence-vs-fragment shape.
  const endsWithPeriod = question.choices.map((choice) =>
    /[.!?]$/.test(choice.text.trim()),
  );
  if (new Set(endsWithPeriod).size > 1) {
    issues.push(
      issue(
        question.id,
        "GRAMMATICAL_CUE",
        "warning",
        "Choices mix sentence and fragment punctuation.",
      ),
    );
  }

  // Lexical overlap between the stem and the correct choice, relative to the
  // distractors, is a classic unintended cue.
  const stemWords = new Set(contentWords(question.question));
  const overlap = (text: string) => {
    const words = contentWords(text);
    if (words.length === 0) return 0;
    return words.filter((word) => stemWords.has(word)).length / words.length;
  };
  const correctOverlap = overlap(correct.text);
  const bestDistractorOverlap = Math.max(
    ...distractors.map((choice) => overlap(choice.text)),
  );
  if (correctOverlap > 0.34 && correctOverlap > bestDistractorOverlap + 0.22) {
    issues.push(
      issue(
        question.id,
        "STEM_CHOICE_OVERLAP",
        "warning",
        `Correct choice shares ${Math.round(correctOverlap * 100)}% of its content words with the stem, versus ${Math.round(bestDistractorOverlap * 100)}% for the best distractor.`,
      ),
    );
  }

  return issues;
}

// ------------------------------------------------------- explanation quality

const MIN_EXPLANATION_LENGTH: Record<QuizQuestion["difficulty"], number> = {
  easy: 90,
  medium: 150,
  hard: 200,
};

export type DistractorCoverage = {
  addressed: number;
  /**
   * Distractors whose text carries no word or token that is unique to them
   * (typically purely numeric options such as "1 2" versus "2 1"). Text
   * matching cannot decide whether the explanation discusses these, so they do
   * not count against the requirement.
   */
  unaddressable: number;
};

/** How many distractors the explanation demonstrably addresses. */
export function distractorCoverage(question: QuizQuestion): DistractorCoverage {
  const explanationWords = new Set(stemmedWords(question.explanation));
  const stemWords = new Set(stemmedWords(question.question));
  const correctWords = new Set(stemmedWords(getCorrectChoice(question).text));

  const normalizedExplanation = normalizeText(question.explanation);

  let addressed = 0;
  let unaddressable = 0;
  for (const choice of question.choices) {
    if (choice.id === question.correctChoiceId) continue;

    // A short or numeric distractor has no distinctive content words, so fall
    // back to looking for its literal text in the explanation.
    const distinctive = stemmedWords(choice.text).filter(
      (word) => !stemWords.has(word) && !correctWords.has(word),
    );
    if (distinctive.length === 0) {
      // Numeric or very short choices ("001", "{'01': 1.0}") have no content
      // words at all. Fall back to asking whether the explanation mentions any
      // token that is unique to this choice.
      const explanationTokens = new Set(normalizedExplanation.split(" "));
      const correctTokens = new Set(
        normalizeText(getCorrectChoice(question).text).split(" "),
      );
      const stemTokens = new Set(normalizeText(question.question).split(" "));
      const unique = normalizeText(choice.text)
        .split(" ")
        .filter(
          (token) =>
            token.length > 0 && !correctTokens.has(token) && !stemTokens.has(token),
        );
      const literal = normalizeText(choice.text);
      if (
        unique.some((token) => explanationTokens.has(token)) ||
        (literal.length > 0 && normalizedExplanation.includes(literal))
      ) {
        addressed += 1;
      } else if (unique.length === 0) {
        unaddressable += 1;
      }
      continue;
    }

    // One distinctive word is enough: it appears in this distractor and in
    // neither the stem nor the correct answer, so the explanation is engaging
    // with that option rather than merely restating the key.
    if (distinctive.some((word) => explanationWords.has(word))) {
      addressed += 1;
    }
  }
  return { addressed, unaddressable };
}

export function findExplanationIssues(question: QuizQuestion): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const explanation = question.explanation.trim();

  if (explanation.length < MIN_EXPLANATION_LENGTH[question.difficulty]) {
    issues.push(
      issue(
        question.id,
        "WEAK_EXPLANATION",
        "error",
        `Explanation is ${explanation.length} characters; ${question.difficulty} questions need at least ${MIN_EXPLANATION_LENGTH[question.difficulty]}.`,
      ),
    );
  }

  if (normalizeText(explanation) === normalizeText(getCorrectChoice(question).text)) {
    issues.push(
      issue(
        question.id,
        "WEAK_EXPLANATION",
        "error",
        "Explanation merely repeats the correct choice.",
      ),
    );
  }

  const target =
    question.difficulty === "hard" ? 2 : question.difficulty === "medium" ? 1 : 0;
  if (target > 0) {
    const { addressed, unaddressable } = distractorCoverage(question);
    const required = Math.min(target, 3 - unaddressable);
    if (addressed < required) {
      issues.push(
        issue(
          question.id,
          "WEAK_EXPLANATION",
          "error",
          `Explanation addresses ${addressed} of the ${3 - unaddressable} distractor(s) it could name; ${question.difficulty} questions need at least ${required}.`,
        ),
      );
    }
  }

  return issues;
}

// ------------------------------------------------------------ near duplicates

export type DuplicatePair = {
  a: string;
  b: string;
  similarity: number;
};

/**
 * Compare questions by stem plus correct answer. Two items that differ only in
 * a variable name, a constant, or a qubit index score very high here.
 */
export function findDuplicates(
  questions: QuizQuestion[],
  errorThreshold = 0.78,
  warnThreshold = 0.68,
): { exact: DuplicatePair[]; strong: DuplicatePair[]; near: DuplicatePair[] } {
  const exact: DuplicatePair[] = [];
  const strong: DuplicatePair[] = [];
  const near: DuplicatePair[] = [];

  // Compare stem *and* code: several genuinely different items may share a
  // short generic stem such as "What does this program print?" while showing
  // completely different snippets.
  const prepared = questions.map((question) => ({
    id: question.id,
    normalized: normalizeText(`${question.question} ${question.code ?? ""}`),
    grams: trigrams(
      `${question.question} ${question.code ?? ""} ${getCorrectChoice(question).text}`,
    ),
  }));

  for (let i = 0; i < prepared.length; i++) {
    for (let j = i + 1; j < prepared.length; j++) {
      const a = prepared[i];
      const b = prepared[j];
      if (a.normalized === b.normalized) {
        exact.push({ a: a.id, b: b.id, similarity: 1 });
        continue;
      }
      const similarity = jaccard(a.grams, b.grams);
      if (similarity >= errorThreshold) {
        strong.push({ a: a.id, b: b.id, similarity });
      } else if (similarity >= warnThreshold) {
        near.push({ a: a.id, b: b.id, similarity });
      }
    }
  }

  return { exact, strong, near };
}
