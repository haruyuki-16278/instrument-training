import { INSTRUMENTS } from '../constants/instruments'
import type { DashboardStats, PlayRecord } from '../types/music'

interface DashboardScreenProps {
  records: PlayRecord[]
  stats: DashboardStats
  onBack: () => void
}

export function DashboardScreen({ records, stats, onBack }: DashboardScreenProps) {
  const recent = records.slice(0, 10)

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
        <h2 className="text-2xl font-bold text-white">ダッシュボード</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatCard label="総練習回数" value={`${stats.totalSessions}`} />
          <StatCard label="総出題数" value={`${stats.totalAttempts}`} />
          <StatCard
            label="最速平均"
            value={stats.bestSpeedAverageMs ? `${(stats.bestSpeedAverageMs / 1000).toFixed(2)}秒` : '--'}
          />
          <StatCard
            label="最高安定スコア"
            value={stats.bestLongToneScore !== null ? `${stats.bestLongToneScore.toFixed(1)}点` : '--'}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-slate-100">モード比率</h3>
        <svg viewBox="0 0 320 100" className="mt-4 h-28 w-full">
          <rect x="0" y="20" width="320" height="18" rx="6" className="fill-slate-700" />
          <rect
            x="0"
            y="20"
            width={`${stats.totalSessions ? (320 * stats.modeCounts.speed) / stats.totalSessions : 0}`}
            height="18"
            rx="6"
            className="fill-cyan-400"
          />
          <text x="4" y="16" className="fill-slate-200 text-xs">Speed: {stats.modeCounts.speed}</text>
          <text x="4" y="58" className="fill-slate-200 text-xs">
            LongTone: {stats.modeCounts.longTone}
          </text>
        </svg>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-slate-100">最新プレイ履歴</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-300">
                <th className="py-2">日時</th>
                <th className="py-2">モード</th>
                <th className="py-2">楽器</th>
                <th className="py-2">結果</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((record) => {
                const instrumentName = INSTRUMENTS.find((item) => item.id === record.instrumentId)?.name
                return (
                  <tr key={record.id} className="border-b border-slate-800 text-slate-200">
                    <td className="py-2 pr-3">{new Date(record.date).toLocaleString('ja-JP')}</td>
                    <td className="py-2 pr-3">{record.mode === 'speed' ? 'スピード' : 'ロングトーン'}</td>
                    <td className="py-2 pr-3">{instrumentName ?? record.instrumentId}</td>
                    <td className="py-2">
                      {record.mode === 'speed'
                        ? `平均 ${((record.averageTimeMs ?? 0) / 1000).toFixed(2)} 秒`
                        : `平均 ${(record.averageScore ?? 0).toFixed(1)} 点`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {recent.length === 0 && <p className="py-6 text-sm text-slate-400">まだ履歴がありません。</p>}
        </div>
      </section>

      <button
        type="button"
        onClick={onBack}
        className="rounded-md bg-slate-700 px-4 py-2 font-semibold text-slate-100"
      >
        ホームへ戻る
      </button>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  )
}
