import { useCallback, useEffect, useRef, useState } from 'react'
import { autocorrelate, frequencyToNoteInfo } from '../utils/music'

interface AudioState {
  isListening: boolean
  currentFrequency: number | null
  currentNoteId: string | null
  currentDisplayNote: string | null
  spectrumBars: number[]
  spectrumDiff: number
  error: string | null
}

const SPECTRUM_BARS = 24

export const useAudioProcessor = () => {
  const [state, setState] = useState<AudioState>({
    isListening: false,
    currentFrequency: null,
    currentNoteId: null,
    currentDisplayNote: null,
    spectrumBars: Array.from({ length: SPECTRUM_BARS }, () => 0),
    spectrumDiff: 0,
    error: null,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const previousSpectrumRef = useRef<Uint8Array | null>(null)

  const stopListening = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    analyserRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    audioContextRef.current?.close().catch(() => undefined)

    analyserRef.current = null
    streamRef.current = null
    audioContextRef.current = null
    previousSpectrumRef.current = null

    setState((previous) => ({
      ...previous,
      isListening: false,
      currentFrequency: null,
      currentNoteId: null,
      currentDisplayNote: null,
      spectrumBars: Array.from({ length: SPECTRUM_BARS }, () => 0),
      spectrumDiff: 0,
    }))
  }, [])

  const startListening = useCallback(async () => {
    if (state.isListening) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.85
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      streamRef.current = stream
      previousSpectrumRef.current = null

      const timeBuffer = new Float32Array(analyser.fftSize)
      const spectrumBuffer = new Uint8Array(analyser.frequencyBinCount)

      const processFrame = () => {
        if (!analyserRef.current || !audioContextRef.current) return

        analyser.getFloatTimeDomainData(timeBuffer)
        analyser.getByteFrequencyData(spectrumBuffer)

        const frequency = autocorrelate(timeBuffer, audioContext.sampleRate)
        const noteInfo = frequency ? frequencyToNoteInfo(frequency) : null

        const previousSpectrum = previousSpectrumRef.current
        let diff = 0

        if (previousSpectrum) {
          for (let i = 0; i < spectrumBuffer.length; i += 1) {
            diff += Math.abs(spectrumBuffer[i] - previousSpectrum[i])
          }
          diff /= spectrumBuffer.length
        }

        previousSpectrumRef.current = new Uint8Array(spectrumBuffer)

        const chunkSize = Math.floor(spectrumBuffer.length / SPECTRUM_BARS)
        const spectrumBars = Array.from({ length: SPECTRUM_BARS }, (_, index) => {
          const start = index * chunkSize
          const end = index === SPECTRUM_BARS - 1 ? spectrumBuffer.length : start + chunkSize
          let sum = 0
          for (let i = start; i < end; i += 1) {
            sum += spectrumBuffer[i]
          }
          const average = sum / Math.max(1, end - start)
          return Math.round((average / 255) * 100)
        })

        setState((previous) => ({
          ...previous,
          currentFrequency: frequency,
          currentNoteId: noteInfo?.id ?? null,
          currentDisplayNote: noteInfo ? `${noteInfo.displayName}${noteInfo.octave}` : null,
          spectrumBars,
          spectrumDiff: diff,
          isListening: true,
          error: null,
        }))

        animationFrameRef.current = requestAnimationFrame(processFrame)
      }

      processFrame()
    } catch {
      setState((previous) => ({
        ...previous,
        error: 'マイク入力を開始できませんでした。ブラウザの権限設定をご確認ください。',
      }))
    }
  }, [state.isListening])

  useEffect(() => () => stopListening(), [stopListening])

  return {
    ...state,
    startListening,
    stopListening,
  }
}
