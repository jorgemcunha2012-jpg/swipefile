'use client'

type SortOption = 'hot' | 'ads' | 'recent' | 'score'

interface SortToolbarProps {
  active: SortOption
  onChange: (sort: SortOption) => void
  resultCount: number
}

export function SortToolbar({ active, onChange, resultCount }: SortToolbarProps) {
  const options: { id: SortOption; label: string }[] = [
    { id: 'hot', label: 'Mais quente' },
    { id: 'ads', label: 'Mais anúncios' },
    { id: 'recent', label: 'Mais recente' },
    { id: 'score', label: 'Score ↑' },
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-4 py-2 text-sm font-mono uppercase tracking-[0.06em] transition-all rounded-[2px] ${
              active === opt.id
                ? 'bg-s2 border border-b2 text-t1'
                : 'bg-transparent border-0 text-t3 hover:text-t2'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="text-sm font-mono text-t3 uppercase tracking-[0.06em]">
        {resultCount} resultados
      </div>
    </div>
  )
}
