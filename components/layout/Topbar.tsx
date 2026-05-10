'use client'

import Image from 'next/image'

export function Topbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[52px] bg-s1 border-b border-b1 z-50">
      <div className="flex items-center justify-between h-full px-8">
        {/* Logo */}
        <Image
          src="/logocoompleta.png"
          alt="Raven Spy"
          height={30}
          width={120}
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
        />

        {/* Status */}
        <div className="flex items-center gap-2 text-t2 text-sm font-mono uppercase">
          <span className="w-2 h-2 bg-red rounded-full pulse" />
          <span className="tracking-[0.06em]">Monitoramento ativo</span>
        </div>
      </div>
    </div>
  )
}
