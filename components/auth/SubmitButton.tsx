'use client'

interface SubmitButtonProps {
  loading: boolean
  label: string
  loadingLabel: string
  disabled?: boolean
}

export function SubmitButton({ loading, label, loadingLabel, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      style={{
        width: '100%',
        background: loading || disabled ? 'rgba(224,53,42,0.6)' : '#E0352A',
        color: 'white',
        border: 'none',
        borderRadius: 3,
        padding: '14px',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'background 150ms, box-shadow 150ms',
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.background = '#B8241A'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(224,53,42,0.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.background = '#E0352A'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {loading && (
        <span style={{
          display: 'inline-block',
          width: 14,
          height: 14,
          border: '2px solid rgba(255,255,255,0.25)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }} />
      )}
      {loading ? loadingLabel : label}
    </button>
  )
}
