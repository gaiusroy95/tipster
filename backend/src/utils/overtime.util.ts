export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getMinMaturity(): number {
  return Math.floor(Date.now() / 1000);
}
