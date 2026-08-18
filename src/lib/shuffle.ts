/**
 * Deterministic, seedable shuffling.
 *
 * Mock exams persist a seed so a refresh restores the exact same choice order.
 * Study mode uses a random seed each time.
 */

/** 32-bit string hash (FNV-1a), used to derive a seed from an id. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Small, fast, deterministic PRNG (mulberry32). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle driven by the supplied random source. */
export function shuffleWith<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Shuffle deterministically from a numeric seed. */
export function shuffleSeeded<T>(items: readonly T[], seed: number): T[] {
  return shuffleWith(items, createRandom(seed));
}

/**
 * Shuffle deterministically from a seed combined with a stable key, so every
 * question in one exam attempt gets its own independent but reproducible order.
 */
export function shuffleForKey<T>(
  items: readonly T[],
  seed: number,
  key: string,
): T[] {
  return shuffleSeeded(items, (seed ^ hashString(key)) >>> 0);
}

/** Shuffle using the global random source. */
export function shuffleRandom<T>(items: readonly T[]): T[] {
  return shuffleWith(items, Math.random);
}

/** A seed suitable for storing with a saved attempt. */
export function createSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
