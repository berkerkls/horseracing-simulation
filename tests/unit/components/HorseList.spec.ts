import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { createStore } from 'vuex'
import HorseList from '@/components/HorseList/HorseList.vue'
import type { Horse } from '@/types'

function createMockHorses(count: number): Horse[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Horse ${i + 1}`,
    color: `#${String(i + 1).padStart(6, 'A')}`,
    condition: 50 + i,
  }))
}

function createTestStore(horseList: Horse[] = []) {
  return createStore({
    modules: {
      horses: {
        namespaced: true,
        state: () => ({ list: horseList }),
        actions: { loadHorses: () => {} },
        getters: { allHorses: (state: { list: Horse[] }) => state.list },
      },
    },
  })
}

describe('HorseList', () => {
  const vuetify = createVuetify({ components })

  it('renders 20 rows when store has horses loaded', () => {
    const horses = createMockHorses(20)
    const store = createTestStore(horses)

    const wrapper = mount(HorseList, {
      global: { plugins: [store, vuetify] },
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(20)
  })

  it('displays horse name and condition in each row', () => {
    const horses = createMockHorses(20)
    const store = createTestStore(horses)

    const wrapper = mount(HorseList, {
      global: { plugins: [store, vuetify] },
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    const cells = firstRow.findAll('td')

    expect(cells[0].text()).toBe('Horse 1')
    expect(cells[1].text()).toBe('50')
  })

  it('displays a color indicator with the horse hex color', () => {
    const horses = createMockHorses(20)
    const store = createTestStore(horses)

    const wrapper = mount(HorseList, {
      global: { plugins: [store, vuetify] },
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    const colorDot = firstRow.find('.color-dot')

    expect(colorDot.exists()).toBe(true)
    expect(colorDot.attributes('style')).toContain('background-color')
  })
})
