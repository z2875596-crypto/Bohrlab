import React, { useState, useRef, useEffect } from 'react'
import AgentTrace from './AgentTrace.jsx'
import ResultPanel from './ResultPanel.jsx'

const EXAMPLE_QUERIES = [
  'I need a ceramic material with electrical conductivity > 10,000 S/m, thermal expansion coefficient < 12 ppm/K, stable above 500°C, for use as SOFC interconnect.',
  '寻找适合固体氧化物燃料电池互联体的钙钛矿材料，要求800°C下电导率大于5000 S/m，热膨胀系数与YSZ电解质匹配（9-11 ppm/K）。',
  'Find high-temperature conductive oxides for SOFC applications with good thermal stability, avoiding Cr-containing compositions.',
]

function Header() {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'var(--bg2)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'linear-gradient(135deg, #1dba8a 0%, #4d9ef5 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, color: '#fff',
        flexShrink: 0,
      }}>B</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: -0.3 }}>BohrLab</div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>材料逆向设计智能体 · Powered by DeepSeek</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <StatusBadge />
      </div>
    </div>
  )
}

function StatusBadge() {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setStatus(d.api_key_configured ? 'ready' : 'no-key'))
      .catch(() => setStatus('offline'))
  }, [])

  const map = {
    checking: ['#9a9da6', '检查中'],
    ready:    ['#1dba8a', 'API 就绪'],
    'no-key': ['#f5a623', '未配置 API Key'],
    offline:  ['#e05c5c', '后端离线'],
  }
  const [color, label] = map[status]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      background: `${color}18`,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      fontSize: 11, color,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}
    </div>
  )
}

function QueryPanel({ onSubmit, isRunning, onClear }) {
  const [query, setQuery] = useState('')

  const handleSubmit = () => {
    if (!query.trim() || isRunning) return
    onSubmit(query.trim())
  }

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r)',
      overflow: 'hidden',
    }}>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }}
        placeholder="描述目标材料性能需求...&#10;例：需要在800°C稳定工作、电导率 > 10⁴ S/m、TEC < 12 ppm/K 的陶瓷导电材料"
        disabled={isRunning}
        style={{
          width: '100%', minHeight: 100, padding: '14px 16px',
          background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text)', fontSize: 13, lineHeight: 1.7, resize: 'vertical',
        }}
      />
      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Ctrl+Enter 提交</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isRunning && (
            <button onClick={onClear} style={{
              background: 'none', border: '1px solid var(--border2)',
              borderRadius: 6, padding: '6px 14px',
              fontSize: 12, color: 'var(--text2)',
            }}>清除</button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isRunning || !query.trim()}
            style={{
              background: isRunning || !query.trim() ? 'var(--border)' : 'var(--teal)',
              border: 'none', borderRadius: 6, padding: '6px 18px',
              fontSize: 12, fontWeight: 600,
              color: isRunning || !query.trim() ? 'var(--text3)' : '#fff',
              transition: 'all 0.15s',
            }}
          >
            {isRunning ? '研究中...' : '开始研究 →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ExampleQueries({ onSelect, disabled }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>示例查询</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {EXAMPLE_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => !disabled && onSelect(q)}
            disabled={disabled}
            style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '8px 12px',
              textAlign: 'left', fontSize: 12, color: 'var(--text2)',
              lineHeight: 1.5, cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { if (!disabled) e.target.style.borderColor = 'var(--border2)' }}
            onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
          >
            {q.length > 100 ? q.slice(0, 100) + '…' : q}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [events, setEvents] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [finalContent, setFinalContent] = useState(null)
  const [rankedCandidates, setRankedCandidates] = useState([])
  const [activeQuery, setActiveQuery] = useState('')
  const traceRef = useRef(null)
  const resultRef = useRef(null)

  const scrollToBottom = (ref) => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }

  const handleSubmit = async (query) => {
    setEvents([])
    setFinalContent(null)
    setRankedCandidates([])
    setActiveQuery(query)
    setIsRunning(true)

    try {
      const resp = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') { setIsRunning(false); return }

          try {
            const ev = JSON.parse(raw)
            setEvents(prev => [...prev, ev])

            // Extract ranked candidates from score_and_rank observations
            if (ev.type === 'observation' && ev.tool === 'score_and_rank') {
              const ranked = ev.result?.ranked_candidates
              if (ranked && ranked.length > 0) setRankedCandidates(ranked)
            }
            if (ev.type === 'final') setFinalContent(ev.content)

            setTimeout(() => scrollToBottom(traceRef), 50)
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      setEvents(prev => [...prev, { type: 'error', message: String(err) }])
    } finally {
      setIsRunning(false)
    }
  }

  const handleClear = () => {
    setEvents([])
    setFinalContent(null)
    setRankedCandidates([])
    setActiveQuery('')
  }

  const hasResults = finalContent || rankedCandidates.length > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '360px 1fr',
        gridTemplateRows: '1fr',
        height: 'calc(100vh - 65px)',
        overflow: 'hidden',
      }}>
        {/* Left panel: input */}
        <div style={{
          borderRight: '1px solid var(--border)',
          padding: 20, overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
            RESEARCH QUERY
          </div>
          <QueryPanel onSubmit={handleSubmit} isRunning={isRunning} onClear={handleClear} />
          <ExampleQueries onSelect={handleSubmit} disabled={isRunning} />

          {activeQuery && (
            <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--mono)' }}>当前查询</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{activeQuery}</div>
            </div>
          )}
        </div>

        {/* Right panel: trace + results */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Agent trace */}
          <div style={{
            flex: hasResults ? '0 0 50%' : '1',
            overflow: 'auto',
            padding: '16px 20px',
            transition: 'flex 0.3s ease',
          }} ref={traceRef}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
              AGENT TRACE
            </div>
            <AgentTrace events={events} isRunning={isRunning} />
          </div>

          {/* Result panel */}
          {hasResults && (
            <div style={{
              flex: '0 0 50%',
              borderTop: '1px solid var(--border)',
              overflow: 'auto',
              padding: '16px 20px',
            }} ref={resultRef}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
                RESEARCH RESULTS
              </div>
              <ResultPanel finalContent={finalContent} rankedCandidates={rankedCandidates} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
