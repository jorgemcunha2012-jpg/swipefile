'use client'

export function Topbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[52px] bg-s1 border-b border-b1 z-50">
      <div className="flex items-center justify-between h-full px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red rounded-[2px] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
            </svg>
          </div>
          <div className="font-syne font-900 text-sm uppercase leading-none tracking-tight">
            <span className="text-t1">SPY</span>
            <span className="text-red">VAULT</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-t2 text-sm font-mono uppercase">
          <span className="w-2 h-2 bg-red rounded-full pulse" />
          <span className="tracking-[0.06em]">Monitoramento ativo</span>
        </div>
      </div>
    </div>
  )
}
