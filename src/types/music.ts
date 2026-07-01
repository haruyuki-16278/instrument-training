export type Mode = 'speed' | 'longTone'
export type QuestionCount = 12 | 24 | 'endless'

export interface FingeringPattern {
  keys: string[]
  description: string
}

export interface TrainingNote {
  id: string
  label: string
  fingering: FingeringPattern
}

export interface InstrumentDefinition {
  id: string
  name: string
  notes: TrainingNote[]
}

export interface QuestionResult {
  target: string
  durationMs?: number
  score?: number
}

export interface PlayRecord {
  id: string
  date: string
  mode: Mode
  instrumentId: string
  questionCount: QuestionCount
  attemptedQuestions: number
  totalTimeMs?: number
  averageTimeMs?: number
  averageScore?: number
  questionResults: QuestionResult[]
}

export interface DashboardStats {
  totalSessions: number
  totalAttempts: number
  bestSpeedAverageMs: number | null
  bestLongToneScore: number | null
  modeCounts: Record<Mode, number>
}
