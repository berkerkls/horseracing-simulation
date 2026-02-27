import type { Module } from 'vuex'
import type { RoundResult } from '@/types'
import type { RootState } from '@/store'

export interface ResultsState {
  roundResults: RoundResult[]
}

const results: Module<ResultsState, RootState> = {
  namespaced: true,

  state: (): ResultsState => ({
    roundResults: [],
  }),

  mutations: {
    ADD_ROUND_RESULT(state: ResultsState, payload: RoundResult) {
      state.roundResults.push(payload)
    },
    CLEAR_RESULTS(state: ResultsState) {
      state.roundResults = []
    },
  },

  getters: {
    allResults(state: ResultsState): RoundResult[] {
      return state.roundResults
    },
    getResultByRound:
      (state: ResultsState) =>
      (round: number): RoundResult | undefined => {
        return state.roundResults.find((r) => r.round === round)
      },
  },
}

export default results
