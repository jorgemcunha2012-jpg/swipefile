import { AlertCircle } from 'lucide-react'
import { forwardRef } from 'react'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'var(--s1)',
  border: '1px solid var(--b1)',
  borderRadius: 3,
  padding: '12px 14px',
  fontFamily: 'IBM Plex Mono, monospace',
  fontSize: 14,
  color: 'var(--t1)',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, id, ...rest }, ref) {
    const fieldId = id ?? label.toLowerCase().replace(/\s/g, '-')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor={fieldId}
          style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          {...rest}
          style={{
            ...inputBase,
            borderColor: error ? 'rgba(224,53,42,0.6)' : 'var(--b1)',
            background: error ? 'rgba(224,53,42,0.04)' : 'var(--s1)',
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
