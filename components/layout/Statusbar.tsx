'use client'

export function Statusbar() {
  const now = new Date()
  const lastScan = new Date(now.getTime() - 15 * 60 * 1000)

  return (
    <div className="fixed bottom-0 left-0 right-0 h-6 bg-s1 border-t border-b1">
      <div className="flex items-center justify-between h-full px-6 text-t3 text-xs font-mono gap-8">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 bg-red rounded-full" />
          <span className="uppercase tracking-[0.06em]">Online</span>
        </div>
        <div className="text-t2">
          Última varredura: {lastScan.toLocaleTimeString('pt-BR')}
        </div>
        <div className="text-t2">
          {47} alertas novos
        </div>
        <div className="ml-auto text-t2">
          v1.0.0
        </div>
      </div>
    </div>
  )
}
