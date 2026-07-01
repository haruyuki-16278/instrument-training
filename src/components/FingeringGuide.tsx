import type { TrainingNote } from '../types/music'

interface FingeringGuideProps {
  note: TrainingNote
}

const KEY_ORDER = ['thumb', '1', '2', '3', 'open']

export function FingeringGuide({ note }: FingeringGuideProps) {
  const activeKeys = new Set(note.fingering.keys)

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">運指ガイド</h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {KEY_ORDER.map((keyName) => {
          const active = activeKeys.has(keyName)
          return (
            <div
              key={keyName}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold ${
                active
                  ? 'border-emerald-300 bg-emerald-500 text-emerald-950'
                  : 'border-slate-600 bg-slate-800 text-slate-300'
              }`}
            >
              {keyName}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-slate-300">{note.fingering.description}</p>
    </div>
  )
}
