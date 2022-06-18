export function plural(n: number, word: string): string {
  if (n === 1) {
    return `1 ${word}`;
  }
  return `${n} ${word}s`;
}
