import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(224,53,42,0.10)',
        border: '1px solid rgba(224,53,42,0.30)',
        borderRadius: 3,
        padding: '10px 14px',
      }}
    >
      <AlertCircle size={15} color="#E0352A" style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: '#E0352A', lineHeight: 1.4 }}>
        {message}
      </span>
    </motion.div>
  )
}
