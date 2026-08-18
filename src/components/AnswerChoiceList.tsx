"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ChoiceId, QuizChoice } from "@/types/quiz";

const LETTERS = "ABCD";

export type AnswerChoiceListProps = {
  /** Choices in display order. Position sets the visible letter only. */
  choices: QuizChoice[];
  selectedChoiceId: ChoiceId | null;
  /** When true, selection is frozen and correctness styling is applied. */
  revealed: boolean;
  /** Only consulted when `revealed` is true. */
  correctChoiceId?: ChoiceId;
  onSelect: (choiceId: ChoiceId) => void;
  /** Accessible name for the group. */
  label?: string;
  /** Enables A/B/C/D and 1/2/3/4 shortcuts while the group has focus. */
  enableShortcuts?: boolean;
};

/**
 * An accessible single-select answer group.
 *
 * Uses real radio semantics: `role="radiogroup"` with `role="radio"` options
 * and `aria-checked`, a roving tab index, arrow-key navigation, and
 * Enter/Space activation. Correctness is never expressed in the markup until
 * `revealed` is true, so nothing in the DOM can give the answer away.
 */
export function AnswerChoiceList({
  choices,
  selectedChoiceId,
  revealed,
  correctChoiceId,
  onSelect,
  label = "Answer choices",
  enableShortcuts = true,
}: AnswerChoiceListProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = useMemo(
    () => choices.findIndex((choice) => choice.id === selectedChoiceId),
    [choices, selectedChoiceId],
  );

  // Roving tab index: the checked option is the group's single tab stop, or the
  // first option when nothing is checked yet.
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const move = useCallback(
    (from: number, delta: number) => {
      if (revealed) return;
      const next = (from + delta + choices.length) % choices.length;
      refs.current[next]?.focus();
      onSelect(choices[next].id);
    },
    [choices, onSelect, revealed],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (revealed) return;
      switch (event.key) {
        case "ArrowDown":
        case "ArrowRight":
          event.preventDefault();
          move(index, 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          event.preventDefault();
          move(index, -1);
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          onSelect(choices[index].id);
          break;
        default:
          break;
      }
    },
    [choices, move, onSelect, revealed],
  );

  useEffect(() => {
    if (!enableShortcuts || revealed) return;

    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      const key = event.key.toUpperCase();
      let index = LETTERS.indexOf(key);
      if (index === -1 && key >= "1" && key <= "4") {
        index = Number.parseInt(key, 10) - 1;
      }
      if (index >= 0 && index < choices.length) {
        event.preventDefault();
        onSelect(choices[index].id);
        refs.current[index]?.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, enableShortcuts, onSelect, revealed]);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-col gap-3"
      data-testid="answer-choices"
    >
      {choices.map((choice, index) => {
        const selected = choice.id === selectedChoiceId;
        const isCorrect = revealed && choice.id === correctChoiceId;
        const isWrongPick = revealed && selected && choice.id !== correctChoiceId;

        let stateClass =
          "border-zinc-800 ring-zinc-700 hover:border-zinc-600 hover:ring-zinc-500";
        if (isCorrect) {
          stateClass = "border-emerald-900/50 bg-emerald-950/20 ring-emerald-500/80";
        } else if (isWrongPick) {
          stateClass = "border-rose-900/50 bg-rose-950/20 ring-rose-500/80";
        } else if (selected) {
          stateClass = "border-cyan-800/60 bg-cyan-950/20 ring-cyan-500/70";
        }

        return (
          <button
            key={choice.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={revealed || undefined}
            tabIndex={index === focusIndex ? 0 : -1}
            data-choice-id={choice.id}
            data-state={
              revealed
                ? isCorrect
                  ? "correct"
                  : isWrongPick
                    ? "incorrect"
                    : "neutral"
                : selected
                  ? "selected"
                  : "idle"
            }
            onClick={() => {
              if (!revealed) onSelect(choice.id);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-[44px] rounded-lg border px-4 py-3 text-left text-sm leading-relaxed text-zinc-200 ring-2 ring-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${stateClass}`}
          >
            <span className="font-mono text-xs text-zinc-500">
              {LETTERS[index] ?? index + 1}.
            </span>{" "}
            <span className="break-words">{choice.text}</span>
          </button>
        );
      })}
    </div>
  );
}
