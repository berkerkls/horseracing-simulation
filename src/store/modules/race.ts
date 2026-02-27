import type { ActionContext, Module } from 'vuex'
import type { RootState } from '@/store'
import type { Horse, RoundSchedule, FinishResult } from '@/types'
import { RaceStatus } from '@/types'
import { RaceEngine } from '@/services/RaceEngine'
import { TOTAL_ROUNDS } from '@/constants/raceConfig'

export interface RaceState {
  status: RaceStatus
  currentRound: number
  horsePositions: Record<number, number>
}

let engineInstance: RaceEngine | null = null

const AUTO_ADVANCE_DELAY_MS = 3000
let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null

const race: Module<RaceState, RootState> = {
  namespaced: true,

  state: (): RaceState => ({
    status: RaceStatus.IDLE,
    currentRound: 0,
    horsePositions: {},
  }),

  mutations: {
    SET_STATUS(state: RaceState, payload: RaceStatus) {
      state.status = payload
    },
    SET_CURRENT_ROUND(state: RaceState, payload: number) {
      state.currentRound = payload
    },
    UPDATE_POSITIONS(state: RaceState, payload: Record<number, number>) {
      state.horsePositions = payload
    },
    RESET_RACE(state: RaceState) {
      if (engineInstance) {
        engineInstance.reset()
        engineInstance = null
      }
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer)
        autoAdvanceTimer = null
      }
      state.status = RaceStatus.IDLE
      state.currentRound = 0
      state.horsePositions = {}
    },
  },

  actions: {
    startRace({ commit, state, rootGetters, dispatch }: ActionContext<RaceState, RootState>) {
      const rounds: RoundSchedule[] = rootGetters['schedule/allRounds']
      const roundIndex = state.currentRound === 0 ? 0 : state.currentRound - 1
      const currentSchedule = rounds[roundIndex]

      if (!currentSchedule) return

      // Set round if starting fresh
      if (state.currentRound === 0) {
        commit('SET_CURRENT_ROUND', 1)
      }

      // Clean up any existing engine
      if (engineInstance) {
        engineInstance.reset()
      }

      // Reset positions for new round
      commit('UPDATE_POSITIONS', {})

      const engine = new RaceEngine(currentSchedule.horses, currentSchedule.distance)

      engine.onUpdate((positions) => {
        commit('UPDATE_POSITIONS', positions)
      })

      engine.onFinish((results) => {
        const round = state.currentRound
        const schedule = rounds[round - 1]
        if (!schedule) return
        const horsesMap = new Map<number, Horse>(
          schedule.horses.map((h) => [h.id, h]),
        )

        const finishResults: FinishResult[] = results.map((r) => ({
          horse: horsesMap.get(r.horseId)!,
          finishTime: r.finishTime,
          position: r.position,
        }))

        commit('SET_STATUS', RaceStatus.ROUND_COMPLETE)
        commit(
          'results/ADD_ROUND_RESULT',
          { round, distance: schedule.distance, results: finishResults },
          { root: true },
        )

        // Auto-advance after delay
        autoAdvanceTimer = setTimeout(() => {
          autoAdvanceTimer = null
          dispatch('nextRound')
        }, AUTO_ADVANCE_DELAY_MS)
      })

      engineInstance = engine
      commit('SET_STATUS', RaceStatus.RACING)
      engine.start()
    },

    pauseRace({ commit }: ActionContext<RaceState, RootState>) {
      if (engineInstance) {
        engineInstance.pause()
      }
      commit('SET_STATUS', RaceStatus.PAUSED)
    },

    resumeRace({ commit }: ActionContext<RaceState, RootState>) {
      if (engineInstance) {
        engineInstance.resume()
      }
      commit('SET_STATUS', RaceStatus.RACING)
    },

    nextRound({ commit, state, dispatch }: ActionContext<RaceState, RootState>) {
      const next = state.currentRound + 1

      if (next > TOTAL_ROUNDS) {
        commit('SET_STATUS', RaceStatus.FINISHED)
        engineInstance = null
        return
      }

      commit('SET_CURRENT_ROUND', next)
      commit('SET_STATUS', RaceStatus.RACING)
      dispatch('startRace')
    },
  },

  getters: {
    status(state: RaceState): RaceStatus {
      return state.status
    },
    currentRound(state: RaceState): number {
      return state.currentRound
    },
    horsePositions(state: RaceState): Record<number, number> {
      return state.horsePositions
    },
  },
}

export default race
