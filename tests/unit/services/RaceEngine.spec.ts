import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RaceEngine } from '@/services/RaceEngine'
import type { Horse } from '@/types'

function createMockHorses(count: number, condition?: number): Horse[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Horse ${i + 1}`,
    color: `#${String(i + 1).padStart(6, '0')}`,
    condition: condition ?? 50 + i,
  }))
}

/**
 * Manual rAF stepper: collects callbacks registered via requestAnimationFrame,
 * then fires them one at a time with a given timestamp.
 */
function createRafStepper() {
  const callbacks: Map<number, FrameRequestCallback> = new Map()
  let nextId = 1

  const mockRaf = vi.fn((cb: FrameRequestCallback): number => {
    const id = nextId++
    callbacks.set(id, cb)
    return id
  })

  const mockCaf = vi.fn((id: number) => {
    callbacks.delete(id)
  })

  vi.stubGlobal('requestAnimationFrame', mockRaf)
  vi.stubGlobal('cancelAnimationFrame', mockCaf)

  return {
    /** Fire all pending rAF callbacks with the given timestamp. */
    step(timestamp: number) {
      const pending = new Map(callbacks)
      callbacks.clear()
      for (const cb of pending.values()) {
        cb(timestamp)
      }
    },
    /** Run multiple frames spaced by frameInterval ms starting from startTime. */
    runFrames(count: number, startTime: number, frameInterval: number) {
      for (let i = 0; i < count; i++) {
        this.step(startTime + i * frameInterval)
      }
    },
    getPendingCount: () => callbacks.size,
  }
}

