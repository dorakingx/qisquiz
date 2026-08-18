import { expect, test } from "@playwright/test";
import { QUIZ_QUESTIONS } from "../../src/data/questions";

const SESSION_KEY = "qisquiz.mockExamSession.v2";

test.describe("mock exam", () => {
  // Each test gets a fresh browser context, so local storage starts empty.
  // An init script must not be used to clear it: init scripts re-run on every
  // navigation, which would wipe the very state a reload is meant to restore.

  test("hides section, difficulty, tags and feedback during the exam", async ({ page }) => {
    await page.goto("/mock-exam");
    await page.getByTestId("start-exam").click();
    await expect(page.getByTestId("answer-choices")).toBeVisible();

    // No orientation labels that could narrow the answer.
    await expect(page.locator(".badge-section")).toHaveCount(0);
    await expect(page.locator(".badge-easy, .badge-medium, .badge-hard")).toHaveCount(0);
    await expect(page.getByTestId("question-tags")).toHaveCount(0);
    await expect(page.getByTestId("question-metadata")).toHaveCount(0);
    await expect(page.getByTestId("answer-feedback")).toHaveCount(0);

    // Selecting an answer must not reveal correctness.
    await page.getByTestId("answer-choices").getByRole("radio").first().click();
    await expect(page.locator('[data-state="correct"]')).toHaveCount(0);
    await expect(page.locator('[data-state="incorrect"]')).toHaveCount(0);
    await expect(page.getByTestId("answer-feedback")).toHaveCount(0);
  });

  test("survives a refresh with the same deadline and answers", async ({ page }) => {
    await page.goto("/mock-exam");
    await page.getByTestId("start-exam").click();
    await page.getByTestId("answer-choices").getByRole("radio").nth(1).click();

    // The click and the storage write are separate ticks, so poll rather than
    // reading storage once.
    await expect
      .poll(async () =>
        page.evaluate(
          (key) =>
            Object.keys(JSON.parse(window.localStorage.getItem(key)!).answers).length,
          SESSION_KEY,
        ),
      )
      .toBe(1);

    const stored = await page.evaluate(
      (key) => JSON.parse(window.localStorage.getItem(key)!),
      SESSION_KEY,
    );
    expect(stored.questionIds).toHaveLength(68);

    await page.reload();
    await expect(page.getByTestId("resume-prompt")).toBeVisible();
    await page.getByTestId("resume-exam").click();

    const restored = await page.evaluate(
      (key) => JSON.parse(window.localStorage.getItem(key)!),
      SESSION_KEY,
    );
    // The deadline is absolute: a reload cannot extend it.
    expect(restored.deadlineMs).toBe(stored.deadlineMs);
    expect(restored.answers).toEqual(stored.answers);
    expect(restored.choiceOrder).toEqual(stored.choiceOrder);
  });

  test("warns about unanswered questions before submitting", async ({ page }) => {
    await page.goto("/mock-exam");
    await page.getByTestId("start-exam").click();
    await page.getByTestId("answer-choices").getByRole("radio").first().click();
    await page.getByTestId("submit-exam").click();

    const dialog = page.getByTestId("submit-confirm");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("67 questions are unanswered");
    await dialog.getByRole("button", { name: "Keep working" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("classifies 47 of 68 as a pass and 46 as a fail", async ({ page }) => {
    for (const [correctCount, shouldPass] of [
      [47, true],
      [46, false],
    ] as const) {
      await page.goto("/mock-exam");
      await page.getByTestId("start-exam").click();

      // Read the stored session, then write in exactly `correctCount` correct
      // answers using the bank's own keys, which the browser never sees.
      const questionIds: string[] = await page.evaluate(
        (key) => JSON.parse(window.localStorage.getItem(key)!).questionIds,
        SESSION_KEY,
      );
      const answers: Record<string, string> = {};
      questionIds.forEach((id, index) => {
        const question = QUIZ_QUESTIONS.find((q) => q.id === id)!;
        const wrong = question.choices.find(
          (choice) => choice.id !== question.correctChoiceId,
        )!;
        answers[id] = index < correctCount ? question.correctChoiceId : wrong.id;
      });

      await page.evaluate(
        ([key, value]) => {
          const state = JSON.parse(window.localStorage.getItem(key as string)!);
          state.answers = value;
          window.localStorage.setItem(key as string, JSON.stringify(state));
        },
        [SESSION_KEY, answers] as const,
      );

      await page.reload();
      await page.getByTestId("resume-exam").click();
      await page.getByTestId("submit-exam").click();
      await page.getByTestId("confirm-submit").click();

      const summary = page.getByTestId("mock-result-summary");
      await expect(summary).toBeVisible();
      await expect(summary).toHaveAttribute("data-score", String(correctCount));
      await expect(summary).toHaveAttribute("data-passed", String(shouldPass));
      await expect(
        page.getByRole("heading", { name: `Score: ${correctCount} / 68` }),
      ).toBeVisible();
      await expect(summary).toContainText(
        shouldPass ? "At or above the pass mark" : "Below the pass mark",
      );

      await page.evaluate(() => window.localStorage.clear());
    }
  });

  test("shows full review with code after submission", async ({ page }) => {
    await page.goto("/mock-exam");
    await page.getByTestId("start-exam").click();
    await page.getByTestId("submit-exam").click();
    await page.getByTestId("confirm-submit").click();

    await expect(page.getByTestId("mock-result-summary")).toBeVisible();
    const reviews = page.getByTestId("question-review");
    await expect(reviews.first()).toBeVisible();
    // With nothing answered, every question is reviewed, so code questions
    // must render their original snippet.
    await expect(page.getByTestId("review-code").first()).toBeVisible();
    await expect(page.getByTestId("question-metadata").first()).toBeVisible();
    await expect(reviews.first().getByText("Your answer: Unanswered")).toBeVisible();
  });

  test("records the attempt on the dashboard as a raw score", async ({ page }) => {
    await page.goto("/mock-exam");
    await page.getByTestId("start-exam").click();
    await page.getByTestId("submit-exam").click();
    await page.getByTestId("confirm-submit").click();
    await expect(page.getByTestId("mock-result-summary")).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText("Latest mock exam")).toBeVisible();
    await expect(page.getByText("0 / 68")).toBeVisible();
    await expect(page.getByText(/Below the pass mark/)).toBeVisible();
  });
});
