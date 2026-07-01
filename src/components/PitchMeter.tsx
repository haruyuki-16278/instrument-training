interface PitchMeterProps {
  bars: number[]
}

export function PitchMeter({ bars }: PitchMeterProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">FFTスペクトラム</h3>
      <div className="flex h-24 items-end gap-1">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="flex-1 rounded-t bg-cyan-400/80"
            style={{ height: `${Math.max(4, bar)}%` }}
          />
        ))}
      </div>
    </div>
  )
}
