import type { InstrumentDefinition } from '../types/music'

const naturalCoreNotes = [
  {
    id: 'C4',
    label: 'C4',
    fingering: { keys: ['1', '3'], description: '基準運指（プレースホルダー）' },
  },
  {
    id: 'D4',
    label: 'D4',
    fingering: { keys: ['1', '2'], description: '上2キー（プレースホルダー）' },
  },
  {
    id: 'E4',
    label: 'E4',
    fingering: { keys: ['1'], description: '上1キー（プレースホルダー）' },
  },
  {
    id: 'F4',
    label: 'F4',
    fingering: { keys: ['2', '3'], description: '中低域（プレースホルダー）' },
  },
  {
    id: 'G4',
    label: 'G4',
    fingering: { keys: ['open'], description: 'オープン（プレースホルダー）' },
  },
  {
    id: 'A4',
    label: 'A4',
    fingering: { keys: ['thumb'], description: '親指補助（プレースホルダー）' },
  },
  {
    id: 'H4',
    label: 'H(B)4',
    fingering: { keys: ['1', 'thumb'], description: 'H/B音（プレースホルダー）' },
  },
]

export const INSTRUMENTS: InstrumentDefinition[] = [
  { id: 'trumpet', name: 'トランペット', notes: [...naturalCoreNotes] },
  { id: 'saxophone', name: 'サックス', notes: [...naturalCoreNotes] },
  { id: 'flute', name: 'フルート', notes: [...naturalCoreNotes] },
  { id: 'clarinet', name: 'クラリネット', notes: [...naturalCoreNotes] },
]

export const QUESTION_COUNT_OPTIONS = [12, 24, 'endless'] as const
