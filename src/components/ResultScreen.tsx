import type { DashboardStats, Mode, PlayRecord } from '../types/music'

interface ResultScreenProps {
  record: PlayRecord
  mode: Mode
  stats: DashboardStats
  onReplay: () => void
  onHome: () => void
  onOpenDashboard: () => void
}

export function ResultScreen({
  record,
  mode,
  stats,
  onReplay,
  onHome,
  onOpenDashboard,
}: ResultScreenProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
        <h2 className="text-2xl font-bold text-white">リザルト</h2>
        <p className="mt-1 text-sm text-slate-300">{new Date(record.date).toLocaleString('ja-JP')}</p>

        {mode === 'speed' ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Metric label="合計時間" value={`${((record.totalTimeMs ?? 0) / 1000).toFixed(2)} 秒`} />
            <Metric
              label="平均反応時間"
              value={`${((record.averageTimeMs ?? 0) / 1000).toFixed(2)} 秒`}
            />
            <Metric
              label="自己ベスト(平均)"
              value={
                stats.bestSpeedAverageMs
                  ? `${(stats.bestSpeedAverageMs / 1000).toFixed(2)} 秒`
                  : '--'
              }
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Metric label="平均安定スコア" value={`${(record.averageScore ?? 0).toFixed(1)} 点`} />
            <Metric
              label="自己ベスト"
              value={stats.bestLongToneScore !== null ? `${stats.bestLongToneScore.toFixed(1)} 点` : '--'}
            />
            <Metric label="測定問題数" value={`${record.attemptedQuestions} 問`} />
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="rounded-md bg-amber-400 px-4 py-2 font-semibold text-amber-950"
        >
          同条件で再開
        </button>
        <button
          type="button"
          onClick={onOpenDashboard}
          className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-cyan-950"
        >
          ダッシュボードを見る
        </button>
        <button
          type="button"
          onClick={onHome}
          className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-slate-100"
        >
          ホームへ
        </button>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  )
}
