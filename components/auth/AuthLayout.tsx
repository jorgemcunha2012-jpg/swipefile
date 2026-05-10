'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BrandPanel } from './BrandPanel'

type Lang = 'en' | 'pt'

interface AuthLayoutProps {
  lang: Lang
  onLangChange: (l: Lang) => void
  children: React.ReactNode
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--b2)', borderRadius: 3, overflow: 'hidden' }}>
      {(['en', 'pt'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '6px 12px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 10,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            background: lang === l ? 'var(--s3)' : 'transparent',
            color: lang === l ? 'var(--t1)' : 'var(--t3)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function AuthLayout({ lang, onLangChange, children }: AuthLayoutProps) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'IBM Plex Mono, monospace' }}>

      {/* Topbar */}
      <header style={{
        height: 44,
        background: 'var(--s1)',
        borderBottom: '1px solid var(--b2)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/logocoompleta.png"
            alt="Raven Spy"
            height={26}
            width={104}
            style={{ objectFit: 'contain', objectPosition: 'left center' }}
            priority
          />
        </Link>
        <LangToggle lang={lang} setLang={onLangChange} />
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '45% 55%', minHeight: 0 }}>

        {/* Brand panel — hidden on narrow screens via inline media */}
        <div className="hidden lg:block" style={{ minHeight: 'calc(100vh - 44px)' }}>
          <BrandPanel lang={lang} />
        </div>

        {/* Form panel */}
        <div
          className="lg:col-start-2 col-span-full lg:col-span-1"
          style={{
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
