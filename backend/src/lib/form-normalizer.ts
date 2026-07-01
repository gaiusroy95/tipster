/** Map backend form letters to frontend W/L/D display. */
export function normalizeFormLetters(form: string[]): ('W' | 'L' | 'D')[] {
  return form.map((letter) => {
    if (letter === 'W') return 'W';
    if (letter === 'L') return 'L';
    return 'D';
  });
}
