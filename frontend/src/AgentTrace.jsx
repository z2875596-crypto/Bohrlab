import React, { useState } from 'react'

const TOOL_META = {
  literature_search:   { color:'#2563eb', bg:'#eff6ff', label:'文献检索',  icon:'◈' },
  predict_properties:  { color:'#7c3aed', bg:'#f5f3ff', label:'性质预测',  icon:'◉' },
  get_synthesis_route: { color:'#d97706', bg:'#fffbeb', label:'合成路线',  icon:'◆' },
  score_and_rank:      { color:'#059669', bg:'#ecfdf5', label:'评分排序',  icon:'◎' },
}

function ThoughtRow({ step, content }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display:'flex', gap:10, marginBottom:8, animation:'slide-in 0.2s ease' }}>
      <div style={{
        width:22, height:22, borderRadius:'50%', flexShrink:0, marginTop:1,
        background:'var(--bg3)', border:'1px solid var(--border2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontFamily:'var(--mono)', color:'var(--text3)',
      }}>{step}</div>
      <div style={{ flex:1 }}>
        <div
          onClick={()=>setOpen(!open)}
          style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', marginBottom: open?6:0 }}
        >
          <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)', letterSpacing:0.5 }}>THOUGHT</span>
          <span style={{ fontSize:10, color:'var(--text3)' }}>{open?'▲':'▼'}</span>
          {!open && <span style={{ fontSize:12, color:'var(--text2)', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:300 }}>{content.slice(0,60)}{content.length>60?'…':''}</span>}
        </div>
        {open && (
          <div style={{
            background:'var(--bg3)', border:'1px solid var(--border)',
            borderRadius:'var(--r)', padding:'10px 12px',
            fontSize:12, color:'var(--text2)', lineHeight:1.7,
            animation:'slide-in 0.15s ease',
          }}>{content}</div>
        )}
      </div>
    </div>
  )
}

function ActionRow({ step, tool, args }) {
  const meta = TOOL_META[tool] || { color:'#6b7280', bg:'#f9fafb', label:tool, icon:'○' }
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display:'flex', gap:10, marginBottom:8, animation:'slide-in 0.2s ease' }}>
      <div style={{
        width:22, height:22, borderRadius:'var(--r-sm)', flexShrink:0, marginTop:1,
        background:meta.bg, border:`1px solid ${meta.color}33`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:11, color:meta.color,
      }}>{meta.icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{
            fontSize:10, padding:'2px 8px', borderRadius:20,
            background:meta.bg, color:meta.color,
            border:`1px solid ${meta.color}33`, fontWeight:500,
          }}>{meta.label}</span>
          <span style={{ fontSize:11, color:'var(--text3)' }}>step {step}</span>
          <button onClick={()=>setOpen(!open)} style={{
            marginLeft:'auto', background:'none',
            border:'1px solid var(--border2)', borderRadius:4,
            padding:'1px 8px', fontSize:10, color:'var(--text3)',
          }}>{open?'收起':'参数'}</button>
        </div>
        {open && (
          <pre style={{
            marginTop:6, background:meta.bg, border:`1px solid ${meta.color}22`,
            borderRadius:'var(--r-sm)', padding:'8px 10px',
            fontSize:10, fontFamily:'var(--mono)', color:meta.color,
            whiteSpace:'pre-wrap', wordBreak:'break-all',
            animation:'slide-in 0.15s ease',
          }}>{JSON.stringify(args,null,2)}</pre>
        )}
      </div>
    </div>
  )
}

function ObsRow({ step, tool, result }) {
  const meta = TOOL_META[tool] || { color:'#6b7280', bg:'#f9fafb', label:tool }
  const [open, setOpen] = useState(false)
  const text = JSON.stringify(result,null,2)
  return (
    <div style={{ display:'flex', gap:10, marginBottom:10, animation:'slide-in 0.2s ease' }}>
      <div style={{
        width:22, height:22, borderRadius:3, flexShrink:0, marginTop:1,
        background:'var(--bg3)', border:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:8, color:'var(--text3)', fontFamily:'var(--mono)',
      }}>OBS</div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--mono)' }}>{meta.label} · 结果</span>
          <button onClick={()=>setOpen(!open)} style={{
            marginLeft:'auto', background:'none',
            border:'1px solid var(--border2)', borderRadius:4,
            padding:'1px 8px', fontSize:10, color:'var(--text3)',
          }}>{open?'折叠':'展开'}</button>
        </div>
        <pre style={{
          marginTop:5, background:'var(--bg3)', border:'1px solid var(--border)',
          borderRadius:'var(--r-sm)', padding:'8px 10px',
          fontSize:10, fontFamily:'var(--mono)', color:'var(--text2)',
          whiteSpace:'pre-wrap', wordBreak:'break-all',
          maxHeight: open?300:60, overflow:'hidden',
          transition:'max-height 0.2s ease',
        }}>{text}</pre>
      </div>
    </div>
  )
}

export default function AgentTrace({ events, isRunning }) {
  if (events.length === 0 && !isRunning) return (
    <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text3)', fontSize:13 }}>
      推理过程将在此实时显示
    </div>
  )
  return (
    <div>
      {events.map((ev,i) => {
        if (ev.type==='status') return (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, animation:'slide-in 0.2s ease' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--blue)', animation:'pulse-dot 1.2s infinite', flexShrink:0 }} />
            <span style={{ fontSize:11, color:'var(--text3)', fontFamily:'var(--mono)' }}>{ev.message}</span>
          </div>
        )
        if (ev.type==='thought')     return <ThoughtRow key={i} step={ev.step} content={ev.content} />
        if (ev.type==='action')      return <ActionRow  key={i} step={ev.step} tool={ev.tool} args={ev.args} />
        if (ev.type==='observation') return <ObsRow     key={i} step={ev.step} tool={ev.tool} result={ev.result} />
        if (ev.type==='error') return (
          <div key={i} style={{ background:'var(--red-dim)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'var(--r)', padding:'8px 12px', fontSize:12, color:'var(--red)', marginBottom:8 }}>
            {ev.message}
          </div>
        )
        return null
      })}
      {isRunning && (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'var(--blue-dim)', borderRadius:'var(--r)', border:'1px solid rgba(37,99,235,0.15)' }}>
          <div style={{ width:12, height:12, border:'2px solid var(--border2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
          <span style={{ fontSize:12, color:'var(--blue)' }}>智能体运行中…</span>
        </div>
      )}
    </div>
  )
}
