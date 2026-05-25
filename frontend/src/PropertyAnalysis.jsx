import React, { useState, useEffect } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'

const PALETTE = [
  '#2563eb','#059669','#7c3aed','#d97706','#dc2626',
  '#0891b2','#65a30d','#9333ea','#ea580c','#0284c7',
]

const FAMILY_COLOR = {
  'perovskite':'#2563eb','spinel':'#059669',
  'ruddlesden-popper':'#7c3aed','fluorite':'#d97706',
  'corundum':'#6b7280','simple oxide':'#9ca3af',
}

function MaterialToggle({ formula, name, family, selected, color, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
        borderRadius:'var(--r)', cursor:'pointer', userSelect:'none',
        background: selected ? `${color}12` : 'transparent',
        border:`1px solid ${selected ? color+'44' : 'var(--border)'}`,
        transition:'all 0.15s', marginBottom:4,
      }}
    >
      <div style={{
        width:10, height:10, borderRadius:2, flexShrink:0,
        background: selected ? color : 'var(--bg4)',
        border:`1px solid ${selected ? color : 'var(--border2)'}`,
      }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontFamily:'var(--mono)', color: selected?'var(--text)':'var(--text2)', fontWeight: selected?600:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{formula}</div>
        <div style={{ fontSize:10, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
      </div>
      <span style={{ fontSize:9, padding:'1px 6px', borderRadius:10, background:FAMILY_COLOR[family]+'18', color:FAMILY_COLOR[family]||'#6b7280', flexShrink:0 }}>{family.split('-')[0]}</span>
    </div>
  )
}

function TargetInput({ label, value, onChange, unit, step=100 }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11, color:'var(--text2)', fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--blue)' }}>{value.toLocaleString()} {unit}</span>
      </div>
      <input type="range" min={step} max={step===100?500000:20} step={step}
        value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{ width:'100%', accentColor:'var(--blue)' }} />
    </div>
  )
}

const CustomScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:'10px 14px', boxShadow:'var(--shadow)', fontSize:12 }}>
      <div style={{ fontFamily:'var(--mono)', fontWeight:600, color:'var(--text)', marginBottom:4 }}>{d.formula}</div>
      <div style={{ color:'var(--text2)' }}>电导率: <span style={{ fontFamily:'var(--mono)', color:'var(--blue)' }}>{(d.x/1000).toFixed(1)}k S/m</span></div>
      <div style={{ color:'var(--text2)' }}>TEC: <span style={{ fontFamily:'var(--mono)', color:'var(--blue)' }}>{d.y.toFixed(1)} ppm/K</span></div>
      <div style={{ color:'var(--text2)' }}>最高温度: <span style={{ fontFamily:'var(--mono)', color:'var(--blue)' }}>{d.temp}°C</span></div>
    </div>
  )
}

