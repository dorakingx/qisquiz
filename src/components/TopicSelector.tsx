"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import { buildQuizUrl, countQuestionsBySection } from "@/lib/quiz";
import { loadProgress } from "@/lib/progress";
import type { Difficulty, StudyConfig } from "@/types/quiz";
import { EXAM_SECTIONS } from "@/types/quiz";

const sectionCounts = countQuestionsBySection(QUIZ_QUESTIONS);

export function TopicSelector() {
  const router = useRouter();
  const [sections, setSections] = useState<number[] | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [count, setCount] = useState<StudyConfig["count"]>(20);
  const [order, setOrder] = useState<StudyConfig["order"]>("sequential");

  useEffect(() => {
    const progress = loadProgress();
    setSections(
      progress.lastSelectedSection === "all"
        ? "all"
        : [progress.lastSelectedSection],
    );
    setDifficulty(progress.lastSelectedDifficulty);
  }, []);

  const matchingCount = QUIZ_QUESTIONS.filter((q) => {
    if (sections !== "all" && !sections.includes(q.section)) return false;
    if (difficulty !== "all" && q.difficulty !== difficulty) return false;
    return true;
  }).length;
  const previewCount =
    count === "all" ? matchingCount : Math.min(matchingCount, count);

  const sectionSet = useMemo(
    () => new Set(sections === "all" ? EXAM_SECTIONS.map((s) => s.number) : sections),
    [sections],
  );

  function toggleSection(sectionNumber: number) {
    const current =
      sections === "all" ? EXAM_SECTIONS.map((s) => s.number) : sections;
    const next = current.includes(sectionNumber)
      ? current.filter((value) => value !== sectionNumber)
      : [...current, sectionNumber].sort((a, b) => a - b);
    setSections(next.length === EXAM_SECTIONS.length ? "all" : next);
  }

  function handleStart() {
    const config: StudyConfig = {
      mode: "section",
      sections,
      difficulty,
      count,
      order,
    };
    router.push(buildQuizUrl(config));
  }

  function handleMockExam() {
    router.push("/mock-exam");
  }

  return (
    <div className="space-y-10">
      <section className="card">
        <h2 className="text-lg font-semibold text-zinc-100">
          Section practice
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Select one or more exam sections, then shape the session.
        </p>

        <fieldset className="mt-6">
          <legend className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Sections
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {EXAM_SECTIONS.map((s) => (
              <label
                key={s.number}
                className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={sectionSet.has(s.number)}
                  onChange={() => toggleSection(s.number)}
                  className="mt-0.5 h-4 w-4 accent-cyan-500"
                />
                <span>
                  <span className="block font-medium text-zinc-100">
                    Section {s.number}: {s.title}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {sectionCounts[s.number] ?? 0} questions
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Difficulty
            </span>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as Difficulty | "all")
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
            >
              <option value="all">All levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Question count
            </span>
            <select
              value={String(count)}
              onChange={(e) => {
                const value = e.target.value;
                setCount(
                  value === "all"
                    ? "all"
                    : (Number.parseInt(value, 10) as StudyConfig["count"]),
                );
              }}
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
            >
              <option value="10">10 questions</option>
              <option value="20">20 questions</option>
              <option value="40">40 questions</option>
              <option value="all">All matching</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Order
            </span>
            <select
              value={order}
              onChange={(e) =>
                setOrder(e.target.value as StudyConfig["order"])
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
            >
              <option value="sequential">Sequential</option>
              <option value="random">Randomized</option>
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          <span className="font-mono text-accent">{previewCount}</span>{" "}
          question{previewCount === 1 ? "" : "s"} in this session
          {matchingCount !== previewCount ? (
            <span> from {matchingCount} matching questions</span>
          ) : null}
        </p>

        <button
          type="button"
          onClick={handleStart}
          disabled={previewCount === 0}
          className="mt-6 w-full rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Start study session
        </button>
      </section>

      <section className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Full mock exam
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              68 randomized questions across all eight sections, matching the
              official exam length.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMockExam}
            className="rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white"
          >
            Start mock exam
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Exam sections (C1000-179)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {EXAM_SECTIONS.map((s) => (
            <button
              key={s.number}
              type="button"
              onClick={() => {
                setSections([s.number]);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="card text-left transition-colors hover:border-zinc-600"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="badge-section">Section {s.number}</span>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
                  {sectionCounts[s.number] ?? 0} Qs
                </span>
              </div>
              <h3 className="mt-3 font-medium text-zinc-100">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                {s.description}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
