export const calculateStabilityScore = (frameDiffs: number[]): number => {
  if (!frameDiffs.length) return 0

  const averageDiff = frameDiffs.reduce((sum, value) => sum + value, 0) / frameDiffs.length
  const normalized = Math.max(0, Math.min(100, 100 - averageDiff * 0.9))

  return Math.round(normalized)
}

export const calculateAverage = (values: number[]): number => {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
