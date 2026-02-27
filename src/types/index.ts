export interface Horse {
  id: number
  name: string
  color: string
  condition: number
}

export interface RoundSchedule {
  round: number
  distance: number
  horses: Horse[]
}

export interface FinishResult {
  horse: Horse
  finishTime: number
  position: number
}

export interface RoundResult {
  round: number
  distance: number
  results: FinishResult[]
}

export enum RaceStatus {
  IDLE = 'IDLE',
  READY = 'READY',
  RACING = 'RACING',
  PAUSED = 'PAUSED',
  ROUND_COMPLETE = 'ROUND_COMPLETE',
  FINISHED = 'FINISHED',
}
