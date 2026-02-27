import type { Horse } from '@/types'

type UpdateCallback = (positions: Record<number, number>) => void

type FinishCallback = (results: { horseId: number; finishTime: number; position: number }[]) => void

interface HorseState {
  horse: Horse
  currentDistance: number
  baseSpeed: number
  randomVariance: number
  finished: boolean
  finishTime: number
}

const BASE_DURATION_SECONDS = 8
const BASE_DISTANCE = 1200

const VARIANCE_UPDATE_INTERVAL = 15

/**
 * Manages the lifecycle of a single race round.
 * Uses requestAnimationFrame to simulate horses racing over a given distance.
 * Each horse's speed is derived from their condition stat plus random variance,
 * producing realistic, unpredictable races where higher condition generally wins.
 */
export class RaceEngine {
  private horses: Horse[]
  private distance: number
  private horseStates: HorseState[] = []
  private updateCallbacks: UpdateCallback[] = []
  private finishCallbacks: FinishCallback[] = []
  private animationFrameId: number | null = null
  private lastTimestamp: number | null = null
  private running = false
  private paused = false
  private finished = false
  private frameCount = 0
  private finishOrder: { horseId: number; finishTime: number }[] = []
  private raceStartTime = 0

  constructor(horses: Horse[], distance: number) {
    this.horses = horses
    this.distance = distance
    this.initHorseStates()
  }

  /**
   * Initializes internal state for each horse.
   * Speed is calibrated so the race lasts ~15-25 seconds regardless of distance.
   */
  private initHorseStates(): void {
    const targetDuration = BASE_DURATION_SECONDS * (this.distance / BASE_DISTANCE)
    const averageCondition = 50
    const conditionFactor = 0.15

    // Calculate base speed so an average horse finishes in roughly targetDuration seconds
    const averageSpeed = this.distance / targetDuration
    const baseSpeed = averageSpeed / (1 + averageCondition * conditionFactor)

    this.horseStates = this.horses.map((horse) => ({
      horse,
      currentDistance: 0,
      baseSpeed: baseSpeed * (1 + horse.condition * conditionFactor),
      randomVariance: 0,
      finished: false,
      finishTime: 0,
    }))
  }

  /**
   * Starts the race simulation using requestAnimationFrame.
   * Horses begin moving from position 0 toward the finish line.
   */
  start(): void {
    if (this.running) return

    this.running = true
    this.paused = false
    this.finished = false
    this.frameCount = 0
    this.finishOrder = []
    // Record high-resolution start time for elapsed time calculations
    this.raceStartTime = performance.now()
    this.lastTimestamp = null
    this.initHorseStates()
    this.tick()
  }

  /** Pauses the currently running race, preserving all horse positions. */
  pause(): void {
    if (!this.running || this.paused) return

    this.paused = true
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId) // Stop the animation loop
      this.animationFrameId = null
    }
    this.lastTimestamp = null
  }

  /** Resumes a paused race from the saved state. */
  resume(): void {
    if (!this.paused) return

    this.paused = false
    this.lastTimestamp = null
    this.tick() // Restart the animation loop
  }

  /** Clears all race state and cancels any pending animation frame. */
  reset(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId) // Stop the animation loop
      this.animationFrameId = null
    }
    this.running = false
    this.paused = false
    this.finished = false
    this.lastTimestamp = null
    this.frameCount = 0
    this.finishOrder = []
    this.horseStates = []
  }

  /**
   * Returns current positions of all horses as a percentage of the race completed.
   * @returns A record mapping horseId to progress (0-100)
   */
  getPositions(): Record<number, number> {
    const positions: Record<number, number> = {}
    for (const state of this.horseStates) {
      const progress = Math.min((state.currentDistance / this.distance) * 100, 100)
      positions[state.horse.id] = progress
    }
    return positions
  }

  /**
   * Returns whether all horses have crossed the finish line.
   * @returns true if the race is complete
   */
  isFinished(): boolean {
    return this.finished
  }

  /**
   * Registers a callback to be invoked on each animation frame with updated positions.
   * @param callback - Function receiving a record of horseId → progress percentage
   */
  onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.push(callback)
  }

  /**
   * Registers a callback to be invoked once when all horses finish.
   * @param callback - Function receiving sorted results with positions and finish times
   */
  onFinish(callback: FinishCallback): void {
    this.finishCallbacks.push(callback)
  }

  /**
   * Main animation loop. Calculates deltaTime, updates each horse's position,
   * checks for finishes, and schedules the next frame.
   */
  private tick(): void {
    this.animationFrameId = requestAnimationFrame((timestamp) => { // Schedule next frame
      if (this.paused || !this.running) return

      if (this.lastTimestamp === null) {
        this.lastTimestamp = timestamp
        this.tick()
        return
      }

      const deltaTime = (timestamp - this.lastTimestamp) / 1000
      this.lastTimestamp = timestamp
      this.frameCount++

      this.updateHorses(deltaTime, timestamp)

      const positions = this.getPositions()
      for (const cb of this.updateCallbacks) {
        cb(positions)
      }

      if (this.checkAllFinished()) {
        this.completeRace()
        return
      }

      this.tick()
    })
  }

  /**
   * Advances each unfinished horse based on their speed and deltaTime.
   * Recalculates random variance periodically to simulate natural speed fluctuations.
   * @param deltaTime - Seconds elapsed since the last frame
   * @param timestamp - Current animation timestamp for finish time recording
   */
  private updateHorses(deltaTime: number, timestamp: number): void {
    for (const state of this.horseStates) {
      if (state.finished) continue

      // Update random variance every few frames for realistic speed fluctuation
      if (this.frameCount % VARIANCE_UPDATE_INTERVAL === 0) {
        // Variance ranges from -15% to +15% of base speed, smoothed with previous value
        const newVariance = (Math.random() - 0.5) * 0.3 * state.baseSpeed
        state.randomVariance = state.randomVariance * 0.6 + newVariance * 0.4
      }

      const speed = state.baseSpeed + state.randomVariance
      // Ensure speed never drops below 30% of base to prevent stalling
      const clampedSpeed = Math.max(speed, state.baseSpeed * 0.3)

      state.currentDistance += clampedSpeed * deltaTime

      if (state.currentDistance >= this.distance) {
        state.currentDistance = this.distance
        state.finished = true
        state.finishTime = timestamp - this.raceStartTime
        this.finishOrder.push({
          horseId: state.horse.id,
          finishTime: state.finishTime,
        })
      }
    }
  }

  /**
   * Checks whether all horses in the race have crossed the finish line.
   * @returns true if every horse is finished
   */
  private checkAllFinished(): boolean {
    return this.horseStates.every((s) => s.finished)
  }

  /**
   * Finalizes the race: cancels animation, sorts results by finish time,
   * assigns positions 1-10, and invokes all finish callbacks.
   */
  private completeRace(): void {
    this.finished = true
    this.running = false

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId) // Stop the animation loop
      this.animationFrameId = null
    }

    const sortedResults = [...this.finishOrder]
      .sort((a, b) => a.finishTime - b.finishTime)
      .map((entry, index) => ({
        horseId: entry.horseId,
        finishTime: entry.finishTime,
        position: index + 1,
      }))

    for (const cb of this.finishCallbacks) {
      cb(sortedResults)
    }
  }
}
