import type { Module } from 'vuex'
import type { Horse } from '@/types'
import type { RootState } from '@/store'
import horsesData from '@/assets/data/horses.json'

export interface HorsesState {
  list: Horse[]
}

const horses: Module<HorsesState, RootState> = {
  namespaced: true,

  state: (): HorsesState => ({
    list: [],
  }),

  mutations: {
    SET_HORSES(state: HorsesState, payload: Horse[]) {
      state.list = payload
    },
  },

  actions: {
    loadHorses({ commit }) {
      const parsed: Horse[] = horsesData.map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        condition: h.condition,
      }))
      commit('SET_HORSES', parsed)
    },
  },

  getters: {
    allHorses(state: HorsesState): Horse[] {
      return state.list
    },
    getHorseById:
      (state: HorsesState) =>
      (id: number): Horse | undefined => {
        return state.list.find((h) => h.id === id)
      },
  },
}

export default horses
