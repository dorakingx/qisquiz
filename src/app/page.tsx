import Link from "next/link";
import { QUIZ_QUESTIONS } from "@/data/questions";

const codeQuestionCount = QUIZ_QUESTIONS.filter((q) => q.code).length;
const hardQuestionCount = QUIZ_QUESTIONS.filter(
  (q) => q.difficulty === "hard",
).length;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">
          IBM Qiskit v2.X · Exam C1000-179
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Qisquiz
        </h1>
        <p className="mt-3 text-lg text-cyan-400/90">
          Master Qiskit, one quiz at a time.
        </p>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
          Qisquiz is a certification study app for IBM Exam C1000-179:
          Fundamentals of Quantum Computing Using Qiskit v2.X Developer.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/topics"
          className="rounded-lg bg-cyan-600 px-6 py-3 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
        >
          Section practice
        </Link>
        <Link
          href="/quiz?mode=mock"
          className="rounded-lg border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Full mock exam
        </Link>
        <Link
          href="/resources"
          className="rounded-lg border border-zinc-700 px-6 py-3 text-center text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800"
        >
          Resources
        </Link>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="font-mono text-2xl font-semibold text-zinc-100">
            {QUIZ_QUESTIONS.length}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Original questions</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="font-mono text-2xl font-semibold text-zinc-100">
            {codeQuestionCount}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Code-based questions</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <p className="font-mono text-2xl font-semibold text-zinc-100">
            {hardQuestionCount}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Hard questions</p>
        </div>
      </div>

      <div className="mt-16 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-4 text-sm leading-relaxed text-zinc-500">
        Qisquiz is an independent study tool and is not affiliated with IBM or
        Qiskit. Questions are original and created for learning purposes only.
      </div>
    </div>
  );
}
