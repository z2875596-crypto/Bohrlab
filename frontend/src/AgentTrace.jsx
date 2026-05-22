import React from 'react'

const TOOL_COLORS = {
  literature_search: { color: '#4d9ef5', bg: 'rgba(77,158,245,0.10)', label: '文献检索' },
  predict_properties: { color: '#7c6ff7', bg: 'rgba(124,111,247,0.10)', label: '性质预测' },
  get_synthesis_route: { color: '#f5a623', bg: 'rgba(245,166,35,0.10)', label: '合成路线' },
  score_and_rank: { color: '#1dba8a', bg: 'rgba(29,186,138,0.10)', label: '评分排序' },
}

function ThoughtBubble({ step, content }) {
  return (
    <div style={{
      animation: 'slide-in 0.3s ease',
      borderLeft: '2px solid rgba(255,255,255,0.15)',
      paddingLeft: 14,
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontFamily: 'var(--mono)' }}>
        THOUGHT · step {step}
      </div>
      <div style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.65 }}>{content}</div>
    </div>
  )
}

function ActionCard({ step, tool, args, reasoning }) {
  const meta = TOOL_COLORS[tool] || { color: '#9a9da6', bg: 'rgba(154,157,166,0.10)', label: tool }
  return (
    <div style={{
      animation: 'slide-in 0.3s ease',
      background: meta.bg,
      border: `1px solid ${meta.color}33`,
      borderRadius: 'var(--r-sm)',
      padding: '10px 14px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{
          background: meta.color,
          color: '#fff',
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 7px',
          borderRadius: 4,
          fontFamily: 'var(--mono)',
          letterSpacing: 0.5,
        }}>{meta.label}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>step {step}</span>
      </div>
      {reasoning && (
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{reasoning}</div>
      )}
      <pre style={{
        fontSize: 11,
        fontFamily: 'var(--mono)',
        color: meta.color,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        margin: 0,
      }}>
        {JSON.stringify(args, null, 2)}
      </pre>
    </div>
  )
}

function ObservationCard({ step, tool, result }) {
  const meta = TOOL_COLORS[tool] || { color: '#9a9da6', bg: 'rgba(154,157,166,0.10)', label: tool }
  const preview = JSON.stringify(result, null, 2)
  const lines = preview.split('\n')
  const truncated = lines.length > 20 ? lines.slice(0, 20).join('\n') + '\n  ... (truncated)' : preview

  return (
    <div style={{
      animation: 'slide-in 0.3s ease',
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      padding: '10px 14px',
      marginBottom: 14,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontFamily: 'var(--mono)' }}>
        OBSERVATION · {meta.label} · step {step}
      </div>
      <pre style={{
        fontSize: 11,
        fontFamily: 'var(--mono)',
        color: 'var(--text2)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxHeight: 240,
        overflow: 'hidden',
        margin: 0,
      }}>
        {truncated}
      </pre>
    </div>
  )
}

function StatusIndicator({ message }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, animation: 'slide-in 0.2s ease' }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'var(--teal)',
        animation: 'pulse-dot 1.2s ease-in-out infinite',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{message}</span>
    </div>
  )
}

export default function AgentTrace({ events, isRunning }) {
  return (
    <div style={{ padding: '0 4px' }}>
      {events.length === 0 && !isRunning && (
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '40px 0' }}>
          输入研究目标，智能体将在此实时展示推理过程
        </div>
      )}
      {events.map((ev, i) => {
        if (ev.type === 'status') return <StatusIndicator key={i} message={ev.message} />
        if (ev.type === 'thought') return <ThoughtBubble key={i} step={ev.step} content={ev.content} />
        if (ev.type === 'action') return (
          <ActionCard key={i} step={ev.step} tool={ev.tool} args={ev.args} reasoning={ev.reasoning} />
        )
        if (ev.type === 'observation') return (
          <ObservationCard key={i} step={ev.step} tool={ev.tool} result={ev.result} />
        )
        if (ev.type === 'error') return (
          <div key={i} style={{
            animation: 'slide-in 0.3s ease',
            background: 'var(--red-dim)',
            border: '1px solid rgba(224,92,92,0.3)',
            borderRadius: 'var(--r-sm)',
            padding: '10px 14px',
            marginBottom: 10,
            fontSize: 13,
            color: 'var(--red)',
          }}>
            Error: {ev.message}
          </div>
        )
        return null
      })}
      {isRunning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{
            width: 14, height: 14, border: '2px solid var(--border2)',
            borderTopColor: 'var(--teal)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>智能体运行中...</span>
        </div>
      )}
    </div>
  )
}
