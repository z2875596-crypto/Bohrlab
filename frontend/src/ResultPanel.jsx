import React, { useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const REC_COLOR = { 'Recommended':'#059669', 'Marginal':'#d97706', 'Not recommended':'#dc2626' }
const REC_BG    = { 'Recommended':'#ecfdf5', 'Marginal':'#fffbeb', 'Not recommended':'#fef2f2' }

function PropChip({ label, value, ok }) {
  return (
    <div style={{
      background: ok ? '#f0fdf4' : '#fef2f2',
      border:`1px solid ${ok?'rgba(5,150,105,0.2)':'rgba(220,38,38,0.18)'}`,
      borderRadius:'var(--r)', padding:'10px 14px', flex:1,
    }}>
      <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:15, fontFamily:'var(--mono)', fontWeight:600, color: ok?'#059669':'#dc2626' }}>
        {value}
      </div>
    </div>
  )
}

function SynthesisCard({ route }) {
  const [open, setOpen] = useState(false)
  if (!route) return null
  const diffColor = { Low:'#059669','Low-Medium':'#059669',Medium:'#d97706','Medium-High':'#d97706',High:'#dc2626' }
  const dc = diffColor[route.difficulty] || '#6b7280'
  return (
    <div style={{ marginTop:12, background:'#fffbeb', border:'1px solid rgba(217,119,6,0.2)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
      <div
        onClick={()=>setOpen(!open)}
        style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', cursor:'pointer', userSelect:'none' }}
      >
        <span style={{ fontSize:14, color:'#d97706' }}>◆</span>
        <span style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>合成路线</span>
        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:`${dc}18`, color:dc, border:`1px solid ${dc}33` }}>{route.difficulty}</span>
        <span style={{ fontSize:11, color:'var(--text3)' }}>{route.method}</span>
        <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text3)' }}>{open?'▲':'▼'}</span>
      </div>
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(217,119,6,0.1)', animation:'slide-in 0.2s ease' }}>
          <div style={{ marginTop:12, marginBottom:12 }}>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, letterSpacing:0.5 }}>前驱体</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {route.precursors.map((p,i)=>(
                <span key={i} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'#fff', color:'#d97706', border:'1px solid rgba(217,119,6,0.25)', fontFamily:'var(--mono)' }}>{p}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, letterSpacing:0.5 }}>合成步骤</div>
            {route.steps.map((s,i)=>(
              <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, background:'#fff', border:'1px solid rgba(217,119,6,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#d97706', fontFamily:'var(--mono)' }}>{i+1}</div>
                <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7, paddingTop:1 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:20 }}>
            <div><span style={{ fontSize:11, color:'var(--text3)' }}>气氛：</span><span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text2)' }}>{route.atmosphere}</span></div>
            <div><span style={{ fontSize:11, color:'var(--text3)' }}>周期：</span><span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text2)' }}>{route.duration_h}h</span></div>
          </div>
          {route.notes && (
            <div style={{ marginTop:10, padding:'8px 12px', background:'#fff', borderRadius:'var(--r-sm)', border:'1px solid rgba(217,119,6,0.15)', fontSize:11, color:'var(--text2)', lineHeight:1.7 }}>
              <span style={{ color:'#d97706', fontWeight:500 }}>注：</span>{route.notes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MaterialCard({ mat, rank, synthesis }) {
  const [open, setOpen] = useState(rank===1)
  const rc = REC_COLOR[mat.recommendation]||'#6b7280'
  const rb = REC_BG[mat.recommendation]||'#f9fafb'
  const isTop = rank===1
  return (
    <div style={{
      background:'var(--bg2)',
      border:`1.5px solid ${isTop?'rgba(37,99,235,0.3)':'var(--border)'}`,
      borderRadius:'var(--r-lg)', marginBottom:12,
      boxShadow: isTop ? '0 4px 16px rgba(37,99,235,0.10)' : 'var(--shadow-sm)',
      animation:'slide-in 0.3s ease', overflow:'hidden',
    }}>
      {/* Card header */}
      <div onClick={()=>setOpen(!open)} style={{ padding:'16px 20px', cursor:'pointer', userSelect:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:32, height:32, borderRadius:'var(--r)',
            background: isTop ? 'var(--blue)' : 'var(--bg3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, fontFamily:'var(--mono)', fontWeight:700,
            color: isTop ? '#fff' : 'var(--text3)', flexShrink:0,
          }}>#{rank}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:15, fontWeight:700, fontFamily:'var(--mono)', color:'var(--text)' }}>{mat.formula}</span>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:rb, color:rc, border:`1px solid ${rc}33`, fontWeight:500 }}>{mat.recommendation}</span>
              {isTop && <span style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:'var(--blue-dim)', color:'var(--blue)', border:'1px solid rgba(37,99,235,0.2)', fontWeight:500 }}>Top Pick</span>}
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{mat.name}</div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--mono)', color:isTop?'var(--blue)':rc, lineHeight:1 }}>{(mat.score*100).toFixed(0)}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>综合评分</div>
          </div>
          <span style={{ fontSize:11, color:'var(--text3)', marginLeft:4 }}>{open?'▲':'▼'}</span>
        </div>
        {/* Score bar */}
        <div style={{ marginTop:12, height:4, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${mat.score*100}%`, background:isTop?'var(--blue)':rc, borderRadius:2, transition:'width 0.8s ease' }} />
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)', animation:'slide-in 0.2s ease' }}>
          <div style={{ display:'flex', gap:10, marginTop:16 }}>
            <PropChip label="电导率" value={`${(mat.conductivity_S_m/1000).toFixed(1)}k S/m`} ok={mat.conductivity_S_m>=10000} />
            <PropChip label="热膨胀系数" value={`${mat.tec_ppm_K.toFixed(1)} ppm/K`} ok={mat.tec_ppm_K<=12} />
            <PropChip label="最高使用温度" value={`${mat.max_temp_C}°C`} ok={mat.max_temp_C>=500} />
          </div>
          <div style={{ marginTop:12, padding:'10px 14px', background:'var(--bg3)', borderRadius:'var(--r)', border:'1px solid var(--border)', fontSize:12, color:'var(--text2)', lineHeight:1.7 }}>
            {mat.explanation}
          </div>
          {synthesis && <SynthesisCard route={synthesis} />}
        </div>
      )}
    </div>
  )
}

function RadarPanel({ candidates }) {
  if (!candidates || candidates.length < 2) return null
  const COLORS = ['#2563eb','#059669','#7c3aed']
  const data = ['电导率','TEC匹配','温度稳定','综合评分'].map(subject => {
    const obj = { subject }
    candidates.slice(0,3).forEach((m,i) => {
      if (subject==='电导率')   obj[`m${i}`]=Math.min(100,Math.round(Math.log10(m.conductivity_S_m+1)*16))
      if (subject==='TEC匹配')  obj[`m${i}`]=Math.max(0,Math.round((15-m.tec_ppm_K)*7))
      if (subject==='温度稳定') obj[`m${i}`]=Math.min(100,Math.round(m.max_temp_C/12))
      if (subject==='综合评分') obj[`m${i}`]=Math.round(m.score*100)
    })
    return obj
  })
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 20px', marginBottom:16, boxShadow:'var(--shadow-sm)' }}>
      <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', marginBottom:12 }}>Top-3 多维对比</div>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <ResponsiveContainer width="55%" height={160}>
          <RadarChart data={data} margin={{top:8,right:16,bottom:8,left:16}}>
            <PolarGrid stroke="rgba(37,99,235,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:'#9ca3af', fontFamily:'IBM Plex Mono' }} />
            {candidates.slice(0,3).map((_,i) => (
              <Radar key={i} dataKey={`m${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.07} strokeWidth={1.5} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ flex:1 }}>
          {candidates.slice(0,3).map((m,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i], flexShrink:0 }} />
              <span style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.formula}</span>
              <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--mono)', color:COLORS[i] }}>{(m.score*100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ResultPanel({ finalContent, rankedCandidates, synthesisMap }) {
  if (!finalContent && (!rankedCandidates||rankedCandidates.length===0)) return null
  return (
    <div style={{ animation:'fade-in 0.4s ease' }}>
      <RadarPanel candidates={rankedCandidates} />
      {rankedCandidates?.length > 0 && (
        <>
          <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10, letterSpacing:0.5 }}>候选材料评估 · {rankedCandidates.length} 种</div>
          {rankedCandidates.map((m,i)=>(
            <MaterialCard key={m.formula} mat={m} rank={i+1} synthesis={synthesisMap?.[m.formula]} />
          ))}
        </>
      )}
      {finalContent && (
        <div style={{ background:'var(--bg2)', border:'1px solid rgba(37,99,235,0.15)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)', marginTop:8 }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, background:'var(--blue-dim)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--blue)' }} />
            <span style={{ fontSize:11, color:'var(--blue)', fontFamily:'var(--mono)', fontWeight:500, letterSpacing:0.5 }}>AGENT SUMMARY</span>
          </div>
          <div style={{ padding:'16px', fontSize:13, color:'var(--text2)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{finalContent}</div>
        </div>
      )}
    </div>
  )
}
