/**
 * Generate delay pool in seconds.
 * @param min minimum delay in second
 * @param max maximum delay in second
 * @param interval interval between delay in second
 */
export function generateDelay(
  min: number,
  max: number,
  interval: number
): number[] {
  const pool: number[] = [];

  for (let i = min; i < max; i += interval) {
    pool.push(i * 1000);
  }

  return pool;
}

/**
 * Pick random element in an array.
 * @param pool array of number to be picked
 */
export function pickRandom(pool: number[]): number {
  return pool[Math.floor(Math.random() * pool.length)];
}


export function buildMap(source: any): Map<string, string> {
  const map = new Map();
  Object.keys(source).forEach(key => {
    map.set(key, source[key]);
  });
  return map;
}
