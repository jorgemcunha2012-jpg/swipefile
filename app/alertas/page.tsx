'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

interface Alert {
  id: string
  type: 'offer' | 'niche' | 'competitor' | 'milestone'
  title: string
  description: string
  trigger: string
  enabled: boolean
  last_triggered: string | null
  triggered_count: number
}

interface AlertLog {
  id: string
  alert_id: string
  alert_title: string
  timestamp: string
  details: string
  severity: 'info' | 'warning' | 'critical'
}

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'offer',
    title: 'Nova Oferta em Emagrecimento',
    description: 'Alerta quando uma nova oferta é detectada no nicho de emagrecimento',
    trigger: 'Niche = "Emagrecimento"',
    enabled: true,
    last_triggered: '2024-05-07 14:32',
    triggered_count: 45,
  },
  {
    id: '2',
    type: 'niche',
    title: 'Nicho em Tendência',
    description: 'Alerta quando um nicho começa a tendenciar (momentum > 80)',
    trigger: 'Momentum > 80',
    enabled: true,
    last_triggered: '2024-05-07 10:15',
    triggered_count: 12,
  },
  {
    id: '3',
    type: 'competitor',
    title: 'Atividade de Competidores',
    description: 'Alerta sobre movimentos de competidores principais',
    trigger: 'Ads > 50 in 24h',
    enabled: true,
    last_triggered: '2024-05-06 18:42',
    triggered_count: 23,
  },
  {
    id: '4',
    type: 'milestone',
    title: 'Oferta Ativa por 30 Dias',
    description: 'Alerta quando uma oferta completa 30 dias de atividade',
    trigger: 'Days Active = 30',
    enabled: false,
    last_triggered: '2024-05-01 08:00',
    triggered_count: 8,
  },
]

const MOCK_LOGS: AlertLog[] = [
  {
    id: '1',
    alert_id: '1',
    alert_title: 'Nova Oferta em Emagrecimento',
    timestamp: '2024-05-07 14:32',
    details: 'Kit Emagrecimento Rápido 2024 foi detectado no Facebook',
    severity: 'info',
  },
  {
    id: '2',
    alert_id: '2',
    alert_title: 'Nicho em Tendência',
    timestamp: '2024-05-07 10:15',
    details: 'Fitness & Suplementos alcançou momentum de 87',
    severity: 'warning',
  },
  {
    id: '3',
    alert_id: '3',
    alert_title: 'Atividade de Competidores',
    timestamp: '2024-05-06 18:42',
    details: 'Skincare Premium Anti-Aging criou 12 novos anúncios em 24h',
    severity: 'critical',
  },
  {
    id: '4',
    alert_id: '1',
    alert_title: 'Nova Oferta em Emagrecimento',
    timestamp: '2024-05-06 09:28',
    details: 'Suplemento Emagrecedor Premium foi detectado no Instagram',
    severity: 'info',
  },
  {
    id: '5',
    alert_id: '2',
    alert_title: 'Nicho em Tendência',
    timestamp: '2024-05-05 16:50',
    details: 'Educação Digital alcançou momentum de 81',
    severity: 'warning',
  },
]

const typeIcons = {
  'offer': '📢',
  'niche': '📈',
  'competitor': '⚔️',
  'milestone': '🎯',
}

const severityColors = {
  'info': 'bg-s1 border-b1 text-t2',
  'warning': 'bg-rd border-red text-red',
  'critical': 'bg-red bg-opacity-10 border-red text-red',
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [logs] = useState<AlertLog[]>(MOCK_LOGS)
  const [activeTab, setActiveTab] = useState<'alerts' | 'logs'>('alerts')

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
  }

  const stats = {
    active: alerts.filter(a => a.enabled).length,
    total: alerts.length,
    totalTriggered: alerts.reduce((sum, a) => sum + a.triggered_count, 0),
    recentLogs: logs.filter(l => {
      const date = new Date(l.timestamp)
      const now = new Date()
      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      return diffHours < 24
    }).length,
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-syne font-900 text-t1 mb-2">Alertas</h1>
          <p className="text-sm font-mono text-t3 uppercase tracking-[0.05em]">
            Notificações automáticas de mercado e movimentos competitivos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-s1 border border-b1 rounded-[2px] overflow-hidden">
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0 bg-rd">
            <div className="text-3xl font-syne font-900 text-red mb-2">{stats.active}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Alertas Ativos</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.total}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Total Configurados</div>
          </div>
          <div className="bg-s2 px-6 py-5 border-r border-b1 last:border-r-0">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.totalTriggered}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Acionamentos Total</div>
          </div>
          <div className="bg-s2 px-6 py-5">
            <div className="text-3xl font-syne font-900 text-t1 mb-2">{stats.recentLogs}</div>
            <div className="text-sm font-mono uppercase tracking-[0.05em] text-t3">Últimas 24h</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-b1">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-3 text-sm font-mono uppercase tracking-[0.05em] border-b-2 transition-all ${
              activeTab === 'alerts'
                ? 'border-red text-red'
                : 'border-transparent text-t3 hover:text-t2'
            }`}
          >
            Alertas Configurados
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 text-sm font-mono uppercase tracking-[0.05em] border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-red text-red'
                : 'border-transparent text-t3 hover:text-t2'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Alerts List */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-s2 border border-b1 rounded-[2px] hover:border-b2 hover:bg-s3 transition-all p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{typeIcons[alert.type]}</span>
                      <h3 className="text-base font-syne font-700 text-t1">{alert.title}</h3>
                      <span className={`text-xs font-mono px-2 py-1 rounded-[2px] uppercase tracking-[0.05em] ${alert.enabled ? 'bg-rd border border-red text-red' : 'bg-s1 border border-b1 text-t3'}`}>
                        {alert.enabled ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-t3 mb-2">{alert.description}</p>
                    <div className="text-xs font-mono text-t2">
                      Gatilho: <span className="text-t1">{alert.trigger}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 ml-6">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.05em] rounded-[2px] transition-all ${
                        alert.enabled
                          ? 'bg-rd border border-red text-red hover:bg-red hover:text-bg'
                          : 'bg-s1 border border-b1 text-t2 hover:bg-s3'
                      }`}
                    >
                      {alert.enabled ? 'Desativar' : 'Ativar'}
                    </button>
                    <div className="text-right">
                      <div className="text-xs font-mono text-t3 mb-1">Acionado</div>
                      <div className="text-sm font-syne font-700 text-t1">{alert.triggered_count}x</div>
                    </div>
                    {alert.last_triggered && (
                      <div className="text-right">
                        <div className="text-xs font-mono text-t3 mb-1">Último</div>
                        <div className="text-xs font-mono text-t2">{alert.last_triggered}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-[2px] p-4 ${severityColors[log.severity]} hover:bg-opacity-[0.08] transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-syne font-700 mb-1">{log.alert_title}</h4>
                    <p className="text-sm font-mono mb-2">{log.details}</p>
                    <div className="text-xs font-mono text-t3">{log.timestamp}</div>
                  </div>
                  <div className="text-xs font-mono uppercase tracking-[0.05em] px-2 py-1 rounded-[2px] bg-current bg-opacity-20 whitespace-nowrap">
                    {log.severity === 'critical' && '🔴'}
                    {log.severity === 'warning' && '🟡'}
                    {log.severity === 'info' && '🔵'}
                    {' '}{log.severity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
