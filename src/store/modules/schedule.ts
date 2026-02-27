import type { Module } from 'vuex'
import type { Horse, RoundSchedule } from '@/types'
import type { RootState } from '@/store'
import { HORSES_PER_ROUND, TOTAL_ROUNDS, ROUND_DISTANCES } from '@/constants/raceConfig'
import { shuffleArray } from '@/utils/helpers'

export interface ScheduleState {
  rounds: RoundSchedule[]
  isGenerated: boolean
}

const schedule: Module<ScheduleState, RootState> = {
  namespaced: true,

  state: (): ScheduleState => ({
    rounds: [],
    isGenerated: false,
  }),

  mutations: {
    SET_SCHEDULE(state: ScheduleState, payload: RoundSchedule[]) {
      state.rounds = payload
      state.isGenerated = true
    },
    RESET_SCHEDULE(state: ScheduleState) {
      state.rounds = []
      state.isGenerated = false
    },
  },

  actions: {
    generateSchedule({ commit, rootGetters }) {
      const allHorses: Horse[] = rootGetters['horses/allHorses']
      const rounds: RoundSchedule[] = []

      for (let i = 0; i < TOTAL_ROUNDS; i++) {
        const shuffled = shuffleArray([...allHorses])
        const selected = shuffled.slice(0, HORSES_PER_ROUND)

        const distance = ROUND_DISTANCES[i]
        if (distance === undefined) continue

        rounds.push({
          round: i + 1,
          distance,
          horses: selected,
        })
      }

      commit('SET_SCHEDULE', rounds)
    },
  },

  getters: {
    allRounds(state: ScheduleState): RoundSchedule[] {
      return state.rounds
    },
    isGenerated(state: ScheduleState): boolean {
      return state.isGenerated
    },
  },
}

export default schedule
