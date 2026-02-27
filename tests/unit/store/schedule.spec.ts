import { describe, it, expect, beforeEach } from 'vitest'
import { createStore, type Store } from 'vuex'
import schedule, { type ScheduleState } from '@/store/modules/schedule'
import horses from '@/store/modules/horses'
import type { RootState } from '@/store'
import { TOTAL_ROUNDS, HORSES_PER_ROUND } from '@/constants/raceConfig'

function createTestStore(): Store<RootState> {
  return createStore<RootState>({
    modules: {
      horses: { ...horses, namespaced: true },
      schedule: { ...schedule, namespaced: true },
    },
  } as never)
}

describe('schedule store module', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createTestStore()
    store.dispatch('horses/loadHorses')
  })

  it('should start with empty schedule and isGenerated false', () => {
    const state = store.state.schedule as ScheduleState
    expect(state.rounds).toEqual([])
    expect(state.isGenerated).toBe(false)
  })

  it('should generate 6 rounds with 10 horses each', async () => {
    await store.dispatch('schedule/generateSchedule')

    const state = store.state.schedule as ScheduleState
    expect(state.rounds).toHaveLength(TOTAL_ROUNDS)
    expect(state.isGenerated).toBe(true)

    for (const round of state.rounds) {
      expect(round.horses).toHaveLength(HORSES_PER_ROUND)
    }
  })

  it('should reset schedule to initial state', async () => {
    await store.dispatch('schedule/generateSchedule')
    store.commit('schedule/RESET_SCHEDULE')

    const state = store.state.schedule as ScheduleState
    expect(state.rounds).toEqual([])
    expect(state.isGenerated).toBe(false)
  })
})
