'use client'

type PlanId = 'free' | 'pro'

interface Plan {
  id: PlanId
  name: string
  desc: string
}

interface PlanSelectorProps {
  value: PlanId
  onChange: (p: PlanId) => void
  label: string
  plans: Plan[]
}

export function PlanSelector({ value, onChange, label, plans }: PlanSelectorProps) {
  return (
    <div>
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {plans.map((plan) => {
          const selected = value === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onChange(plan.id)}
              style={{
                background: selected ? 'rgba(224,53,42,0.10)' : 'var(--s1)',
                border: `1px solid ${selected ? 'rgba(224,53,42,0.40)' : 'var(--b1)'}`,
                borderRadius: 3,
                padding: '12px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 150ms, background 150ms',
              }}
            >
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 12,
                fontWeight: 500,
                color: selected ? 'var(--t1)' : 'var(--t2)',
                marginBottom: 3,
              }}>
                {plan.name}
              </div>
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 11,
                color: 'var(--t3)',
                lineHeight: 1.4,
              }}>
                {plan.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
