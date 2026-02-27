import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { createStore } from 'vuex'
import RaceSchedule from '@/components/RaceSchedule/RaceSchedule.vue'
import type { Horse, RoundSchedule } from '@/types'
import { ROUND_DISTANCES } from '@/constants/raceConfig'

function createMockHorses(count: number): Horse[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Horse ${i + 1}`,
    color: `#${String(i + 1).padStart(6, 'A')}`,
    condition: 50 + i,
  }))
}

function createMockSchedule(): RoundSchedule[] {
  return Array.from({ length: 6 }, (_, i) => ({
    round: i + 1,
    distance: ROUND_DISTANCES[i],
    horses: createMockHorses(10),
  }))
}

function createTestStore(options: { isGenerated?: boolean; rounds?: RoundSchedule[] } = {}) {
  const { isGenerated = false, rounds = [] } = options

  return createStore({
    modules: {
      schedule: {
        namespaced: true,
        state: () => ({ rounds, isGenerated }),
        getters: {
          allRounds: () => rounds,
          isGenerated: () => isGenerated,
        },
      },
      race: {
        namespaced: true,
        state: () => ({ status: 'IDLE', currentRound: 0, horsePositions: {} }),
        getters: { currentRound: () => 0 },
      },
    },
  })
}

describe('RaceSchedule', () => {
  const vuetify = createVuetify({ components })

  it('renders 6 tabs after schedule generation', () => {
    const rounds = createMockSchedule()
    const store = createTestStore({ isGenerated: true, rounds })

    const wrapper = mount(RaceSchedule, {
      global: { plugins: [store, vuetify] },
    })

    const tabs = wrapper.findAll('.v-tab')
    expect(tabs).toHaveLength(6)
  })

  it('each tab shows 10 horses', () => {
    const rounds = createMockSchedule()
    const store = createTestStore({ isGenerated: true, rounds })

    const wrapper = mount(RaceSchedule, {
      global: { plugins: [store, vuetify] },
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(10)
  })

  it('shows placeholder text when schedule is not generated', () => {
    const store = createTestStore({ isGenerated: false })

    const wrapper = mount(RaceSchedule, {
      global: { plugins: [store, vuetify] },
    })

    expect(wrapper.text()).toContain('Generate a program to see the schedule')
  })

  it('displays correct tab labels with ordinals and distances', () => {
    const rounds = createMockSchedule()
    const store = createTestStore({ isGenerated: true, rounds })

    const wrapper = mount(RaceSchedule, {
      global: { plugins: [store, vuetify] },
    })

    const tabs = wrapper.findAll('.v-tab')
    expect(tabs[0].text()).toContain('1st Lap - 1200m')
    expect(tabs[5].text()).toContain('6th Lap - 2200m')
  })
})
