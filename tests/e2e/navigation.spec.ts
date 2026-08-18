import { expect, test } from "@playwright/test";

const PAGES = ["/", "/topics", "/mock-exam", "/dashboard", "/resources"];

test.describe("site navigation", () => {
  for (const path of PAGES) {
    test(`loads ${path} without console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      // Hydration warnings surface as console errors in React.
      expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
    });
  }

  test("every exam section can be started from the topics page", async ({ page }) => {
    await page.goto("/topics");
    for (let section = 1; section <= 8; section++) {
      await expect(page.getByText(`Section ${section}:`).first()).toBeVisible();
    }
  });

  test("each section has questions and starts a session", async ({ page }) => {
    for (let section = 1; section <= 8; section++) {
      await page.goto(`/quiz?sections=${section}&count=10`);
      await expect(page.getByTestId("answer-choices")).toBeVisible();
      await expect(
        page.getByTestId("answer-choices").getByRole("radio"),
      ).toHaveCount(4);
    }
  });

  test("resources page links are well formed", async ({ page }) => {
    await page.goto("/resources");
    const links = page.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      expect(href!.startsWith("http") || href!.startsWith("/")).toBe(true);
    }
  });

  test("the home page reports the real bank size", async ({ page }) => {
    await page.goto("/");
    const stat = page.locator("p.font-mono").first();
    const value = Number((await stat.textContent())?.trim());
    expect(value).toBeGreaterThanOrEqual(320);
  });

  test("no horizontal overflow on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    for (const path of [...PAGES, "/quiz?sections=3&count=10"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `${path} overflows horizontally`).toBe(false);
    }
  });
});

test.describe("progress migration in the browser", () => {
  test("carries a v1 record forward without erasing it", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem(
        "qisquiz.studyProgress.v1",
        JSON.stringify({
          version: 1,
          answeredQuestionIds: ["s1-001", "s2-001"],
          missedQuestionIds: ["s2-001"],
          bookmarkedQuestionIds: ["s1-001"],
          questionHistory: {
            "s1-001": {
              questionId: "s1-001",
              attempts: 2,
              correct: 2,
              incorrect: 0,
              lastSelectedIndex: 3,
              lastAnsweredAt: "2026-01-01T00:00:00.000Z",
            },
          },
          mockExamAttempts: [],
          bestScore: 0,
          latestScore: 0,
        }),
      );
    });

    await page.goto("/dashboard");
    await expect(page.getByText(/migrated from an older storage format/)).toBeVisible();
    await expect(page.getByText("Unique questions attempted")).toBeVisible();

    const state = await page.evaluate(() => ({
      v1: window.localStorage.getItem("qisquiz.studyProgress.v1"),
      v2: JSON.parse(window.localStorage.getItem("qisquiz.studyProgress.v2")!),
    }));
    expect(state.v1).not.toBeNull();
    expect(state.v2.migratedFrom).toBe(1);
    expect(state.v2.bookmarkedQuestionIds).toEqual(["s1-001"]);
    expect(state.v2.questionHistory["s1-001"].lastSelectedChoiceId).toBe(
      "legacy-unknown",
    );
  });
});
