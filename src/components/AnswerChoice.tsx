"use client";

type AnswerChoiceProps = {
  index: number;
  label: string;
  selected: boolean;
  locked: boolean;
  isCorrect: boolean;
  onSelect: () => void;
};

const LETTERS = "ABCDEF";

export function AnswerChoice({
  index,
  label,
  selected,
  locked,
  isCorrect,
  onSelect,
}: AnswerChoiceProps) {
  let stateClass =
    "ring-zinc-700 hover:border-zinc-600 hover:ring-zinc-500 active:bg-zinc-800/80";

  if (locked && selected && isCorrect) {
    stateClass = "ring-emerald-500/80 bg-emerald-950/20 border-emerald-900/50";
  } else if (locked && selected && !isCorrect) {
    stateClass = "ring-rose-500/80 bg-rose-950/20 border-rose-900/50";
  } else if (locked && !selected && isCorrect) {
    stateClass = "ring-emerald-600/50 bg-emerald-950/10 border-emerald-900/30";
  } else if (selected) {
    stateClass = "ring-cyan-500/70 bg-cyan-950/20 border-cyan-800/60";
  }

  return (
    <button
      type="button"
      disabled={locked}
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-h-[44px] rounded-lg border border-zinc-800 px-4 py-3 text-left text-sm leading-relaxed text-zinc-200 ring-2 ring-transparent transition-colors disabled:cursor-default ${stateClass}`}
    >
      <span className="font-mono text-xs text-zinc-500">
        {LETTERS[index] ?? index + 1}.
      </span>{" "}
      {label}
    </button>
  );
}
