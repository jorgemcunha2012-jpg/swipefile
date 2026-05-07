'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { label: 'Radar', href: '/radar' },
  { label: 'Trending', href: '/trending' },
  { label: 'Nichos', href: '/nichos' },
  { label: 'Biblioteca', href: '/biblioteca' },
  { label: 'Alertas', href: '/alertas' },
]

export function Topbar() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 right-0 h-[42px] bg-s1 border-b border-b1 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red rounded-[2px] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
            </svg>
          </div>
          <div className="font-syne font-900 text-xs uppercase leading-none tracking-tight">
            <span className="text-t1">SPY</span>
            <span className="text-red">VAULT</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-1 text-xs font-mono uppercase tracking-[0.06em] transition-all ${
                pathname === item.href
                  ? 'bg-s3 border border-b2 text-t1'
                  : 'text-t3 hover:text-t2'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Status */}
        <div className="flex items-center gap-1 text-t2 text-xs font-mono uppercase">
          <span className="w-1.5 h-1.5 bg-red rounded-full pulse" />
          <span className="tracking-[0.06em]">Monitoramento ativo</span>
        </div>
      </div>
    </div>
  )
}
