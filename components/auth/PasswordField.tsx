'use client'

import { useState, forwardRef } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  showStrength?: boolean
}

function getStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const STRENGTH_LABELS = { en: ['', 'Weak', 'Fair', 'Good', 'Strong'], pt: ['', 'Fraca', 'Média', 'Boa', 'Forte'] }
const STRENGTH_COLORS = ['', '#E0352A', '#8A6020', 'var(--t2)', '#2A6A3A']

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, showStrength, id, value, onChange, ...rest }, ref) {
    const [show, setShow] = useState(false)
    const strScore = showStrength ? getStrength(String(value ?? '')) : 0
    const fieldId = id ?? 'password'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor={fieldId}
          style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {label}
        </label>

        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            id={fieldId}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            {...rest}
            style={{
              width: '100%',
              background: error ? 'rgba(224,53,42,0.04)' : 'var(--s1)',
              border: `1px solid ${error ? 'rgba(224,53,42,0.6)' : 'var(--b1)'}`,
              borderRadius: 3,
              padding: '12px 42px 12px 14px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 14,
              color: 'var(--t1)',
              outline: 'none',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? 'rgba(224,53,42,0.6)' : 'var(--b2)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(224,53,42,0.08)'
              rest.onFocus?.(e)
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = error ? 'rgba(224,53,42,0.6)' : 'var(--b1)'
              rest.onBlur?.(e)
            }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)',
              padding: 2, display: 'flex', alignItems: 'center',
            }}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Strength bar */}
        {showStrength && String(value ?? '').length > 0 && (
          <div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map((seg) => (
                <div key={seg} style={{
                  flex: 1, height: 2, borderRadius: 1,
                  background: strScore >= seg ? STRENGTH_COLORS[strScore] : 'var(--b2)',
                  transition: 'background 200ms',
                }} />
              ))}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: STRENGTH_COLORS[strScore] || 'var(--t3)', textAlign: 'right', marginTop: 3 }}>
              {STRENGTH_LABELS['en'][strScore]}
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={12} color="#E0352A" />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#E0352A' }}>{error}</span>
          </div>
        )}
      </div>
    )
  }
)
