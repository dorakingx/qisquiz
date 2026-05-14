"use client";

type ResultsSummaryProps = {
  score: number;
  total: number;
  onRetry: () => void;
};

export function ResultsSummary({ score, total, onRetry }: ResultsSummaryProps) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center shadow-xl shadow-black/20">
      <h2 className="text-xl font-semibold text-zinc-100">Quiz complete</h2>
      <p className="mt-2 text-sm text-zinc-400">
        IBM Certified Quantum Computation using Qiskit v2.X Developer — practice
      </p>
      <p className="mt-8 font-mono text-4xl font-bold tabular-nums text-cyan-400">
        {score}
        <span className="text-2xl font-normal text-zinc-500">/{total}</span>
      </p>
      <p className="mt-2 text-sm text-zinc-500">{pct}% correct</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-10 w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500 sm:w-auto sm:min-w-[200px]"
      >
        Retry quiz
      </button>
    </div>
  );
}
