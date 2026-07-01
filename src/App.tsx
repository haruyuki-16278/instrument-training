import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DashboardScreen } from './components/DashboardScreen'
import { HomeScreen } from './components/HomeScreen'
import { PlayScreen } from './components/PlayScreen'
import { ResultScreen } from './components/ResultScreen'
import { INSTRUMENTS } from './constants/instruments'
import { useAudioProcessor } from './hooks/useAudioProcessor'
import type { Mode, PlayRecord, QuestionCount, QuestionResult, TrainingNote } from './types/music'
import { calculateAverage, calculateStabilityScore } from './utils/scoring'
import { buildDashboardStats, loadRecords, saveRecord } from './utils/storage'

const LONG_TONE_DURATION_MS = 8000

type Screen = 'home' | 'play' | 'result' | 'dashboard'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [instrumentId, setInstrumentId] = useState(INSTRUMENTS[0].id)
  const [mode, setMode] = useState<Mode>('speed')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(12)
  const [records, setRecords] = useState<PlayRecord[]>(() => loadRecords())

  const [questionIndex, setQuestionIndex] = useState(1)
  const [currentTarget, setCurrentTarget] = useState<TrainingNote | null>(null)
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([])
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null)
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  const [longToneActive, setLongToneActive] = useState(false)
  const [longToneRemainingMs, setLongToneRemainingMs] = useState(LONG_TONE_DURATION_MS)

  const [resultRecord, setResultRecord] = useState<PlayRecord | null>(null)

  const longToneStartRef = useRef<number | null>(null)
  const longToneDiffsRef = useRef<number[]>([])
  const speedResolvePendingRef = useRef(false)
  const longToneStartedRef = useRef(false)

  const audio = useAudioProcessor()

  const selectedInstrument = useMemo(
    () => INSTRUMENTS.find((instrument) => instrument.id === instrumentId) ?? INSTRUMENTS[0],
    [instrumentId],
  )

  const stats = useMemo(() => buildDashboardStats(records), [records])

  const questionLimit = typeof questionCount === 'number' ? questionCount : null

  const pickRandomTarget = useCallback((): TrainingNote => {
    const notes = selectedInstrument.notes
    const randomIndex = Math.floor(Math.random() * notes.length)
    return notes[randomIndex]
  }, [selectedInstrument.notes])

  const resetSessionState = useCallback(() => {
    setQuestionIndex(1)
    setQuestionResults([])
    setSessionStartedAt(Date.now())
    setQuestionStartedAt(Date.now())
    setLongToneActive(false)
    setLongToneRemainingMs(LONG_TONE_DURATION_MS)
    longToneStartRef.current = null
    longToneDiffsRef.current = []
    speedResolvePendingRef.current = false
    longToneStartedRef.current = false
    setCurrentTarget(pickRandomTarget())
  }, [pickRandomTarget])

  const startSession = useCallback(() => {
    resetSessionState()
    setResultRecord(null)
    setScreen('play')
  }, [resetSessionState])

  const finishSession = useCallback(
    (finalResults: QuestionResult[]) => {
      const attemptedQuestions = finalResults.length
      if (attemptedQuestions === 0 || !sessionStartedAt) {
        setScreen('home')
        return
      }

      const speedDurations = finalResults
        .map((item) => item.durationMs)
        .filter((value): value is number => typeof value === 'number')
      const longToneScores = finalResults
        .map((item) => item.score)
        .filter((value): value is number => typeof value === 'number')

      const totalTimeMs = Date.now() - sessionStartedAt
      const averageTimeMs = speedDurations.length ? calculateAverage(speedDurations) : undefined
      const averageScore = longToneScores.length ? calculateAverage(longToneScores) : undefined

      const record: PlayRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString(),
        mode,
        instrumentId: selectedInstrument.id,
        questionCount,
        attemptedQuestions,
        totalTimeMs,
        averageTimeMs,
        averageScore,
        questionResults: finalResults,
      }

      saveRecord(record)
      setRecords((previous) => [record, ...previous].slice(0, 300))
      setResultRecord(record)
      setScreen('result')
      speedResolvePendingRef.current = false
      longToneStartedRef.current = false
    },
    [mode, questionCount, selectedInstrument.id, sessionStartedAt],
  )

  const moveToNextQuestion = useCallback(
    (updatedResults: QuestionResult[]) => {
      const reachedLimit = questionLimit !== null && updatedResults.length >= questionLimit
      if (reachedLimit) {
        finishSession(updatedResults)
        return
      }

      setQuestionIndex(updatedResults.length + 1)
      setQuestionStartedAt(Date.now())
      setCurrentTarget(pickRandomTarget())
      setLongToneActive(false)
      setLongToneRemainingMs(LONG_TONE_DURATION_MS)
      longToneStartRef.current = null
      longToneDiffsRef.current = []
      speedResolvePendingRef.current = false
      longToneStartedRef.current = false
    },
    [finishSession, pickRandomTarget, questionLimit],
  )

  useEffect(() => {
    if (screen !== 'play' || !currentTarget) return
    if (!audio.currentNoteId) return

    if (mode === 'speed') {
      if (audio.currentNoteId !== currentTarget.id) return
      if (speedResolvePendingRef.current) return
      speedResolvePendingRef.current = true

      const solvedAt = Date.now()
      const result: QuestionResult = {
        target: currentTarget.id,
        durationMs: questionStartedAt ? solvedAt - questionStartedAt : undefined,
      }

      window.setTimeout(() => {
        setQuestionResults((previous) => {
          const updated = [...previous, result]
          moveToNextQuestion(updated)
          return updated
        })
      }, 0)
    }

    if (
      mode === 'longTone' &&
      !longToneActive &&
      !longToneStartedRef.current &&
      audio.currentNoteId === currentTarget.id
    ) {
      longToneStartedRef.current = true
      window.setTimeout(() => {
        setLongToneActive(true)
        setLongToneRemainingMs(LONG_TONE_DURATION_MS)
        longToneStartRef.current = Date.now()
        longToneDiffsRef.current = []
      }, 0)
    }
  }, [
    audio.currentNoteId,
    currentTarget,
    longToneActive,
    mode,
    moveToNextQuestion,
    questionStartedAt,
    screen,
  ])

  useEffect(() => {
    if (screen !== 'play' || mode !== 'longTone' || !longToneActive) return
    longToneDiffsRef.current.push(audio.spectrumDiff)
  }, [audio.spectrumDiff, longToneActive, mode, screen])

  useEffect(() => {
    if (screen !== 'play' || mode !== 'longTone' || !longToneActive || !currentTarget) return

    const intervalId = window.setInterval(() => {
      if (!longToneStartRef.current) return
      const elapsed = Date.now() - longToneStartRef.current
      const remaining = Math.max(0, LONG_TONE_DURATION_MS - elapsed)
      setLongToneRemainingMs(remaining)

      if (elapsed < LONG_TONE_DURATION_MS) return

      const score = calculateStabilityScore(longToneDiffsRef.current)
      longToneStartRef.current = null
      const result: QuestionResult = {
        target: currentTarget.id,
        score,
      }

      setQuestionResults((previous) => {
        const updated = [...previous, result]
        moveToNextQuestion(updated)
        return updated
      })
    }, 100)

    return () => window.clearInterval(intervalId)
  }, [currentTarget, longToneActive, mode, moveToNextQuestion, screen])

  useEffect(() => {
    if (screen !== 'play') return

    const timerId = window.setInterval(() => setNowMs(Date.now()), 100)
    return () => window.clearInterval(timerId)
  }, [screen])

  const timerText = useMemo(() => {
    if (mode === 'speed') {
      const elapsed = questionStartedAt ? (nowMs - questionStartedAt) / 1000 : 0
      return `経過: ${elapsed.toFixed(2)} 秒（誤検出はスルー）`
    }

    if (!longToneActive) {
      return '正しい音を検出した瞬間に8秒カウントダウン開始'
    }

    return `残り ${(longToneRemainingMs / 1000).toFixed(1)} 秒`
  }, [longToneActive, longToneRemainingMs, mode, nowMs, questionStartedAt])

  const abortSession = useCallback(() => {
    audio.stopListening()
    finishSession(questionResults)
  }, [audio, finishSession, questionResults])

  if (screen === 'dashboard') {
    return <DashboardScreen records={records} stats={stats} onBack={() => setScreen('home')} />
  }

  if (screen === 'play' && currentTarget) {
    return (
      <PlayScreen
        instrumentName={selectedInstrument.name}
        mode={mode}
        questionCount={questionCount}
        questionIndex={questionIndex}
        currentTarget={currentTarget}
        currentInputNote={audio.currentDisplayNote}
        currentFrequency={audio.currentFrequency}
        timerText={timerText}
        listening={audio.isListening}
        error={audio.error}
        spectrumBars={audio.spectrumBars}
        onStartListening={audio.startListening}
        onStopListening={audio.stopListening}
        onAbort={abortSession}
      />
    )
  }

  if (screen === 'result' && resultRecord) {
    return (
      <ResultScreen
        record={resultRecord}
        mode={mode}
        stats={stats}
        onReplay={startSession}
        onOpenDashboard={() => setScreen('dashboard')}
        onHome={() => setScreen('home')}
      />
    )
  }

  return (
    <HomeScreen
      instrumentId={selectedInstrument.id}
      mode={mode}
      questionCount={questionCount}
      onInstrumentChange={setInstrumentId}
      onModeChange={setMode}
      onQuestionCountChange={setQuestionCount}
      onStart={startSession}
      onOpenDashboard={() => setScreen('dashboard')}
    />
  )
}

export default App
