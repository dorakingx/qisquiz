"use client";

type FeedbackPanelProps = {
  isCorrect: boolean;
  explanation: string;
};

export function FeedbackPanel({ isCorrect, explanation }: FeedbackPanelProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-6 rounded-lg border px-4 py-3 ${
        isCorrect
          ? "border-emerald-500/40 bg-emerald-950/30"
          : "border-rose-500/40 bg-rose-950/30"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          isCorrect ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {isCorrect ? "Correct" : "Incorrect"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{explanation}</p>
    </div>
  );
}
