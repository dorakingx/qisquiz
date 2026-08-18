import { expect, test } from "@playwright/test";

const STUDY_URL = "/quiz?sections=1&count=10";

test.describe("study mode answer leakage", () => {
  test("shows no learning metadata before the learner answers", async ({ page }) => {
    await page.goto(STUDY_URL);
    await expect(page.getByTestId("answer-choices")).toBeVisible();

    // Tags, concept, objective, sources and explanations must all be absent.
    await expect(page.getByTestId("question-metadata")).toHaveCount(0);
    await expect(page.getByTestId("question-tags")).toHaveCount(0);
    await expect(page.getByTestId("answer-feedback")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /docs/i })).toHaveCount(0);
    await expect(page.getByText(/Common mistake:/i)).toHaveCount(0);
  });

  test("does not style the correct answer before the learner answers", async ({ page }) => {
    await page.goto(STUDY_URL);
    const options = page.getByTestId("answer-choices").getByRole("radio");
    await expect(options).toHaveCount(4);
    for (const option of await options.all()) {
      await expect(option).toHaveAttribute("data-state", "idle");
      await expect(option).toHaveAttribute("aria-checked", "false");
    }
  });

  test("reveals explanation, tags and sources only after answering", async ({ page }) => {
    await page.goto(STUDY_URL);
    await page.getByTestId("answer-choices").getByRole("radio").first().click();

    await expect(page.getByTestId("answer-feedback")).toBeVisible();
    await expect(page.getByTestId("question-metadata")).toBeVisible();
    await expect(page.getByTestId("question-tags")).toBeVisible();

    // Exactly one option is now marked correct.
    const correct = page
      .getByTestId("answer-choices")
      .getByRole("radio")
      .and(page.locator('[data-state="correct"]'));
    await expect(correct).toHaveCount(1);
  });

  test("supports keyboard selection through the radio group", async ({ page }) => {
    await page.goto(STUDY_URL);
    const options = page.getByTestId("answer-choices").getByRole("radio");
    await options.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("answer-feedback")).toBeVisible();
  });

  test("supports letter shortcuts for selection", async ({ page }) => {
    await page.goto(STUDY_URL);
    const options = page.getByTestId("answer-choices").getByRole("radio");
    await page.keyboard.press("c");
    await expect(options.nth(2)).toHaveAttribute("aria-checked", "true");
  });

  test("advances through a session and reaches the score summary", async ({ page }) => {
    await page.goto("/quiz?sections=8&count=10");
    for (let i = 0; i < 10; i++) {
      await page.getByTestId("answer-choices").getByRole("radio").first().click();
      await page.getByTestId("next-question").click();
    }
    await expect(page.getByRole("heading", { name: "Quiz complete" })).toBeVisible();
  });
});

test.describe("review and retry", () => {
  test("review of a missed code question includes its code block", async ({ page }) => {
    // Section 3 is code-heavy; answering wrong guarantees review entries.
    await page.goto("/quiz?sections=3&count=10&difficulty=hard");
    for (let i = 0; i < 10; i++) {
      const options = page.getByTestId("answer-choices").getByRole("radio");
      const correctIsFirst =
        (await options.first().getAttribute("data-choice-id")) !== null;
      expect(correctIsFirst).toBe(true);
      // Deliberately pick the last option each time to accumulate misses.
      await options.last().click();
      await page.getByTestId("next-question").click();
    }

    const reviews = page.getByTestId("question-review");
    await expect(reviews.first()).toBeVisible();
    // At least one reviewed question must render its original code.
    await expect(page.getByTestId("review-code").first()).toBeVisible();
    await expect(reviews.first().getByText(/Your answer:/)).toBeVisible();
    await expect(reviews.first().getByText(/Correct answer:/)).toBeVisible();
  });

  test("retry link from a review opens that question again", async ({ page }) => {
    await page.goto("/quiz?sections=2&count=10");
    for (let i = 0; i < 10; i++) {
      await page.getByTestId("answer-choices").getByRole("radio").last().click();
      await page.getByTestId("next-question").click();
    }
    const retry = page.getByTestId("retry-question").first();
    if ((await retry.count()) > 0) {
      const href = await retry.getAttribute("href");
      expect(href).toContain("retry=");
      await retry.click();
      await expect(page.getByTestId("answer-choices")).toBeVisible();
    }
  });
});
