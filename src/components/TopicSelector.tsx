"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QUIZ_QUESTIONS } from "@/data/questions";
import { buildQuizUrl, countQuestionsBySection } from "@/lib/quiz";
import type { Difficulty, StudyConfig } from "@/types/quiz";
import { EXAM_SECTIONS } from "@/types/quiz";

const sectionCounts = countQuestionsBySection(QUIZ_QUESTIONS);

export function TopicSelector() {
  const router = useRouter();
  const [section, setSection] = useState<number | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [order, setOrder] = useState<StudyConfig["order"]>("sequential");

  const previewCount = QUIZ_QUESTIONS.filter((q) => {
    if (section !== "all" && q.section !== section) return false;
    if (difficulty !== "all" && q.difficulty !== difficulty) return false;
    return true;
  }).length;

  function handleStart() {
    const config: StudyConfig = { section, difficulty, order };
    router.push(buildQuizUrl(config));
  }

  return (
    <div className="space-y-10">
      <section className="card">
        <h2 className="text-lg font-semibold text-zinc-100">Study mode</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Filter by section and difficulty, then start a session.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Section
            </span>
            <select
              value={section === "all" ? "all" : String(section)}
              onChange={(e) => {
                const v = e.target.value;
                setSection(v === "all" ? "all" : Number.parseInt(v, 10));
              }}
              className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100"
            >
              <option value="all">All sections</option>
              {EXAM_SECTIONS.map((s) => (
                <option key={s.number} value={String(s.number)}>
                  Section {s.number}: {s.title}
                </option>
              ))}
            </select>
          </label>

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
          <span className="font-mono text-accent">{previewCount}</span> question
          {previewCount === 1 ? "" : "s"} in this session
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
                setSection(s.number);
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
