const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H']

export interface NoteInfo {
  name: string
  displayName: string
  octave: number
  id: string
  frequency: number
}

export const midiToFrequency = (midi: number): number => 440 * 2 ** ((midi - 69) / 12)

export const frequencyToMidi = (frequency: number): number | null => {
  if (!Number.isFinite(frequency) || frequency <= 0) return null
  return Math.round(12 * Math.log2(frequency / 440) + 69)
}

export const midiToNoteInfo = (midi: number): NoteInfo => {
  const normalized = ((midi % 12) + 12) % 12
  const name = NOTE_NAMES[normalized]
  const octave = Math.floor(midi / 12) - 1
  const displayName = name === 'H' ? 'H(B)' : name

  return {
    name,
    displayName,
    octave,
    id: `${name}${octave}`,
    frequency: midiToFrequency(midi),
  }
}

export const frequencyToNoteInfo = (frequency: number): NoteInfo | null => {
  const midi = frequencyToMidi(frequency)
  if (midi === null) return null
  return midiToNoteInfo(midi)
}

export const calculateCentsOff = (frequency: number, targetFrequency: number): number => {
  if (!frequency || !targetFrequency) return 0
  return 1200 * Math.log2(frequency / targetFrequency)
}

export const autocorrelate = (
  samples: Float32Array,
  sampleRate: number,
): number | null => {
  const size = samples.length
  let rms = 0
  for (let i = 0; i < size; i += 1) {
    const sample = samples[i]
    rms += sample * sample
  }

  rms = Math.sqrt(rms / size)
  if (rms < 0.01) return null

  const minLag = Math.floor(sampleRate / 1200)
  const maxLag = Math.floor(sampleRate / 70)

  let bestLag = -1
  let bestCorrelation = 0

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0

    for (let i = 0; i < size - lag; i += 1) {
      correlation += samples[i] * samples[i + lag]
    }

    correlation /= size - lag

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestLag = lag
    }
  }

  if (bestLag === -1 || bestCorrelation < 0.1) return null

  return sampleRate / bestLag
}

export const normalizeNoteId = (id: string): string => id.replace('B', 'H')
