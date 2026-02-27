import { createStore } from 'vuex'
import horses, { type HorsesState } from './modules/horses'
import schedule, { type ScheduleState } from './modules/schedule'
import race, { type RaceState } from './modules/race'
import results, { type ResultsState } from './modules/results'

export interface RootState {
  horses: HorsesState
  schedule: ScheduleState
  race: RaceState
  results: ResultsState
}

const store = createStore<RootState>({
  modules: {
    horses,
    schedule,
    race,
    results,
  },
})

export default store
