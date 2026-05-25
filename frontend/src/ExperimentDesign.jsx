import React, { useState, useEffect } from 'react'

const EXP_TYPES = [
  {
    key: 'synthesis',
    icon: '⚗',
    label: '合成工艺',
    desc: '粉末合成、烧结工艺、致密化',
    detail: '生成从原料称量→球磨→煅烧→压片→烧结的完整制备流程，包含温度曲线和气氛控制',
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    key: 'characterization',
    icon: '◈',
    label: '结构表征',
    desc: 'XRD、SEM/TEM、XPS、EDS',
    detail: '生成物相分析(XRD)、形貌表征(SEM/TEM)、成分分析(EDS/XPS)的完整测试方案',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    key: 'performance',
    icon: '◉',
    label: '性能测试',
    desc: '电导率、热膨胀、长期稳定性',
    detail: '生成四探针电导率测量、热膨胀仪(DIL)测试、长期氧化稳定性评估的实验方案',
    color: '#059669',
    bg: '#ecfdf5',
  },
]

const FAMILY_LABEL = {
  'perovskite': '钙钛矿',
  'spinel': '尖晶石',
  'ruddlesden-popper': 'R-P 相',
  'fluorite': '萤石',
  'corundum': '刚玉',
  'simple oxide': '简单氧化物',
}

const DIFF_META = {
  Low:    { color:'#059669', bg:'#ecfdf5' },
  Medium: { color:'#d97706', bg:'#fffbeb' },
  High:   { color:'#dc2626', bg:'#fef2f2' },
}

// ── Material selector (custom, not native select) ──────────────────────────
function MaterialSelector({ materials, value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = materials.find(m => m.formula === value)

  // Group by family
  const groups = materials.reduce((acc, m) => {
    ;(acc[m.family] = acc[m.family] || []).push(m)
    return acc
  }, {})

  return (
    <div style={{ position:'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'9px 12px', background:'var(--bg3)',
          border:`1px solid ${open ? 'var(--blue)' : 'var(--border2)'}`,
          borderRadius:'var(--r)', cursor:'pointer', userSelect:'none',
          boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
          transition:'all 0.15s',
        }}
      >
        {selected ? (
          <div>
            <div style={{ fontSize:12, fontFamily:'var(--mono)', fontWeight:600, color:'var(--text)' }}>{selected.formula}</div>
            <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{selected.name}</div>
          </div>
        ) : (
          <span style={{ fontSize:12, color:'var(--text3)' }}>选择材料…</span>
        )}
        <span style={{ fontSize:10, color:'var(--text3)', transition:'transform 0.15s', transform: open?'rotate(180deg)':'none' }}>▼</span>
      </div>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
          background:'#fff', border:'1px solid var(--border2)',
          borderRadius:'var(--r)', boxShadow:'var(--shadow)',
          zIndex:100, maxHeight:300, overflow:'auto',
        }}>
          {Object.entries(groups).map(([family, mats]) => (
            <div key={family}>
              <div style={{ padding:'6px 12px 4px', fontSize:10, fontWeight:600, color:'var(--text3)', background:'var(--bg3)', letterSpacing:0.5, position:'sticky', top:0 }}>
                {FAMILY_LABEL[family] || family}
              </div>
              {mats.map(m => (
                <div
                  key={m.formula}
                  onClick={() => { onChange(m.formula); setOpen(false) }}
                  style={{
                    padding:'8px 14px', cursor:'pointer',
                    background: value===m.formula ? 'var(--blue-dim)' : 'transparent',
                    borderLeft: `3px solid ${value===m.formula ? 'var(--blue)' : 'transparent'}`,
                    transition:'all 0.1s',
                  }}
                  onMouseEnter={e => { if (value!==m.formula) e.currentTarget.style.background='var(--bg3)' }}
                  onMouseLeave={e => { if (value!==m.formula) e.currentTarget.style.background='transparent' }}
                >
                  <div style={{ fontSize:12, fontFamily:'var(--mono)', fontWeight:500, color: value===m.formula?'var(--blue)':'var(--text)' }}>{m.formula}</div>
                  <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{m.name}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {open && <div style={{ position:'fixed', inset:0, zIndex:99 }} onClick={() => setOpen(false)} />}
    </div>
  )
}

// ── Experiment type card ───────────────────────────────────────────────────
function ExpTypeCard({ type, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding:'12px 14px', borderRadius:'var(--r)', cursor:'pointer',
        background: selected ? type.bg : 'var(--bg3)',
        border:`1.5px solid ${selected ? type.color+'55' : 'var(--border)'}`,
        transition:'all 0.15s', marginBottom:8,
      }}
    >
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: selected?6:0 }}>
        <span style={{ fontSize:16 }}>{type.icon}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color: selected?type.color:'var(--text)' }}>{type.label}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{type.desc}</div>
        </div>
        <div style={{ marginLeft:'auto', width:16, height:16, borderRadius:'50%', border:`2px solid ${selected?type.color:'var(--border2)'}`, background: selected?type.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {selected && <div style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }} />}
        </div>
      </div>
      {selected && (
        <div style={{ fontSize:11, color:type.color, lineHeight:1.6, paddingLeft:26, animation:'slide-in 0.15s ease' }}>
          {type.detail}
        </div>
      )}
    </div>
  )
}

