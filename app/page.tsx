'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Monitor, ChevronDown, TrendingUp, Zap, Film, Bookmark, Filter, BarChart2 } from 'lucide-react'

type Lang = 'en' | 'pt'

const T = {
  en: {
    btn_login: 'Login',
    btn_signup: 'Get Started',
    nav_pricing: 'Pricing',
    tagline: 'We spy. You copy.',
    badge: '4,000+ offers · Updated every hour',
    h1a: "The world's largest",
    h1b: 'spy offer database.',
    sub: 'TikTok, Facebook and YouTube. White, grey and black market offers.\nEvery niche, every language, every geo — updated every hour.',
    cta: 'Start for free →',
    cta2: 'Login',
    micro: 'No credit card required · Instant access · Upgrade anytime',
    sp: [
      { num: '4,000+', label: 'offers monitored' },
      { num: 'White · Grey · Black', label: 'all market types covered' },
      { num: 'Every hour', label: 'the database updates' },
    ],
    prob_label: 'THE PROBLEM',
    prob_h: ["By the time you see it,", "it's already too late."],
    prob_body: [
      "When an offer starts showing up on your feed, there are already 300 ads running. CPMs are up. The audience is tired. The early movers already scaled.",
      "That's not a skill problem. That's an intel problem.",
      "The ones who get in first always win more with less. That's how it's always worked.",
    ],
    what_label: 'WHAT IS RAVENSPY',
    what_h: ["Market intelligence for people", "who actually run traffic."],
    what_sub: "RavenSpy scans TikTok, Facebook and YouTube ad libraries every hour and organizes everything into one tool. You open it and you already know what's hot — in any market, any language, any offer type.",
    what_hl: "White market. Grey market. Black market. No filters. No judgement.\nYou see everything that's running. You decide what to do with it.",
    what_features: [
      { label: 'VSL breakdown', desc: "Mechanism, structure and what's making it convert" },
      { label: 'Top creatives mapped', desc: 'Hook, body and CTA of every high-performance ad' },
      { label: '90-day volume chart', desc: "See if it's still climbing or already past its peak" },
      { label: 'Opportunity score', desc: "Know instantly if it's worth entering or waiting" },
      { label: 'Full swipe file', desc: 'Save, organize and access whenever you want' },
      { label: 'White · Grey · Black filter', desc: 'See exactly what category every offer falls into' },
    ],
    scale_h: 'No tool in the world covers this.',
    scale_cols: [
      { num: '4,000+', sub: 'Offers', desc: 'White, grey and black market.\nEvery niche. Every angle.\nAll in one place.' },
      { num: '3', sub: 'Platforms', desc: 'TikTok Ads. Facebook Ads. YouTube.\nThe three biggest traffic sources\nmonitored simultaneously.' },
      { num: 'Every hour', sub: '', desc: "Not daily. Not weekly.\nEvery single hour the database updates.\nYou see what's scaling right now." },
    ],
    how_h: 'Three steps. No fluff.',
    steps: [
      { num: '01', title: 'Create your free account', desc: 'Sign up and access the radar instantly. No credit card. No commitment. See live offers, volume charts and opportunity scores right away.', badge: 'Free' },
      { num: '02', title: 'Find your offer', desc: 'Filter by platform, niche, market, language and offer type — white, grey or black. Dive into any offer: VSL, creatives, copy analysis and 90-day ad volume.', badge: null },
      { num: '03', title: 'Run it', desc: 'Upgrade to unlock the full swipe file and unrestricted access. You have the map. Now execute.', badge: null },
    ],
    pricing_label: 'PRICING',
    pricing_h: 'Choose your access level.',
    pricing_sub: "Start free. Upgrade when you're ready.",
    plans: [
      {
        name: 'FREE', price: '$0', period: '', badge: null,
        features: [
          { text: 'Live radar with opportunity scoring', hi: false },
          { text: 'Offer previews — VSL, creatives and volume chart', hi: false },
          { text: 'White · Grey · Black filter', hi: false },
          { text: 'Limited swipe file access', hi: false },
          { text: "See what's scaling — upgrade to copy it all", hi: false },
        ],
        cta: 'Start for free', micro: 'No credit card required', solid: false,
      },
      {
        name: 'PRO', price: '$25', period: '/ month', badge: 'Best Value',
        features: [
          { text: 'Everything in Free — fully unlocked', hi: false },
          { text: 'Facebook Ads + YouTube offers', hi: true },
          { text: 'Full swipe file — save and organize unlimited offers', hi: false },
          { text: 'VSL and creative analysis without restrictions', hi: false },
          { text: 'All market types: white, grey and black', hi: false },
          { text: 'Filters by niche, platform, market and language', hi: false },
          { text: 'Alerts when an offer starts exploding', hi: false },
        ],
        cta: 'Start Pro', micro: 'Instant access · Cancel anytime · 7-day money back', solid: true,
      },
      {
        name: 'ULTRA ⚡', price: '$40', period: '/ month', badge: 'Most Popular',
        features: [
          { text: 'Everything in Pro', hi: false },
          { text: 'TikTok Ads offers included', hi: true },
          { text: 'Fastest-moving platform — scale harder, saturate quicker', hi: false },
          { text: 'Native TikTok creatives mapped (3s hook, structure, captions)', hi: false },
          { text: 'First access to new offers as they enter the database', hi: false },
          { text: 'White, grey and black TikTok — hardest intel to find anywhere', hi: false },
        ],
        cta: 'Start Ultra', micro: 'Instant access · Cancel anytime · 7-day money back', solid: true,
      },
    ],
    who_h: 'Built for operators. Not students.',
    who_list: [
      'Media buyers who want to enter offers before the market saturates',
      'Affiliates who test new products every week and need validated references',
      'Traffic managers who handle clients and need to validate niches fast',
      'Digital entrepreneurs who want to launch using already-proven copy models',
      'Grey and black market operators who need intel without limitations',
    ],
    who_disc: "If you don't know what CTR, hook or VSL means — this tool isn't for you yet.",
    who_desktop: 'RavenSpy is a desktop tool. Built for serious work at a computer — not for scrolling on your phone.',
    faq_h: 'Straight questions. Straight answers.',
    faqs: [
      { q: 'What can I see for free?', a: "You can create an account and access the live radar, offer previews, volume charts and opportunity scores. You won't have full swipe file access or unrestricted offer details — that's what the paid plans unlock." },
      { q: 'What markets does RavenSpy cover?', a: 'All of them. Filter by Brazil, Hispanic market, USA, Europe and more. Every language, every geo.' },
      { q: 'Does RavenSpy cover grey and black market offers?', a: 'Yes. White, grey and black — all in the database, all filterable. You see everything. No restrictions on what you can research.' },
      { q: 'How often is it updated?', a: 'Every hour. The radar runs continuously. Alerts fire when an offer spikes in volume.' },
      { q: "What's the difference between Pro and Ultra?", a: 'Pro covers Facebook and YouTube. Ultra adds TikTok. TikTok moves faster — offers scale harder and saturate quicker. If you run TikTok or want to start, go Ultra.' },
      { q: 'Can I cancel anytime?', a: "Yes. No contracts, no retention calls, no friction. Two clicks and you're out." },
      { q: 'Is there a trial?', a: "Better than a trial — the free plan lets you see the radar and explore offers before you pay anything. Upgrade when you've seen enough to know it's worth it." },
    ],
    final_h1: 'The raven is already watching.',
    final_h2: "You're not.",
    final_sub: "Right now, while you're reading this, someone just found the next offer that's about to scale. White, grey or black — it's already in the database.",
    final_cta: 'Start for free →',
    final_cta2: 'See the plans',
    final_micro: 'No credit card · Instant access · Upgrade anytime',
    footer_desc: 'Market intelligence for people who run traffic.',
    footer_product: 'Product',
    footer_nav: ['Radar', 'Pricing', 'FAQ'],
    footer_nav_hrefs: ['/radar', '#pricing', '#faq'],
    footer_legal: 'Legal',
    footer_legal_links: ['Privacy Policy', 'Terms of Service'],
  },
  pt: {
    btn_login: 'Entrar',
    btn_signup: 'Cadastrar',
    nav_pricing: 'Planos',
    tagline: 'Nós espiamos. Você copia.',
    badge: '4.000+ ofertas · Atualizado toda hora',
    h1a: 'A maior base de',
    h1b: 'ofertas espionadas do mundo.',
    sub: 'TikTok, Facebook e YouTube. Ofertas white, grey e black market.\nTodo nicho, todo idioma, todo geo — atualizado toda hora.',
    cta: 'Começar de graça →',
    cta2: 'Entrar',
    micro: 'Sem cartão de crédito · Acesso imediato · Upgrade quando quiser',
    sp: [
      { num: '4.000+', label: 'ofertas monitoradas' },
      { num: 'White · Grey · Black', label: 'todos os tipos de mercado' },
      { num: 'Toda hora', label: 'o banco de dados atualiza' },
    ],
    prob_label: 'O PROBLEMA',
    prob_h: ["Quando você vê,", "já é tarde demais."],
    prob_body: [
      "Quando uma oferta começa a aparecer no seu feed, já tem 300 anúncios rodando. CPM subiu. Audiência cansou. Os primeiros já escalaram.",
      "Isso não é problema de habilidade. É problema de inteligência.",
      "Quem entra primeiro sempre ganha mais com menos. Sempre foi assim.",
    ],
    what_label: 'O QUE É O RAVENSPY',
    what_h: ["Inteligência de mercado para quem", "realmente trafega."],
    what_sub: "O RavenSpy escaneia as bibliotecas de anúncios do TikTok, Facebook e YouTube toda hora e organiza tudo em uma ferramenta só. Você abre e já sabe o que está quente — em qualquer mercado, idioma ou tipo de oferta.",
    what_hl: "White market. Grey market. Black market. Sem filtros. Sem julgamento.\nVocê vê tudo que está rodando. Você decide o que fazer com isso.",
    what_features: [
      { label: 'Análise de VSL', desc: 'Mecanismo, estrutura e o que está convertendo' },
      { label: 'Criativos mapeados', desc: 'Hook, body e CTA de cada anúncio de alta performance' },
      { label: 'Gráfico de 90 dias', desc: 'Veja se ainda está subindo ou já passou do pico' },
      { label: 'Score de oportunidade', desc: 'Saiba na hora se vale entrar ou esperar' },
      { label: 'Swipe file completo', desc: 'Salve, organize e acesse quando quiser' },
      { label: 'Filtro White · Grey · Black', desc: 'Veja exatamente em que categoria cada oferta se encaixa' },
    ],
    scale_h: 'Nenhuma ferramenta no mundo cobre isso.',
    scale_cols: [
      { num: '4.000+', sub: 'Ofertas', desc: 'White, grey e black market.\nTodo nicho. Todo ângulo.\nTudo em um lugar.' },
      { num: '3', sub: 'Plataformas', desc: 'TikTok Ads. Facebook Ads. YouTube.\nAs três maiores fontes de tráfego\nmonitoradas simultaneamente.' },
      { num: 'Toda hora', sub: '', desc: 'Não diário. Não semanal.\nToda hora o banco atualiza.\nVocê vê o que está escalando agora.' },
    ],
    how_h: 'Três passos. Sem enrolação.',
    steps: [
      { num: '01', title: 'Crie sua conta grátis', desc: 'Cadastre e acesse o radar na hora. Sem cartão. Sem compromisso. Veja ofertas ao vivo, gráficos de volume e scores já.', badge: 'Grátis' },
      { num: '02', title: 'Encontre sua oferta', desc: 'Filtre por plataforma, nicho, mercado, idioma e tipo — white, grey ou black. Mergulhe em qualquer oferta: VSL, criativos, análise de copy e volume de 90 dias.', badge: null },
      { num: '03', title: 'Execute', desc: 'Faça upgrade para desbloquear o swipe file completo e acesso irrestrito. Você tem o mapa. Agora execute.', badge: null },
    ],
    pricing_label: 'PLANOS',
    pricing_h: 'Escolha seu nível de acesso.',
    pricing_sub: 'Comece de graça. Faça upgrade quando estiver pronto.',
    plans: [
      {
        name: 'GRÁTIS', price: '$0', period: '', badge: null,
        features: [
          { text: 'Radar ao vivo com score de oportunidade', hi: false },
          { text: 'Preview de ofertas — VSL, criativos e gráfico', hi: false },
          { text: 'Filtro White · Grey · Black', hi: false },
          { text: 'Acesso limitado ao swipe file', hi: false },
          { text: 'Veja o que está escalando — upgrade para copiar tudo', hi: false },
        ],
        cta: 'Começar de graça', micro: 'Sem cartão de crédito', solid: false,
      },
      {
        name: 'PRO', price: '$25', period: '/ mês', badge: 'Melhor Custo',
        features: [
          { text: 'Tudo do Grátis — totalmente desbloqueado', hi: false },
          { text: 'Ofertas do Facebook Ads + YouTube', hi: true },
          { text: 'Swipe file completo — salve ofertas ilimitadas', hi: false },
          { text: 'Análise de VSL e criativos sem restrições', hi: false },
          { text: 'Todos os mercados: white, grey e black', hi: false },
          { text: 'Filtros por nicho, plataforma, mercado e idioma', hi: false },
          { text: 'Alertas quando uma oferta começar a explodir', hi: false },
        ],
        cta: 'Começar Pro', micro: 'Acesso imediato · Cancele quando quiser · Garantia 7 dias', solid: true,
      },
      {
        name: 'ULTRA ⚡', price: '$40', period: '/ mês', badge: 'Mais Popular',
        features: [
          { text: 'Tudo do Pro', hi: false },
          { text: 'Ofertas do TikTok Ads incluídas', hi: true },
          { text: 'A plataforma mais rápida — escala mais forte, satura mais rápido', hi: false },
          { text: 'Criativos nativos do TikTok mapeados (hook 3s, estrutura, legendas)', hi: false },
          { text: 'Primeiro acesso a novas ofertas ao entrar no banco', hi: false },
          { text: 'TikTok white, grey e black — a intel mais difícil de encontrar', hi: false },
        ],
        cta: 'Começar Ultra', micro: 'Acesso imediato · Cancele quando quiser · Garantia 7 dias', solid: true,
      },
    ],
    who_h: 'Feito para operadores. Não para estudantes.',
    who_list: [
      'Media buyers que querem entrar em ofertas antes do mercado saturar',
      'Afiliados que testam novos produtos toda semana e precisam de referências validadas',
      'Gestores de tráfego que atendem clientes e precisam validar nichos rápido',
      'Empreendedores digitais que querem lançar usando modelos de copy já provados',
      'Operadores grey e black market que precisam de intel sem limitações',
    ],
    who_disc: 'Se você não sabe o que é CTR, hook ou VSL — essa ferramenta ainda não é pra você.',
    who_desktop: 'O RavenSpy é uma ferramenta desktop. Feita para trabalho sério no computador — não para scroll no celular.',
    faq_h: 'Perguntas diretas. Respostas diretas.',
    faqs: [
      { q: 'O que posso ver de graça?', a: 'Você pode criar uma conta e acessar o radar ao vivo, previews de ofertas, gráficos de volume e scores de oportunidade. Você não terá acesso completo ao swipe file nem detalhes irrestritos — isso é o que os planos pagos desbloqueiam.' },
      { q: 'Quais mercados o RavenSpy cobre?', a: 'Todos. Filtre por Brasil, mercado hispânico, EUA, Europa e mais. Todo idioma, todo geo.' },
      { q: 'O RavenSpy cobre ofertas grey e black market?', a: 'Sim. White, grey e black — tudo no banco, tudo filtrável. Você vê tudo. Sem restrições no que pode pesquisar.' },
      { q: 'Com que frequência atualiza?', a: 'Toda hora. O radar roda continuamente. Alertas disparam quando uma oferta sobe em volume.' },
      { q: 'Qual a diferença entre Pro e Ultra?', a: 'Pro cobre Facebook e YouTube. Ultra adiciona TikTok. TikTok é mais rápido — ofertas escalam mais forte e saturam mais rápido. Se você roda TikTok ou quer começar, vai de Ultra.' },
      { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem contratos, sem ligações de retenção, sem atrito. Dois cliques e tchau.' },
      { q: 'Tem período de teste?', a: 'Melhor que teste — o plano grátis te deixa ver o radar e explorar ofertas antes de pagar qualquer coisa. Faça upgrade quando tiver visto o suficiente para saber que vale.' },
    ],
    final_h1: 'O corvo já está observando.',
    final_h2: 'Você não.',
    final_sub: 'Agora mesmo, enquanto você lê isso, alguém achou a próxima oferta que vai escalar. White, grey ou black — já está no banco.',
    final_cta: 'Começar de graça →',
    final_cta2: 'Ver os planos',
    final_micro: 'Sem cartão · Acesso imediato · Upgrade quando quiser',
    footer_desc: 'Inteligência de mercado para quem trafega.',
    footer_product: 'Produto',
    footer_nav: ['Radar', 'Planos', 'FAQ'],
    footer_nav_hrefs: ['/radar', '#pricing', '#faq'],
    footer_legal: 'Legal',
    footer_legal_links: ['Política de Privacidade', 'Termos de Uso'],
  },
}

// ─── Hero Radar ──────────────────────────────────────────────────────────────

const RADAR_SWEEP_S = 3

const MOCK_OFFERS = [
  { name: 'Suplemento Pré-Treino X', niche: 'suplementos', tag: 'escalating', ads: 847, platform: 'meta' },
  { name: 'Método Emagrecimento 30d', niche: 'emagrecimento', tag: 'hot', ads: 1203, platform: 'tiktok' },
  { name: 'Curso Trader Iniciante', niche: 'financas', tag: 'escalating', ads: 592, platform: 'meta' },
  { name: 'Skincare Anti-Age Premium', niche: 'beleza', tag: 'hot', ads: 934, platform: 'youtube' },
  { name: 'Adestramento Online', niche: 'pet', tag: 'escalating', ads: 441, platform: 'tiktok' },
  { name: 'Vitamina D3+K2 Premium', niche: 'saude', tag: 'hot', ads: 1089, platform: 'meta' },
  { name: 'Renda Extra Afiliados', niche: 'financas', tag: 'escalating', ads: 765, platform: 'tiktok' },
  { name: 'VSL Creatina Ultra', niche: 'suplementos', tag: 'escalating', ads: 512, platform: 'meta' },
  { name: 'Vestido Verão Collection', niche: 'moda', tag: 'stable', ads: 287, platform: 'meta' },
  { name: 'SmartWatch Pro Series', niche: 'tecnologia', tag: 'stable', ads: 198, platform: 'tiktok' },
]

function heroBlipDelay(topPct: number, leftPct: number) {
  const dx = leftPct - 50
  const dy = topPct - 50
  const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
  return `${((deg / 360) * RADAR_SWEEP_S).toFixed(2)}s`
}

const HERO_BLIPS = [
  { top: 22, left: 62 },
  { top: 58, left: 76 },
  { top: 71, left: 34 },
  { top: 27, left: 27 },
  { top: 44, left: 18 },
  { top: 80, left: 57 },
  { top: 17, left: 47 },
  { top: 63, left: 53 },
].map((b) => ({ ...b, delay: heroBlipDelay(b.top, b.left) }))

interface FeedEntry {
  key: string
  name: string
  niche: string
  tag: string
  ads: number
  platform: string
  time: string
}

function HeroRadar() {
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [count, setCount] = useState(4127)
  const idxRef = useRef(0)

  useEffect(() => {
    const add = () => {
      const o = MOCK_OFFERS[idxRef.current % MOCK_OFFERS.length]
      const t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setFeed((prev) => [{ key: `${idxRef.current}-${Date.now()}`, ...o, time: t }, ...prev].slice(0, 7))
      setCount((c) => c + Math.floor(Math.random() * 3) + 1)
      idxRef.current++
    }
    add()
    const timer = setInterval(add, 2600)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="relative rounded-[6px] overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'var(--s1)' }}
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(204,42,30,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(204,42,30,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Red edge glow */}
      <div className="absolute inset-0 pointer-events-none rounded-[6px]" style={{
        boxShadow: '0 0 80px 8px rgba(204,42,30,0.07), inset 0 0 40px 4px rgba(204,42,30,0.03)',
      }} />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#CC2A1E', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#CC2A1E' }}>
            Monitoramento ativo
          </span>
        </div>
        <div className="font-mono text-[11px]">
          <span className="font-syne font-[800] text-[15px]" style={{ color: 'var(--t1)' }}>
            {count.toLocaleString('pt-BR')}
          </span>
          <span style={{ color: 'var(--t3)' }}> detectadas</span>
        </div>
      </div>

      {/* Body: radar + feed */}
      <div className="relative flex">

        {/* Radar scope */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4 p-5 pr-4" style={{ width: 200 }}>
          <div className="relative" style={{ width: 158, height: 158 }}>
            {/* Concentric rings */}
            {[100, 66, 33].map((pct, i) => (
              <div key={i} className="absolute rounded-full" style={{
                inset: `${(100 - pct) / 2}%`,
                border: `1px solid rgba(204,42,30,${0.10 + i * 0.04})`,
              }} />
            ))}
            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <div className="w-full h-px" style={{ background: 'rgba(204,42,30,0.06)' }} />
            </div>
            <div className="absolute inset-0 flex justify-center pointer-events-none">
              <div className="h-full w-px" style={{ background: 'rgba(204,42,30,0.06)' }} />
            </div>
            {/* Sweep glow (conic) */}
            <div className="absolute inset-0 rounded-full overflow-hidden"
              style={{ animation: `radar-sweep ${RADAR_SWEEP_S}s linear infinite` }}>
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(from 0deg,
                  transparent 0deg,
                  transparent 200deg,
                  rgba(204,42,30,0.02) 250deg,
                  rgba(204,42,30,0.09) 300deg,
                  rgba(204,42,30,0.38) 350deg,
                  rgba(204,42,30,0.80) 357deg,
                  rgba(255,90,80,1) 360deg
                )`,
              }} />
            </div>
            {/* Sweep tip line */}
            <div className="absolute inset-0 flex items-center pointer-events-none"
              style={{ animation: `radar-sweep ${RADAR_SWEEP_S}s linear infinite`, transformOrigin: 'center' }}>
              <div className="w-1/2 ml-auto" style={{
                height: 2,
                background: 'linear-gradient(to right, transparent 0%, rgba(204,42,30,0.4) 35%, rgba(255,100,90,1) 100%)',
                boxShadow: '0 0 7px 1px rgba(204,42,30,0.75)',
              }} />
            </div>
            {/* Blips */}
            {HERO_BLIPS.map((b, i) => (
              <div key={i} className="absolute" style={{ top: `${b.top}%`, left: `${b.left}%` }}>
                <div className="absolute" style={{
                  width: 7, height: 7,
                  background: '#CC2A1E',
                  boxShadow: '0 0 7px 2px rgba(204,42,30,0.85)',
                  animation: `radar-blip ${RADAR_SWEEP_S}s ${b.delay} ease-out infinite`,
                }} />
                <div className="absolute rounded-full" style={{
                  width: 6, height: 6,
                  border: '1px solid #CC2A1E',
                  animation: `radar-ping ${RADAR_SWEEP_S}s ${b.delay} ease-out infinite`,
                }} />
              </div>
            ))}
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full" style={{
                width: 8, height: 8,
                background: '#CC2A1E',
                boxShadow: '0 0 12px 3px rgba(204,42,30,0.75)',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            </div>
            {/* Outer border */}
            <div className="absolute inset-0 rounded-full" style={{
              border: '1px solid rgba(204,42,30,0.22)',
              boxShadow: '0 0 24px 3px rgba(204,42,30,0.08), inset 0 0 24px 3px rgba(204,42,30,0.04)',
            }} />
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-5 w-full justify-center">
            {[{ label: 'Hot', val: 23 }, { label: 'Esc.', val: 48 }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-syne font-[800] text-[18px] leading-none" style={{ color: '#CC2A1E' }}>{s.val}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] mt-0.5" style={{ color: 'var(--t3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex-shrink-0 w-px my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Detection feed */}
        <div className="flex-1 py-4 px-4 min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--t3)' }}>
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: '#CC2A1E', animation: 'pulse 1.4s ease-in-out infinite' }} />
            Log de detecção
          </div>
          <div>
            {feed.map((entry, i) => {
              const isHot = entry.tag === 'hot' || entry.tag === 'escalating'
              return (
                <div
                  key={entry.key}
                  className="flex items-start gap-2 py-2 border-b"
                  style={{
                    opacity: i === 0 ? 1 : Math.max(0.06, 1 - i * 0.17),
                    borderColor: 'rgba(255,255,255,0.05)',
                    transition: 'opacity 0.5s',
                  }}
                >
                  <span className="font-mono text-[9px] flex-shrink-0 tabular-nums mt-px" style={{ color: 'var(--t3)' }}>
                    {entry.time}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] font-[600] truncate mb-1" style={{ color: i === 0 ? 'var(--t1)' : 'var(--t2)' }}>
                      {entry.name}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px]" style={{
                        background: isHot ? 'rgba(204,42,30,0.14)' : 'rgba(255,255,255,0.04)',
                        color: isHot ? '#CC2A1E' : 'var(--t3)',
                        border: `1px solid ${isHot ? 'rgba(204,42,30,0.28)' : 'rgba(255,255,255,0.07)'}`,
                      }}>
                        {entry.tag}
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: 'var(--t3)' }}>
                        {entry.ads.toLocaleString('pt-BR')} ads · {entry.platform}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center gap-5 px-5 py-2.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        {[
          { label: 'Meta', val: '2.1k' },
          { label: 'TikTok', val: '1.4k' },
          { label: 'YouTube', val: '627' },
        ].map((p) => (
          <div key={p.label} className="flex items-center gap-1">
            <span className="font-syne font-[700] text-[11px]" style={{ color: 'var(--t1)' }}>{p.val}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.06em]" style={{ color: 'var(--t3)' }}>{p.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full" style={{ background: '#CC2A1E' }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--t3)' }}>ciclo 1h</span>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Logo({ lang }: { lang: Lang }) {
  return (
    <div className="flex-shrink-0">
      <div className="font-syne font-[800] text-[15px] tracking-[0.06em] uppercase leading-none">
        <span style={{ color: 'var(--t1)' }}>RAVEN</span>
        <span style={{ color: '#CC2A1E' }}>SPY</span>
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] mt-0.5" style={{ color: 'var(--t3)' }}>
        {T[lang].tagline}
      </div>
    </div>
  )
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center border rounded-[3px] overflow-hidden" style={{ borderColor: 'var(--b2)' }}>
      {(['en', 'pt'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.08em] transition-all"
          style={{
            background: lang === l ? 'var(--s3)' : 'transparent',
            color: lang === l ? 'var(--t1)' : 'var(--t3)',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="text-[10px] font-mono uppercase tracking-[0.14em] mb-5 flex items-center gap-2" style={{ color: 'var(--t3)' }}>
      <span className="w-3 h-px" style={{ background: 'var(--t3)', display: 'inline-block' }} />
      {text}
    </div>
  )
}


function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b" style={{ borderColor: 'var(--b1)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        style={{ color: open ? 'var(--t1)' : 'var(--t2)' }}
      >
        <span className="font-mono text-[14px] leading-snug">{q}</span>
        <ChevronDown
          size={15}
          style={{
            color: open ? '#CC2A1E' : 'var(--t3)',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p className="pb-5 font-mono text-[14px] leading-relaxed" style={{ color: 'var(--t2)' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FEATURE_ICONS = [Film, BarChart2, TrendingUp, Zap, Bookmark, Filter]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [scrolled, setScrolled] = useState(false)
  const t = T[lang]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--t1)', fontFamily: "'IBM Plex Mono', monospace", minHeight: '100vh' }}>

      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-50 h-14 flex items-center transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11,11,12,0.92)' : 'var(--s1)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid var(--b1)',
          padding: '0 clamp(24px, 5vw, 80px)',
          gap: 32,
        }}
      >
        <Logo lang={lang} />

        {/* Nav links */}
        <nav className="flex items-center gap-6 flex-1">
          {[
            { label: 'Radar', href: '/radar' },
            { label: t.nav_pricing, href: '#pricing' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.07em] transition-colors duration-150"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t3)')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth + lang */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <LangToggle lang={lang} setLang={setLang} />
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-[0.06em] px-4 py-2 rounded-[3px] transition-all duration-150"
            style={{ color: 'var(--t2)', border: '1px solid var(--b2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderColor = 'var(--t2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.borderColor = 'var(--b2)' }}
          >
            {t.btn_login}
          </Link>
          <Link
            href="/signup"
            className="font-mono text-[11px] uppercase tracking-[0.06em] px-4 py-2 rounded-[3px] transition-all duration-150"
            style={{ background: '#CC2A1E', color: 'white' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#B8241A')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#CC2A1E')}
          >
            {t.btn_signup} →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{ padding: '0 clamp(24px, 5vw, 80px)' }}>
        <section style={{ padding: '100px 0 88px', position: 'relative' }}>
          {/* Bg glow */}
          <div style={{
            position: 'absolute', top: 0, right: '-5%', width: '65%', height: '100%',
            background: 'radial-gradient(ellipse 70% 60% at 65% 45%, rgba(204,42,30,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="grid gap-14 relative" style={{ gridTemplateColumns: '54% 42%', alignItems: 'center' }}>
            <div>
              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 rounded-[3px] px-3 py-1.5 mb-8"
                style={{ background: 'rgba(204,42,30,0.10)', border: '1px solid rgba(204,42,30,0.22)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#CC2A1E', animation: 'pulse 2s ease-in-out infinite' }} />
                <span className="text-[10px] font-mono uppercase tracking-[0.08em]" style={{ color: '#CC2A1E' }}>{t.badge}</span>
              </motion.div>

              {/* H1 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
                <h1 className="font-syne font-[800] leading-[1.04]" style={{ fontSize: 'clamp(42px, 5.2vw, 68px)', color: 'var(--t1)' }}>
                  {t.h1a}<br />
                  <span style={{ color: '#CC2A1E' }}>{t.h1b}</span>
                </h1>
              </motion.div>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
                className="font-mono leading-[1.75] mt-6"
                style={{ fontSize: 15, color: 'var(--t2)', maxWidth: 460, whiteSpace: 'pre-line' }}
              >
                {t.sub}
              </motion.p>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.26 }} className="mt-8">
                <div className="flex items-center gap-3">
                  <Link
                    href="/radar"
                    className="inline-block font-mono text-[12px] uppercase tracking-[0.07em] rounded-[3px] px-6 py-3 transition-all duration-150"
                    style={{ background: '#CC2A1E', color: 'white' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#B8241A')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#CC2A1E')}
                  >
                    {t.cta}
                  </Link>
                  <Link
                    href="/login"
                    className="inline-block font-mono text-[12px] uppercase tracking-[0.07em] rounded-[3px] px-6 py-3 transition-all duration-150"
                    style={{ color: 'var(--t2)', border: '1px solid var(--b2)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderColor = 'var(--t1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.borderColor = 'var(--b2)' }}
                  >
                    {t.cta2}
                  </Link>
                </div>
                <p className="mt-3 font-mono text-[11px]" style={{ color: 'var(--t3)' }}>{t.micro}</p>
              </motion.div>
            </div>

            {/* Hero Radar */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <HeroRadar />
            </motion.div>
          </div>
        </section>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ background: 'var(--s1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ padding: '0 clamp(24px, 5vw, 80px)' }}>
          <Reveal>
            <div className="grid grid-cols-3">
              {t.sp.map((item, i) => (
                <div key={i} className={`flex flex-col items-center py-7 ${i < 2 ? 'border-r' : ''}`} style={{ borderColor: 'var(--b1)' }}>
                  <div className="font-syne font-[800] text-[28px] leading-none" style={{ color: 'var(--t1)' }}>{item.num}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] mt-2" style={{ color: 'var(--t3)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 80px)' }}>

        {/* ── Problem ── */}
        <section style={{ padding: '100px 0' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <Reveal>
              <SectionLabel text={t.prob_label} />
              <h2 className="font-syne font-[800] leading-[1.1]" style={{ fontSize: 'clamp(30px, 3.8vw, 46px)', color: 'var(--t1)' }}>
                {t.prob_h[0]}<br />{t.prob_h[1]}
              </h2>
              <div className="mt-8 space-y-5">
                {t.prob_body.map((p, i) => (
                  <p key={i} className="font-mono leading-[1.75]"
                    style={{
                      fontSize: 15,
                      color: i === 1 ? 'var(--t1)' : 'var(--t2)',
                      fontWeight: i === 1 ? 600 : 400,
                    }}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

      </div>

      {/* ── What is RavenSpy ── */}
      <div style={{ background: 'var(--s1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ padding: '100px clamp(24px, 5vw, 80px)' }}>
          <div className="grid gap-16" style={{ gridTemplateColumns: '48% 48%', alignItems: 'start' }}>
            <Reveal>
              <SectionLabel text={t.what_label} />
              <h2 className="font-syne font-[800] leading-[1.1]" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', color: 'var(--t1)' }}>
                {t.what_h[0]}<br />{t.what_h[1]}
              </h2>
              <p className="font-mono leading-[1.75] mt-6" style={{ fontSize: 14, color: 'var(--t2)' }}>{t.what_sub}</p>
              <div className="mt-7 rounded-[0_3px_3px_0] px-5 py-4" style={{ background: 'var(--s2)', borderLeft: '3px solid #CC2A1E' }}>
                <p className="font-mono leading-[1.65]" style={{ fontSize: 14, color: 'var(--t2)', whiteSpace: 'pre-line' }}>{t.what_hl}</p>
              </div>
            </Reveal>

            {/* Feature grid */}
            <div className="grid grid-cols-1 gap-px" style={{ border: '1px solid var(--b1)', borderRadius: 4, overflow: 'hidden', background: 'var(--b1)' }}>
              {t.what_features.map((f, i) => {
                const Icon = FEATURE_ICONS[i]
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="flex items-start gap-4 p-5"
                    style={{ background: 'var(--s1)' }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-[3px] flex items-center justify-center mt-0.5" style={{ background: 'rgba(204,42,30,0.10)', border: '1px solid rgba(204,42,30,0.15)' }}>
                      <Icon size={14} style={{ color: '#CC2A1E' }} />
                    </div>
                    <div>
                      <div className="font-mono font-[600] text-[13px]" style={{ color: 'var(--t1)' }}>{f.label}</div>
                      <div className="font-mono text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--t2)' }}>{f.desc}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 80px)' }}>

        {/* ── Scale ── */}
        <section style={{ padding: '100px 0' }}>
          <Reveal>
            <h2 className="font-syne font-[800] text-center leading-[1.1] mb-12" style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', color: 'var(--t1)' }}>
              {t.scale_h}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 rounded-[4px] overflow-hidden border" style={{ borderColor: 'var(--b1)' }}>
              {t.scale_cols.map((col, i) => (
                <div key={i} className={`px-8 py-10 ${i < 2 ? 'border-r' : ''}`} style={{ borderColor: 'var(--b1)', background: 'var(--s1)' }}>
                  <div className="font-syne font-[800] leading-none" style={{ fontSize: 'clamp(34px, 3.8vw, 54px)', color: 'var(--t1)' }}>{col.num}</div>
                  {col.sub && <div className="font-mono text-[11px] uppercase tracking-[0.1em] mt-2" style={{ color: '#CC2A1E' }}>{col.sub}</div>}
                  <p className="font-mono leading-[1.65] mt-4" style={{ fontSize: 13, color: 'var(--t2)', whiteSpace: 'pre-line' }}>{col.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

      </div>

      {/* ── How it Works ── */}
      <div style={{ background: 'var(--s1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ padding: '100px clamp(24px, 5vw, 80px)' }}>
          <Reveal>
            <h2 className="font-syne font-[800] leading-[1.1] mb-14" style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', color: 'var(--t1)' }}>
              {t.how_h}
            </h2>
          </Reveal>
          <div className="grid grid-cols-3 gap-8">
            {t.steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="relative p-6 rounded-[4px] border h-full" style={{ background: 'var(--s2)', borderColor: 'var(--b1)' }}>
                  <div className="font-syne font-[800] text-[52px] leading-none mb-5" style={{ color: '#CC2A1E', opacity: 0.18 }}>{step.num}</div>
                  <div className="flex items-start gap-2.5 mb-3">
                    <h3 className="font-syne font-[800] text-[17px] leading-snug" style={{ color: 'var(--t1)' }}>{step.title}</h3>
                    {step.badge && (
                      <span className="flex-shrink-0 font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-[2px] mt-0.5"
                        style={{ background: 'rgba(204,42,30,0.10)', border: '1px solid rgba(204,42,30,0.2)', color: '#CC2A1E' }}>
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="font-mono leading-[1.65]" style={{ fontSize: 13, color: 'var(--t2)' }}>{step.desc}</p>
                  {i < t.steps.length - 1 && (
                    <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-[16px]" style={{ color: 'var(--t3)' }}>→</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 80px)' }}>

        {/* ── Pricing ── */}
        <section id="pricing" style={{ padding: '100px 0' }}>
          <Reveal>
            <div className="text-center mb-16">
              <SectionLabel text={t.pricing_label} />
              <h2 className="font-syne font-[800] leading-[1.04]" style={{ fontSize: 'clamp(28px, 3.8vw, 48px)', color: 'var(--t1)' }}>
                {t.pricing_h}
              </h2>
              <p className="font-mono mt-4" style={{ fontSize: 15, color: 'var(--t2)' }}>{t.pricing_sub}</p>
            </div>
          </Reveal>

          {/* Platform coverage legend */}
          <Reveal delay={0.05}>
            <div className="flex items-center justify-center gap-6 mb-10">
              {[
                { label: lang === 'pt' ? 'Todas as plataformas' : 'All platforms', plans: 'FREE + PRO + ULTRA' },
              ].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  {[
                    { name: 'Meta', plans: [0,1,2], color: '#1877F2' },
                    { name: 'YouTube', plans: [1,2], color: '#FF0000' },
                    { name: 'TikTok', plans: [2], color: '#00F2EA' },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.07em]" style={{ color: 'var(--t3)' }}>
                        {p.name}
                      </span>
                      <div className="flex gap-0.5">
                        {[0,1,2].map((j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full" style={{
                            background: p.plans.includes(j) ? p.color : 'var(--b1)',
                            opacity: p.plans.includes(j) ? 1 : 0.3,
                          }} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] ml-1" style={{ color: 'var(--t3)' }}>
                    {lang === 'pt' ? '● = incluído no plano' : '● = included in plan'}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="relative">
            {/* Ambient glow behind PRO */}
            <div className="absolute pointer-events-none" style={{
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 520, height: 480,
              background: 'radial-gradient(ellipse, rgba(204,42,30,0.09) 0%, transparent 70%)',
            }} />

            <div className="grid grid-cols-3 gap-0 items-stretch relative" style={{ border: '1px solid var(--b1)', borderRadius: 6, overflow: 'hidden' }}>
              {t.plans.map((plan, i) => {
                const isPro = i === 1
                const isUltra = i === 2
                const isPaid = isPro || isUltra

                const platforms = i === 0
                  ? ['Meta']
                  : i === 1
                    ? ['Meta', 'YouTube']
                    : ['Meta', 'YouTube', 'TikTok']

                const platformColors: Record<string, string> = {
                  Meta: '#1877F2',
                  YouTube: '#FF0000',
                  TikTok: '#00F2EA',
                }

                return (
                  <Reveal key={i} delay={i * 0.07}>
                    <div
                      className="relative flex flex-col h-full"
                      style={{
                        background: isPro
                          ? 'var(--s2)'
                          : isUltra
                            ? '#141417'
                            : 'var(--s1)',
                        borderRight: i < 2 ? '1px solid var(--b1)' : 'none',
                        boxShadow: isPro
                          ? 'inset 0 0 0 1px rgba(204,42,30,0.28), 0 0 60px rgba(204,42,30,0.10)'
                          : 'none',
                      }}
                    >
                      {/* Top accent line */}
                      <div style={{
                        height: 3,
                        background: isPro
                          ? 'linear-gradient(90deg, #CC2A1E, #FF6B5B)'
                          : isUltra
                            ? 'linear-gradient(90deg, #CC2A1E 0%, #FF6B5B 50%, #FFD700 100%)'
                            : 'var(--b1)',
                      }} />

                      <div className="p-8 flex flex-col flex-1">

                        {/* Badge */}
                        {plan.badge ? (
                          <div className="mb-5">
                            <span className="font-mono text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-[2px]"
                              style={{
                                background: isPro ? '#CC2A1E' : 'rgba(255,215,0,0.12)',
                                color: isPro ? 'white' : '#FFD700',
                                border: isPro ? 'none' : '1px solid rgba(255,215,0,0.3)',
                              }}>
                              {plan.badge}
                            </span>
                          </div>
                        ) : (
                          <div className="mb-5 h-[26px]" />
                        )}

                        {/* Plan name */}
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] mb-3" style={{
                          color: isPro ? '#CC2A1E' : isUltra ? '#9B9591' : 'var(--t3)',
                        }}>
                          {plan.name}
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-1.5 mb-1">
                          <span className="font-syne font-[800] leading-none" style={{
                            fontSize: 'clamp(38px, 4vw, 52px)',
                            color: isPro ? 'var(--t1)' : isUltra ? 'var(--t1)' : 'var(--t2)',
                          }}>
                            {plan.price}
                          </span>
                          {plan.period && (
                            <span className="font-mono text-[12px] mb-1" style={{ color: 'var(--t3)' }}>{plan.period}</span>
                          )}
                        </div>

                        {/* Platform chips */}
                        <div className="flex items-center gap-1.5 mt-3 mb-6 flex-wrap">
                          {platforms.map((p) => (
                            <span key={p} className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-[2px]" style={{
                              background: `${platformColors[p]}14`,
                              color: platformColors[p],
                              border: `1px solid ${platformColors[p]}33`,
                            }}>
                              {p}
                            </span>
                          ))}
                          {i === 0 && (
                            <span className="font-mono text-[9px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-[2px]" style={{
                              background: 'rgba(255,255,255,0.04)',
                              color: 'var(--t3)',
                              border: '1px solid rgba(255,255,255,0.07)',
                            }}>
                              {lang === 'pt' ? 'limitado' : 'limited'}
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="h-px mb-6" style={{ background: isPro ? 'rgba(204,42,30,0.2)' : 'var(--b1)' }} />

                        {/* Features */}
                        <ul className="space-y-2.5 flex-1">
                          {plan.features.map((f, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-3 rounded-[3px] px-2 py-1.5"
                              style={{
                                background: f.hi ? 'rgba(204,42,30,0.07)' : 'transparent',
                                borderLeft: f.hi ? '2px solid rgba(204,42,30,0.5)' : '2px solid transparent',
                                marginLeft: f.hi ? 0 : 0,
                              }}
                            >
                              <span className="flex-shrink-0 mt-0.5" style={{ color: f.hi ? '#CC2A1E' : 'var(--t3)', fontSize: 12 }}>
                                {f.hi ? '✦' : '✓'}
                              </span>
                              <span className="font-mono text-[12px] leading-relaxed"
                                style={{ color: f.hi ? 'var(--t1)' : 'var(--t2)', fontWeight: f.hi ? 600 : 400 }}>
                                {f.text}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <div className="mt-8">
                          <Link
                            href="/signup"
                            className="block w-full text-center font-mono text-[12px] uppercase tracking-[0.08em] rounded-[3px] py-3.5 transition-all duration-150"
                            style={{
                              background: isPaid ? '#CC2A1E' : 'transparent',
                              color: isPaid ? 'white' : 'var(--t2)',
                              border: isPaid ? 'none' : '1px solid var(--b2)',
                              fontWeight: isPaid ? 600 : 400,
                            }}
                            onMouseEnter={(e) => {
                              if (isPaid) {
                                e.currentTarget.style.background = '#B8241A'
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,42,30,0.35)'
                              } else {
                                e.currentTarget.style.background = 'var(--s2)'
                                e.currentTarget.style.color = 'var(--t1)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isPaid) {
                                e.currentTarget.style.background = '#CC2A1E'
                                e.currentTarget.style.boxShadow = 'none'
                              } else {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = 'var(--t2)'
                              }
                            }}
                          >
                            {plan.cta} →
                          </Link>
                          <p className="text-center font-mono text-[10px] mt-2.5 leading-relaxed" style={{ color: 'var(--t3)' }}>
                            {plan.micro}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>

          {/* Guarantee strip */}
          <Reveal delay={0.2}>
            <div className="flex items-center justify-center gap-8 mt-10 pt-8 border-t" style={{ borderColor: 'var(--b1)' }}>
              {[
                { icon: '↩', text: lang === 'pt' ? 'Garantia 7 dias' : '7-day money back' },
                { icon: '⚡', text: lang === 'pt' ? 'Acesso imediato' : 'Instant access' },
                { icon: '✕', text: lang === 'pt' ? 'Cancele quando quiser' : 'Cancel anytime' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span className="font-mono text-[13px]" style={{ color: 'var(--t3)' }}>{item.icon}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.07em]" style={{ color: 'var(--t3)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

      </div>

      {/* ── Who it's for ── */}
      <div style={{ background: 'var(--s1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ padding: '100px clamp(24px, 5vw, 80px)' }}>
          <div style={{ maxWidth: 680 }}>
            <Reveal>
              <h2 className="font-syne font-[800] leading-[1.1] mb-10" style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', color: 'var(--t1)' }}>
                {t.who_h}
              </h2>
            </Reveal>
            {t.who_list.map((item, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="flex items-start gap-4 py-4" style={{ borderBottom: '1px solid var(--b1)' }}>
                  <span className="font-mono text-[14px] flex-shrink-0 mt-0.5" style={{ color: '#CC2A1E' }}>→</span>
                  <span className="font-mono text-[14px] leading-relaxed" style={{ color: 'var(--t2)' }}>{item}</span>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <div className="mt-8 p-5 rounded-[4px]" style={{ background: 'var(--s2)', border: '1px solid var(--b1)' }}>
                <p className="font-mono leading-[1.65]" style={{ fontSize: 13, color: 'var(--t2)' }}>{t.who_disc}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Monitor size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
                <span className="font-mono text-[12px]" style={{ color: 'var(--t3)' }}>{t.who_desktop}</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Social Proof placeholder ── */}
      <div style={{ borderBottom: '1px solid var(--b1)' }}>
        <div style={{ padding: '64px clamp(24px, 5vw, 80px)', textAlign: 'center' }}>
          <Reveal>
            <div className="font-syne font-[800] text-[40px] leading-none mb-4" style={{ color: 'var(--b2)' }}>"</div>
            <p className="font-mono text-[13px]" style={{ color: 'var(--t3)' }}>Results coming soon.</p>
            <p className="font-mono text-[12px] mt-2 leading-[1.65]" style={{ color: 'var(--t3)' }}>
              We're collecting results from our first users.<br />Check back soon — or be one of them.
            </p>
          </Reveal>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div id="faq" style={{ background: 'var(--s1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ padding: '100px clamp(24px, 5vw, 80px)' }}>
          <div style={{ maxWidth: 720 }}>
            <Reveal>
              <h2 className="font-syne font-[800] leading-[1.1] mb-10" style={{ fontSize: 'clamp(28px, 3.8vw, 46px)', color: 'var(--t1)' }}>
                {t.faq_h}
              </h2>
            </Reveal>
            {t.faqs.map((faq, i) => (
              <FAQItem key={`${lang}-${i}`} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg) 0%, rgba(204,42,30,0.04) 35%, rgba(204,42,30,0.07) 65%, var(--bg) 100%)',
        borderBottom: '1px solid var(--b1)',
      }}>
        <div style={{ padding: '120px clamp(24px, 5vw, 80px)', textAlign: 'center' }}>
          <Reveal>
            <h2 className="font-syne font-[800] leading-[1.04]" style={{ fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--t1)' }}>
              {t.final_h1}<br />
              <span style={{ color: '#CC2A1E' }}>{t.final_h2}</span>
            </h2>
            <p className="font-mono leading-[1.75] mt-6 mx-auto" style={{ fontSize: 15, color: 'var(--t2)', maxWidth: 500 }}>
              {t.final_sub}
            </p>
            <div className="flex items-center justify-center gap-3 mt-10">
              <Link
                href="/radar"
                className="inline-block font-mono text-[13px] uppercase tracking-[0.07em] rounded-[3px] px-8 py-4 transition-all duration-150"
                style={{ background: '#CC2A1E', color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#B8241A')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#CC2A1E')}
              >
                {t.final_cta}
              </Link>
              <Link
                href="#pricing"
                className="inline-block font-mono text-[13px] uppercase tracking-[0.07em] rounded-[3px] px-8 py-4 transition-all duration-150"
                style={{ color: 'var(--t2)', border: '1px solid var(--b2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.borderColor = 'var(--t1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--t2)'; e.currentTarget.style.borderColor = 'var(--b2)' }}
              >
                {t.final_cta2}
              </Link>
            </div>
            <p className="font-mono text-[11px] mt-4" style={{ color: 'var(--t3)' }}>{t.final_micro}</p>
          </Reveal>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--s1)', borderTop: '1px solid var(--b1)' }}>
        <div style={{ padding: '48px clamp(24px, 5vw, 80px) 32px' }}>
          <div className="grid gap-10" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
            {/* Brand */}
            <div>
              <Logo lang={lang} />
              <p className="font-mono text-[12px] mt-4 leading-[1.65]" style={{ color: 'var(--t3)', maxWidth: 260 }}>
                {t.footer_desc}
              </p>
            </div>

            {/* Product */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t3)' }}>{t.footer_product}</div>
              <div className="flex flex-col gap-2.5">
                {t.footer_nav.map((label, i) => (
                  <Link key={label} href={t.footer_nav_hrefs[i]}
                    className="font-mono text-[13px] transition-colors duration-150"
                    style={{ color: 'var(--t2)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t2)')}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--t3)' }}>{t.footer_legal}</div>
              <div className="flex flex-col gap-2.5">
                {t.footer_legal_links.map((label) => (
                  <a key={label} href="#"
                    className="font-mono text-[13px] transition-colors duration-150"
                    style={{ color: 'var(--t2)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--t1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--t2)')}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid var(--b1)' }}>
            <span className="font-mono text-[11px]" style={{ color: 'var(--t3)' }}>© 2025 RavenSpy · All rights reserved</span>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
      </footer>

    </div>
  )
}