describe('RaceEngine', () => {
  let stepper: ReturnType<typeof createRafStepper>

  beforeEach(() => {
    vi.spyOn(performance, 'now').mockReturnValue(0)
    stepper = createRafStepper()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('creates engine with horses and distance without errors', () => {
      const horses = createMockHorses(10)
      expect(() => new RaceEngine(horses, 1200)).not.toThrow()
    })

    it('getPositions returns all horses at 0 initially', () => {
      const horses = createMockHorses(10)
      const engine = new RaceEngine(horses, 1200)
      const positions = engine.getPositions()

      expect(Object.keys(positions)).toHaveLength(10)
      for (const pos of Object.values(positions)) {
        expect(pos).toBe(0)
      }
    })
  })

  describe('Race mechanics', () => {
    it('all horses eventually reach position 100', () => {
      const horses = createMockHorses(10)
      const engine = new RaceEngine(horses, 1200)

      engine.start()

      // First frame sets lastTimestamp, subsequent frames advance horses.
      // With ~16ms frames over 60 seconds (3750 frames), all horses should finish.
      const frameInterval = 16
      stepper.runFrames(4000, 0, frameInterval)

      const positions = engine.getPositions()
      for (const pos of Object.values(positions)) {
        expect(pos).toBe(100)
      }
      expect(engine.isFinished()).toBe(true)
    })

    it('onFinish callback is called with 10 results', () => {
      const horses = createMockHorses(10)
      const engine = new RaceEngine(horses, 1200)
      const finishSpy = vi.fn()

      engine.onFinish(finishSpy)
      engine.start()

      stepper.runFrames(4000, 0, 16)

      expect(finishSpy).toHaveBeenCalledOnce()
      expect(finishSpy.mock.calls[0][0]).toHaveLength(10)
    })

    it('results have positions 1 through 10 with no duplicates', () => {
      const horses = createMockHorses(10)
      const engine = new RaceEngine(horses, 1200)
      const finishSpy = vi.fn()

      engine.onFinish(finishSpy)
      engine.start()

      stepper.runFrames(4000, 0, 16)

      const results: { position: number }[] = finishSpy.mock.calls[0][0]
      const positions = results.map((r) => r.position).sort((a, b) => a - b)
      expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('higher condition horses tend to finish higher', () => {
      // Use extreme values: horse 1 has condition 100, horse 2 has condition 1
      // Run 10 races; horse 1 should win the majority
      let highConditionWins = 0

      for (let trial = 0; trial < 10; trial++) {
        const trialStepper = createRafStepper()

        const horses: Horse[] = [
          { id: 1, name: 'Fast', color: '#FF0000', condition: 100 },
          { id: 2, name: 'Slow', color: '#0000FF', condition: 1 },
          ...createMockHorses(8).map((h, i) => ({ ...h, id: i + 3, condition: 50 })),
        ]

        const engine = new RaceEngine(horses, 1200)
        const finishSpy = vi.fn()
        engine.onFinish(finishSpy)
        engine.start()

        // Condition 1 horse needs ~133s; use 50ms steps over 4000 frames = 200s
        for (let f = 0; f < 4000; f++) {
          trialStepper.step(f * 50)
          if (engine.isFinished()) break
        }

        if (finishSpy.mock.calls.length === 0) continue

        const results: { horseId: number; position: number }[] = finishSpy.mock.calls[0][0]
        const fastHorse = results.find((r) => r.horseId === 1)
        const slowHorse = results.find((r) => r.horseId === 2)

        if (fastHorse && slowHorse && fastHorse.position < slowHorse.position) {
          highConditionWins++
        }
      }

      // With condition 100 vs 1, the fast horse should win the majority (at least 7/10)
      expect(highConditionWins).toBeGreaterThanOrEqual(7)
    })
  })

  describe('Pause/Resume', () => {
    it('positions stop updating after pause()', () => {
      const horses = createMockHorses(10)
      const engine = new RaceEngine(horses, 1200)

      engine.start()

      // Run a few frames to get moving
      stepper.runFrames(100, 0, 16)

      const positionsBeforePause = { ...engine.getPositions() }

      engine.pause()

      // Run more frames — nothing should be scheduled but call step anyway
      stepper.runFrames(200, 1600, 16)

      const positionsAfterPause = engine.getPositions()

      expect(positionsAfterPause).toEqual(positionsBeforePause)
    })

    it('positions resume updating after resume()', () => {
      const horses = createMockHorses(10)
      const engine = new RaceEngine(horses, 1200)

      engine.start()

      // Run a few frames
      stepper.runFrames(100, 0, 16)

      engine.pause()
      const positionsAtPause = { ...engine.getPositions() }

      engine.resume()

      // Run more frames after resume
      stepper.runFrames(200, 1600, 16)
      const positionsAfterResume = engine.getPositions()

      // At least some horses should have advanced beyond their paused position
      const advanced = Object.keys(positionsAfterResume).some(
        (id) => positionsAfterResume[Number(id)] > positionsAtPause[Number(id)],
      )
      expect(advanced).toBe(true)
    })
  })

  describe('Distance proportionality', () => {
    it('2200m race takes longer than 1200m race', () => {
      // Run a 1200m race and track when it finishes
      const horses1200 = createMockHorses(10, 50)
      const engine1200 = new RaceEngine(horses1200, 1200)
      let finish1200Frame = -1
      const stepper1200 = createRafStepper()

      engine1200.onFinish(() => {
        finish1200Frame = frameCounter1200
      })
      engine1200.start()

      let frameCounter1200 = 0
      for (frameCounter1200 = 0; frameCounter1200 < 5000; frameCounter1200++) {
        stepper1200.step(frameCounter1200 * 16)
        if (engine1200.isFinished()) break
      }

      // Run a 2200m race
      const horses2200 = createMockHorses(10, 50)
      const engine2200 = new RaceEngine(horses2200, 2200)
      let finish2200Frame = -1
      const stepper2200 = createRafStepper()

      engine2200.onFinish(() => {
        finish2200Frame = frameCounter2200
      })
      engine2200.start()

      let frameCounter2200 = 0
      for (frameCounter2200 = 0; frameCounter2200 < 5000; frameCounter2200++) {
        stepper2200.step(frameCounter2200 * 16)
        if (engine2200.isFinished()) break
      }

      expect(finish1200Frame).toBeGreaterThan(0)
      expect(finish2200Frame).toBeGreaterThan(0)
      expect(finish2200Frame).toBeGreaterThan(finish1200Frame)
    })
  })
})
