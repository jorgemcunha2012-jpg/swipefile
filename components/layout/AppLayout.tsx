'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Radar', href: '/radar' },
  { label: 'Trending', href: '/trending' },
  { label: 'Nichos', href: '/nichos' },
  { label: 'Biblioteca', href: '/biblioteca' },
  { label: 'Alertas', href: '/alertas' },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-bg flex-col">
      {/* Topbar */}
      <header className="h-[52px] bg-s1 border-b border-b1 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-red rounded-[2px]" />
          <div className="font-syne font-900 text-sm tracking-tight">
            <span className="text-t1">SPY</span><span className="text-red">VAULT</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono text-t2">
          <span className="w-2 h-2 bg-red rounded-full" />
          Online
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-56 bg-s1 border-r border-b1 p-6 overflow-y-auto flex flex-col flex-shrink-0">
          <div className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 text-sm font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                  pathname === item.href
                    ? 'bg-s3 border border-b2 text-t1'
                    : 'text-t3 hover:bg-s2'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-6 border-t border-b1">
            <div className="text-xs font-mono text-t3 uppercase mb-3">Info</div>
            <div className="text-xs font-mono text-t2 space-y-1">
              <div>v1.0.0</div>
              <div>PT-BR</div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-12 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Statusbar */}
      <footer className="h-8 bg-s1 border-t border-b1 px-8 flex items-center text-sm font-mono text-t3 gap-8 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red rounded-full" />
          Online
        </div>
        <div className="text-t2">Sistema operacional</div>
        <div className="ml-auto text-t2">v1.0.0</div>
      </footer>
    </div>
  )
}
