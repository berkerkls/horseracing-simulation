import { describe, it, expect } from 'vitest'
import { generateSchedule } from '@/services/ScheduleGenerator'
import { TOTAL_ROUNDS, HORSES_PER_ROUND, ROUND_DISTANCES } from '@/constants/raceConfig'
import type { Horse } from '@/types'

function createMockHorses(count: number): Horse[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Horse ${i + 1}`,
    color: `#${String(i).padStart(6, '0')}`,
    condition: 50 + i,
  }))
}

describe('generateSchedule', () => {
  const horses = createMockHorses(20)

  it('should generate exactly 6 rounds', () => {
    const schedule = generateSchedule(horses)
    expect(schedule).toHaveLength(TOTAL_ROUNDS)
  })

  it('should assign 10 unique horses to each round', () => {
    const schedule = generateSchedule(horses)

    for (const round of schedule) {
      expect(round.horses).toHaveLength(HORSES_PER_ROUND)

      const ids = round.horses.map((h) => h.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(HORSES_PER_ROUND)
    }
  })

  it('should assign correct round numbers and distances', () => {
    const schedule = generateSchedule(horses)

    schedule.forEach((round, index) => {
      expect(round.round).toBe(index + 1)
      expect(round.distance).toBe(ROUND_DISTANCES[index])
    })
  })

  it('should only include horses from the original list', () => {
    const schedule = generateSchedule(horses)
    const originalIds = new Set(horses.map((h) => h.id))

    for (const round of schedule) {
      for (const horse of round.horses) {
        expect(originalIds.has(horse.id)).toBe(true)
      }
    }
  })
})
