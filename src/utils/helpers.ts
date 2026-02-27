/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array - The array to shuffle
 * @returns The shuffled array (same reference)
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i)
    const temp = array[i]!
    array[i] = array[j]!
    array[j] = temp
  }
  return array
}

/**
 * Returns a random integer between min and max (inclusive).
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A random integer in the range [min, max]
 */
export function getRandomInt(min: number, max: number): number {
  const lower = Math.ceil(min)
  const upper = Math.floor(max)
  return Math.floor(Math.random() * (upper - lower + 1)) + lower
}
