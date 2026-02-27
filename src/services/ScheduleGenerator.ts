import type { Horse, RoundSchedule } from '@/types'
import { HORSES_PER_ROUND, TOTAL_ROUNDS, ROUND_DISTANCES } from '@/constants/raceConfig'
import { shuffleArray } from '@/utils/helpers'

/**
 * Generates a full race schedule consisting of multiple rounds.
 * Each round selects a random subset of horses using Fisher-Yates shuffle.
 * @param horses - The full list of available horses
 * @returns An array of RoundSchedule objects, one per round
 */
export function generateSchedule(horses: Horse[]): RoundSchedule[] {
  const rounds: RoundSchedule[] = []

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const shuffled = shuffleArray([...horses])
    const selected = shuffled.slice(0, HORSES_PER_ROUND)

    const distance = ROUND_DISTANCES[i]
    if (distance === undefined) continue

    rounds.push({
      round: i + 1,
      distance,
      horses: selected,
    })
  }

  return rounds
}
