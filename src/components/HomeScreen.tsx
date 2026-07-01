import { INSTRUMENTS, QUESTION_COUNT_OPTIONS } from '../constants/instruments'
import type { Mode, QuestionCount } from '../types/music'

interface HomeScreenProps {
  instrumentId: string
  mode: Mode
  questionCount: QuestionCount
  onInstrumentChange: (instrumentId: string) => void
  onModeChange: (mode: Mode) => void
  onQuestionCountChange: (count: QuestionCount) => void
  onStart: () => void
  onOpenDashboard: () => void
}

export function HomeScreen({
  instrumentId,
  mode,
  questionCount,
  onInstrumentChange,
  onModeChange,
  onQuestionCountChange,
  onStart,
  onOpenDashboard,
}: HomeScreenProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Pitch Trainer</h1>
        <p className="text-sm text-slate-300">
          初心者向けに、音名認識・運指ガイド・タイムアタックを1つにまとめた練習アプリです。
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 md:grid-cols-3">
        <div>
          <label htmlFor="instrument-select" className="mb-2 text-sm font-semibold text-slate-200">楽器</label>
          <select id="instrument-select"
            value={instrumentId}
            onChange={(event) => onInstrumentChange(event.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          >
            {INSTRUMENTS.map((instrument) => (
              <option key={instrument.id} value={instrument.id}>
                {instrument.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">モード</p>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onModeChange('speed')}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                mode === 'speed' ? 'bg-cyan-500 text-cyan-950' : 'bg-slate-800 text-slate-100'
              }`}
            >
              スピードモード
            </button>
            <button
              type="button"
              onClick={() => onModeChange('longTone')}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                mode === 'longTone' ? 'bg-cyan-500 text-cyan-950' : 'bg-slate-800 text-slate-100'
              }`}
            >
              ロングトーンモード
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-200">出題数</p>
          <div className="grid gap-2">
            {QUESTION_COUNT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onQuestionCountChange(option)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${
                  questionCount === option
                    ? 'bg-emerald-500 text-emerald-950'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                {option === 'endless' ? 'エンドレス' : `${option}問`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          className="rounded-md bg-amber-400 px-4 py-2 font-semibold text-amber-950"
        >
          トレーニング開始
        </button>
        <button
          type="button"
          onClick={onOpenDashboard}
          className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-slate-100"
        >
          ダッシュボード
        </button>
      </div>
    </main>
  )
}
