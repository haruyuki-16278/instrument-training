import type { DashboardStats, PlayRecord } from '../types/music'

const STORAGE_KEY = 'instrument-training-records'

export const loadRecords = (): PlayRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PlayRecord[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export const saveRecord = (record: PlayRecord): void => {
  const records = loadRecords()
  records.unshift(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 300)))
}

export const buildDashboardStats = (records: PlayRecord[]): DashboardStats => {
  const speedAverages = records
    .filter((record) => record.mode === 'speed' && typeof record.averageTimeMs === 'number')
    .map((record) => record.averageTimeMs as number)

  const longToneScores = records
    .filter((record) => record.mode === 'longTone' && typeof record.averageScore === 'number')
    .map((record) => record.averageScore as number)

  return {
    totalSessions: records.length,
    totalAttempts: records.reduce((sum, record) => sum + record.attemptedQuestions, 0),
    bestSpeedAverageMs: speedAverages.length ? Math.min(...speedAverages) : null,
    bestLongToneScore: longToneScores.length ? Math.max(...longToneScores) : null,
    modeCounts: {
      speed: records.filter((record) => record.mode === 'speed').length,
      longTone: records.filter((record) => record.mode === 'longTone').length,
    },
  }
}