// ── Step card ──────────────────────────────────────────────────────────────
function StepCard({ step, index }) {
  const [open, setOpen] = useState(index < 3)
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', marginBottom:8 }}>
      <div onClick={() => setOpen(!open)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', userSelect:'none' }}>
        <div style={{
          width:28, height:28, borderRadius:'50%', flexShrink:0,
          background:'var(--blue-dim)', border:'1px solid rgba(37,99,235,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontFamily:'var(--mono)', fontWeight:600, color:'var(--blue)',
        }}>{index+1}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{step.title}</div>
          <div style={{ display:'flex', gap:12, marginTop:2, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'var(--text3)' }}>⏱ {step.duration}</span>
            {step.temperature && <span style={{ fontSize:11, color:'var(--text3)' }}>🌡 {step.temperature}</span>}
            {step.atmosphere  && <span style={{ fontSize:11, color:'var(--text3)' }}>💨 {step.atmosphere}</span>}
          </div>
        </div>
        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'var(--bg3)', color:'var(--text3)' }}>{step.phase}</span>
        <span style={{ color:'var(--text3)', fontSize:12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding:'0 16px 14px', borderTop:'1px solid var(--border)', animation:'slide-in 0.15s ease' }}>
          <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7, marginTop:10, marginBottom:8 }}>{step.description}</div>
          {step.expected_outcome && (
            <div style={{ padding:'8px 12px', background:'var(--green-dim)', borderRadius:'var(--r-sm)', border:'1px solid rgba(5,150,105,0.15)', fontSize:11, color:'#059669', lineHeight:1.6 }}>
              <span style={{ fontWeight:600 }}>预期结果：</span>{step.expected_outcome}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Plan view ──────────────────────────────────────────────────────────────
function PlanView({ plan, material, onReset }) {
  const diff = DIFF_META[plan.difficulty] || DIFF_META.Medium

  const exportMarkdown = () => {
    const lines = [
      `# ${plan.title}`, ``,
      `**材料：** ${material}  `,
      `**实验类型：** ${plan.experiment_type}  `,
      `**预计周期：** ${plan.estimated_duration}  `,
      `**难度：** ${plan.difficulty}`, ``,
      `## 实验目标`, plan.objective, ``,
      `## 安全注意事项`,
      ...(plan.safety_notes||[]).map(n => `- ⚠️ ${n}`), ``,
      `## 所需设备`,
      ...(plan.equipment||[]).map(e => `- **${e.name}**：${e.purpose}`), ``,
      `## 试剂清单`,
      ...(plan.reagents||[]).map(r => `- ${r.name}，${r.amount}，纯度 ${r.purity}`), ``,
      `## 实验步骤`,
      ...(plan.steps||[]).flatMap((s,i) => [
        `### ${i+1}. ${s.title} [${s.phase}]`,
        `**时长：** ${s.duration}${s.temperature?`  **温度：** ${s.temperature}`:''}`,
        ``, s.description,
        s.expected_outcome ? `\n> 预期：${s.expected_outcome}` : '',
        ``,
      ]), ``,
      `## 表征计划`,
      ...(plan.characterization_targets||[]).map(c => `- **${c.technique}**：${c.purpose}`), ``,
      `## 成功判据`,
      ...(plan.success_criteria||[]).map(c => `- ✓ ${c}`), ``,
      `---`,
      `*由 KiteLab 鸢见 · AI for Science 生成*`,
    ]
    const blob = new Blob([lines.join('\n')], { type:'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${material}_experiment_plan.md`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ animation:'fade-in 0.3s ease' }}>
      {/* Header */}
      <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'18px 22px', marginBottom:14, boxShadow:'var(--shadow-sm)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:6 }}>{plan.title}</div>
            <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7, marginBottom:10 }}>{plan.objective}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'var(--blue-dim)', color:'var(--blue)', border:'1px solid rgba(37,99,235,0.2)', fontFamily:'var(--mono)' }}>{material}</span>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)', border:'1px solid var(--border)' }}>⏱ {plan.estimated_duration}</span>
              <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:diff.bg, color:diff.color, border:`1px solid ${diff.color}33` }}>{plan.difficulty}</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            <button onClick={exportMarkdown} style={{ background:'var(--blue)', color:'#fff', border:'none', borderRadius:'var(--r-sm)', padding:'7px 14px', fontSize:12, fontWeight:500, cursor:'pointer', boxShadow:'0 2px 8px rgba(37,99,235,0.25)' }}>
              导出 ↓
            </button>
            <button onClick={onReset} style={{ background:'none', border:'1px solid var(--border2)', borderRadius:'var(--r-sm)', padding:'7px 12px', fontSize:12, color:'var(--text2)', cursor:'pointer' }}>
              重新生成
            </button>
          </div>
        </div>
      </div>

      {/* Safety + Success */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div style={{ background:'#fff8f0', border:'1px solid rgba(217,119,6,0.2)', borderRadius:'var(--r-lg)', padding:'14px 16px' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#d97706', marginBottom:8 }}>⚠ 安全注意事项</div>
          {(plan.safety_notes||[]).map((n,i) => (
            <div key={i} style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:4, display:'flex', gap:6 }}>
              <span style={{ color:'#d97706', flexShrink:0 }}>•</span>{n}
            </div>
          ))}
        </div>
        <div style={{ background:'#f0fdf4', border:'1px solid rgba(5,150,105,0.2)', borderRadius:'var(--r-lg)', padding:'14px 16px' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#059669', marginBottom:8 }}>✓ 成功判据</div>
          {(plan.success_criteria||[]).map((c,i) => (
            <div key={i} style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:4, display:'flex', gap:6 }}>
              <span style={{ color:'#059669', flexShrink:0 }}>✓</span>{c}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment + Reagents */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 16px', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:10 }}>所需设备</div>
          {(plan.equipment||[]).map((e,i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:8, paddingBottom:8, borderBottom: i<plan.equipment.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--blue)', flexShrink:0, marginTop:5 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--text)' }}>{e.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{e.purpose}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 16px', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:10 }}>试剂清单</div>
          {(plan.reagents||[]).map((r,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:8, paddingBottom:8, borderBottom: i<plan.reagents.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ width:6, height:6, borderRadius:2, background:'var(--amber)', flexShrink:0, marginTop:4 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', fontFamily:'var(--mono)' }}>{r.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{r.amount} · {r.purity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:10 }}>实验步骤（{(plan.steps||[]).length} 步）</div>
        {(plan.steps||[]).map((s,i) => <StepCard key={i} step={s} index={i} />)}
      </div>

      {/* Characterization */}
      {(plan.characterization_targets||[]).length > 0 && (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 18px', marginBottom:14, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:12 }}>表征计划</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {plan.characterization_targets.map((c,i) => (
              <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:'var(--bg3)', borderRadius:'var(--r)', border:'1px solid var(--border)' }}>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:4, background:'var(--blue-dim)', color:'var(--blue)', fontFamily:'var(--mono)', fontWeight:600, flexShrink:0 }}>{c.technique}</span>
                <div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{c.purpose}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>预期：{c.expected_result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      {(plan.troubleshooting||[]).length > 0 && (
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 18px', marginBottom:14, boxShadow:'var(--shadow-sm)' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:12 }}>故障排查</div>
          {plan.troubleshooting.map((t,i) => (
            <div key={i} style={{ marginBottom:8, padding:'10px 12px', background:'#fef2f2', borderRadius:'var(--r)', border:'1px solid rgba(220,38,38,0.15)' }}>
              <div style={{ fontSize:12, fontWeight:500, color:'#dc2626', marginBottom:4 }}>问题：{t.problem}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>解决：{t.solution}</div>
            </div>
          ))}
        </div>
      )}

      {/* References */}
      {(plan.references||[]).length > 0 && (
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 16px' }}>
          <div style={{ fontSize:11, fontWeight:500, color:'var(--text3)', marginBottom:8 }}>参考文献</div>
          {plan.references.map((r,i) => (
            <div key={i} style={{ fontSize:11, color:'var(--text2)', marginBottom:4, display:'flex', gap:8 }}>
              <span style={{ color:'var(--text3)', fontFamily:'var(--mono)', flexShrink:0 }}>[{i+1}]</span>{r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ExperimentDesign() {
  const [materials, setMaterials]     = useState([])
  const [material, setMaterial]       = useState('')
  const [expType, setExpType]         = useState('synthesis')
  const [objectives, setObjectives]   = useState('')
  const [constraints, setConstraints] = useState('')
  const [loading, setLoading]         = useState(false)
  const [plan, setPlan]               = useState(null)
  const [error, setError]             = useState('')

  useEffect(() => {
    fetch('/api/experiment/materials')
      .then(r => r.json())
      .then(d => setMaterials(d.materials || []))
      .catch(() => setMaterials([]))
  }, [])

  const handleGenerate = async () => {
    if (!material || !objectives.trim()) return
    setLoading(true); setError(''); setPlan(null)
    try {
      const resp = await fetch('/api/experiment/generate', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ material, experiment_type:expType, objectives, constraints }),
      })
      const data = await resp.json()
      if (data.success) setPlan(data.plan)
      else setError(data.error || '生成失败，请重试')
    } catch(e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = material && objectives.trim() && !loading

  return (
    <div style={{ height:'100%', display:'flex', overflow:'hidden' }}>
      {/* Left config panel */}
      <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--border)', background:'#fff', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:2 }}>实验方案设计</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>AI 驱动 · 一键生成完整实验方案</div>
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'16px 14px' }}>
          {/* Material selector */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:8 }}>目标材料</div>
            <MaterialSelector
              materials={materials}
              value={material}
              onChange={setMaterial}
            />
          </div>

          {/* Experiment type */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:8 }}>实验类型</div>
            {EXP_TYPES.map(t => (
              <ExpTypeCard
                key={t.key} type={t}
                selected={expType === t.key}
                onClick={() => setExpType(t.key)}
              />
            ))}
          </div>

          {/* Objectives */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>
              实验目标 <span style={{ color:'var(--red)' }}>*</span>
            </div>
            <textarea
              value={objectives}
              onChange={e => setObjectives(e.target.value)}
              placeholder={
                expType === 'synthesis'         ? '例：合成单相 La0.8Sr0.2MnO3，致密度 ≥95%，电导率 ≥10⁵ S/m' :
                expType === 'characterization'  ? '例：表征相纯度、晶粒尺寸分布和元素均匀性' :
                '例：在 600–900°C 范围内测量电导率随温度的变化关系'
              }
              style={{ width:'100%', minHeight:90, padding:'9px 10px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--r)', color:'var(--text)', fontSize:12, lineHeight:1.6, resize:'vertical', outline:'none' }}
            />
          </div>

          {/* Constraints */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>约束条件（可选）</div>
            <textarea
              value={constraints}
              onChange={e => setConstraints(e.target.value)}
              placeholder='例：最高炉温 1200°C；无惰性气氛保护设备；预算有限'
              style={{ width:'100%', minHeight:64, padding:'9px 10px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'var(--r)', color:'var(--text)', fontSize:12, lineHeight:1.6, resize:'vertical', outline:'none' }}
            />
          </div>
        </div>

        {/* Generate button */}
        <div style={{ padding:'14px', borderTop:'1px solid var(--border)' }}>
          {error && (
            <div style={{ fontSize:11, color:'#dc2626', marginBottom:8, lineHeight:1.5, padding:'8px 10px', background:'#fef2f2', borderRadius:'var(--r-sm)', border:'1px solid rgba(220,38,38,0.2)' }}>
              {error}
            </div>
          )}
          {!material && (
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, textAlign:'center' }}>请先选择目标材料</div>
          )}
          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            style={{
              width:'100%', padding:'11px',
              borderRadius:'var(--r)', border:'none',
              background: canSubmit ? 'var(--blue)' : 'var(--bg4)',
              color: canSubmit ? '#fff' : 'var(--text3)',
              fontSize:13, fontWeight:600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              boxShadow: canSubmit ? '0 2px 10px rgba(37,99,235,0.3)' : 'none',
              transition:'all 0.15s',
            }}
          >
            {loading ? '生成中…' : '生成实验方案 →'}
          </button>
        </div>
      </div>

      {/* Right: plan view */}
      <div style={{ flex:1, overflow:'auto', padding:'20px 24px', background:'var(--bg)' }}>
        {!plan && !loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, color:'var(--text3)' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#fff', border:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:'var(--shadow-sm)' }}>◆</div>
            <div style={{ textAlign:'center', lineHeight:1.9 }}>
              <div style={{ fontSize:15, fontWeight:500, color:'var(--text2)', marginBottom:4 }}>AI 实验方案生成器</div>
              <div style={{ fontSize:12 }}>① 选择材料  ② 选择实验类型  ③ 描述目标</div>
              <div style={{ fontSize:12 }}>点击生成 → 获得完整实验方案</div>
            </div>
            {/* Type preview cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, maxWidth:520, marginTop:8 }}>
              {EXP_TYPES.map(t => (
                <div key={t.key} style={{ padding:'12px', background:'#fff', borderRadius:'var(--r)', border:'1px solid var(--border)', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
                  <div style={{ fontSize:20, marginBottom:6 }}>{t.icon}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:4 }}>{t.label}</div>
                  <div style={{ fontSize:10, color:'var(--text3)', lineHeight:1.5 }}>{t.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:14 }}>
            <div style={{ width:36, height:36, border:'3px solid var(--blue-mid)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
            <div style={{ fontSize:13, color:'var(--text2)' }}>AI 正在生成实验方案，请稍候…</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>通常需要 10–20 秒</div>
          </div>
        )}
        {plan && !loading && (
          <PlanView plan={plan} material={material} onReset={() => setPlan(null)} />
        )}
      </div>
    </div>
  )
}