export default function PropertyAnalysis() {
  const [allMaterials, setAllMaterials] = useState([])
  const [selected, setSelected]         = useState(new Set(['La0.8Sr0.2MnO3','MnCo2O4','La0.7Sr0.3CrO3','La0.8Sr0.2Cr0.5Mn0.5O3']))
  const [predictions, setPredictions]   = useState({})
  const [targetCond, setTargetCond]     = useState(10000)
  const [targetTec, setTargetTec]       = useState(12)
  const [loading, setLoading]           = useState(false)
  const [chartMode, setChartMode]       = useState('scatter') // scatter | radar | bar

  useEffect(() => {
    fetch('/api/materials').then(r=>r.json()).then(d => setAllMaterials(d.materials||[]))
  }, [])

  useEffect(() => {
    if (selected.size === 0) return
    setLoading(true)
    fetch('/api/predict', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ formulas: [...selected] }),
    }).then(r=>r.json()).then(d => {
      const map = {}
      for (const p of d.predictions||[]) {
        if (!p.error) map[p.formula] = p
      }
      setPredictions(map)
      setLoading(false)
    })
  }, [selected])

  const toggleMaterial = (f) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const selectedList = [...selected]
  const predList = selectedList.map((f,i) => ({
    formula: f,
    color: PALETTE[i % PALETTE.length],
    pred: predictions[f],
  })).filter(x => x.pred)

  // Scatter data
  const scatterData = predList.map(({formula, color, pred}) => ({
    formula, color,
    x: pred.electrical_conductivity.value,
    y: pred.thermal_expansion_coefficient.value,
    temp: pred.max_use_temperature.value,
  }))

  // Radar data
  const radarData = ['电导率','TEC匹配','温度稳定','综合'].map(subject => {
    const obj = { subject }
    predList.forEach(({formula, pred}) => {
      const cond = Math.min(100, Math.round(Math.log10(pred.electrical_conductivity.value+1)*16))
      const tec  = Math.max(0, Math.round((16-pred.thermal_expansion_coefficient.value)*7))
      const temp = Math.min(100, Math.round(pred.max_use_temperature.value/12))
      const total= Math.round((cond*0.4+tec*0.35+temp*0.25))
      if (subject==='电导率')  obj[formula]=cond
      if (subject==='TEC匹配') obj[formula]=tec
      if (subject==='温度稳定') obj[formula]=temp
      if (subject==='综合')    obj[formula]=total
    })
    return obj
  })

  return (
    <div style={{ height:'100%', display:'flex', overflow:'hidden' }}>
      {/* Left: material selector */}
      <div style={{ width:240, flexShrink:0, borderRight:'1px solid var(--border)', background:'#fff', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 14px 10px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }}>选择材料</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>已选 {selected.size} 种 · 最多10种</div>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:'10px 10px' }}>
          {Object.entries(
            allMaterials.reduce((acc, m) => {
              ;(acc[m.family]||=[]).push(m); return acc
            }, {})
          ).map(([family, mats]) => (
            <div key={family} style={{ marginBottom:12 }}>
              <div style={{ fontSize:10, color:FAMILY_COLOR[family]||'#6b7280', fontWeight:600, letterSpacing:0.5, marginBottom:6, padding:'0 2px' }}>
                {family.toUpperCase()}
              </div>
              {mats.map(m => (
                <MaterialToggle
                  key={m} formula={typeof m==='string'?m:m.formula||m}
                  name={allMaterials.find(x=>(x.formula||x)===( typeof m==='string'?m:m.formula||m))?.name||''}
                  family={family}
                  selected={selected.has(typeof m==='string'?m:m.formula||m)}
                  color={PALETTE[selectedList.indexOf(typeof m==='string'?m:m.formula||m) % PALETTE.length] || '#2563eb'}
                  onToggle={()=>toggleMaterial(typeof m==='string'?m:m.formula||m)}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Target inputs */}
        <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', background:'var(--bg3)' }}>
          <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:10, letterSpacing:0.5 }}>目标线设置</div>
          <TargetInput label="最低电导率" value={targetCond} onChange={setTargetCond} unit="S/m" step={1000} />
          <TargetInput label="最高TEC" value={targetTec} onChange={setTargetTec} unit="ppm/K" step={0.5} />
        </div>
      </div>

      {/* Right: charts */}
      <div style={{ flex:1, overflow:'auto', padding:'20px 24px', background:'var(--bg)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>性质对比分析</div>
            <div style={{ fontSize:12, color:'var(--text3)' }}>选择材料 · 拖动目标线 · 对比关键性质</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
            {[['scatter','散点图'],['radar','雷达图']].map(([mode,label])=>(
              <button key={mode} onClick={()=>setChartMode(mode)} style={{
                padding:'5px 14px', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:500,
                background: chartMode===mode ? 'var(--blue)' : '#fff',
                color: chartMode===mode ? '#fff' : 'var(--text2)',
                border:`1px solid ${chartMode===mode ? 'var(--blue)' : 'var(--border2)'}`,
                cursor:'pointer',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>
            <div style={{ width:24, height:24, border:'2px solid var(--border2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 10px' }} />
            预测中…
          </div>
        )}

        {!loading && predList.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)', fontSize:13 }}>
            请从左侧选择至少一种材料
          </div>
        )}

        {!loading && predList.length > 0 && (
          <>
            {/* Scatter: conductivity vs TEC */}
            {chartMode === 'scatter' && (
              <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'20px', marginBottom:16, boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:4 }}>电导率 vs 热膨胀系数</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:16 }}>理想材料：右下角区域（高导电率、低TEC）</div>
                <ResponsiveContainer width="100%" height={320}>
                  <ScatterChart margin={{top:10,right:30,bottom:20,left:20}}>
                    <XAxis dataKey="x" type="number" name="电导率"
                      label={{ value:'电导率 (S/m)', position:'insideBottom', offset:-10, fontSize:11, fill:'#9ca3af' }}
                      tickFormatter={v=>`${(v/1000).toFixed(0)}k`}
                      tick={{ fontSize:10, fill:'#9ca3af' }} />
                    <YAxis dataKey="y" type="number" name="TEC"
                      label={{ value:'TEC (ppm/K)', angle:-90, position:'insideLeft', fontSize:11, fill:'#9ca3af' }}
                      tick={{ fontSize:10, fill:'#9ca3af' }} domain={[6,18]} />
                    <Tooltip content={<CustomScatterTooltip />} />
                    <ReferenceLine x={targetCond} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ value:`目标: ${(targetCond/1000).toFixed(0)}k`, fill:'#dc2626', fontSize:10, position:'top' }} />
                    <ReferenceLine y={targetTec} stroke="#d97706" strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ value:`上限: ${targetTec}`, fill:'#d97706', fontSize:10, position:'right' }} />
                    <Scatter data={scatterData} isAnimationActive={false}>
                      {scatterData.map((d,i) => <Cell key={i} fill={d.color} />)}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:8, justifyContent:'center' }}>
                  {predList.map(({formula, color}) => (
                    <div key={formula} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:color }} />
                      <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--text2)' }}>{formula}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Radar */}
            {chartMode === 'radar' && (
              <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'20px', marginBottom:16, boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:16 }}>多维性质雷达图</div>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData} margin={{top:10,right:40,bottom:10,left:40}}>
                    <PolarGrid stroke="rgba(37,99,235,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize:12, fill:'#6b7280', fontFamily:'IBM Plex Mono' }} />
                    {predList.map(({formula, color}) => (
                      <Radar key={formula} name={formula} dataKey={formula}
                        stroke={color} fill={color} fillOpacity={0.07} strokeWidth={2} />
                    ))}
                    <Legend formatter={(v)=><span style={{fontSize:11,fontFamily:'monospace'}}>{v}</span>} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Property table */}
            <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontSize:13, fontWeight:600, color:'var(--text)' }}>
                性质数据表
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr style={{ background:'var(--bg3)' }}>
                      {['材料','名称','电导率 (S/m)','TEC (ppm/K)','最高温度 (°C)','达标'].map(h=>(
                        <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:500, color:'var(--text3)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {predList.map(({formula, color, pred}, i) => {
                      const cond = pred.electrical_conductivity.value
                      const tec  = pred.thermal_expansion_coefficient.value
                      const temp = pred.max_use_temperature.value
                      const pass = cond >= targetCond && tec <= targetTec
                      return (
                        <tr key={formula} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'#fff':'var(--bg3)' }}>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                              <span style={{ fontFamily:'var(--mono)', fontWeight:600, fontSize:12, color:'var(--text)' }}>{formula}</span>
                            </div>
                          </td>
                          <td style={{ padding:'10px 14px', color:'var(--text2)', fontSize:11, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pred.name}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', color: cond>=targetCond?'#059669':'#dc2626', fontWeight:500 }}>{(cond/1000).toFixed(1)}k</td>
                          <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', color: tec<=targetTec?'#059669':'#dc2626', fontWeight:500 }}>{tec.toFixed(1)}</td>
                          <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', color:'var(--text2)' }}>{temp.toFixed(0)}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span style={{ fontSize:11, padding:'2px 8px', borderRadius:10, background:pass?'#ecfdf5':'#fef2f2', color:pass?'#059669':'#dc2626', fontWeight:500 }}>
                              {pass ? '✓ 达标' : '✗ 未达标'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
