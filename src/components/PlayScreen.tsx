import { FingeringGuide } from './FingeringGuide'
import { PitchMeter } from './PitchMeter'
import type { Mode, QuestionCount, TrainingNote } from '../types/music'

interface PlayScreenProps {
  instrumentName: string
  mode: Mode
  questionCount: QuestionCount
  questionIndex: number
  currentTarget: TrainingNote
  currentInputNote: string | null
  currentFrequency: number | null
  timerText: string
  listening: boolean
  error: string | null
  spectrumBars: number[]
  onStartListening: () => void
  onStopListening: () => void
  onAbort: () => void
}

export function PlayScreen({
  instrumentName,
  mode,
  questionCount,
  questionIndex,
  currentTarget,
  currentInputNote,
  currentFrequency,
  timerText,
  listening,
  error,
  spectrumBars,
  onStartListening,
  onStopListening,
  onAbort,
}: PlayScreenProps) {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-white">プレイ画面</h2>
          <p className="text-sm text-slate-300">
            {instrumentName} / {mode === 'speed' ? 'スピード' : 'ロングトーン'} /{' '}
            {questionCount === 'endless' ? 'エンドレス' : `${questionCount}問`}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
            <p className="text-xs text-slate-400">現在の課題</p>
            <p className="text-4xl font-black text-amber-300">{currentTarget.label}</p>
            <p className="mt-1 text-sm text-slate-300">問題 {questionIndex}</p>
            <p className="mt-4 text-xs text-slate-400">入力音</p>
            <p className="text-2xl font-bold text-cyan-300">{currentInputNote ?? '--'}</p>
            <p className="text-sm text-slate-400">
              {currentFrequency ? `${currentFrequency.toFixed(2)} Hz` : '周波数未検出'}
            </p>
            <p className="mt-3 text-sm font-semibold text-emerald-300">{timerText}</p>
          </div>

          <FingeringGuide note={currentTarget} />
        </div>
      </div>

      <PitchMeter bars={spectrumBars} />

      {error && (
        <div className="rounded-md border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!listening ? (
          <button
            type="button"
            onClick={onStartListening}
            className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-cyan-950"
          >
            マイク開始
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopListening}
            className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-slate-100"
          >
            マイク停止
          </button>
        )}
        <button
          type="button"
          onClick={onAbort}
          className="rounded-md bg-rose-500 px-4 py-2 font-semibold text-rose-950"
        >
          セッション終了
        </button>
      </div>
    </main>
  )
}
