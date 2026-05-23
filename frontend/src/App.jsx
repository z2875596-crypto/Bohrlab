import React, { useState, useRef, useEffect } from 'react'
import AgentTrace from './AgentTrace.jsx'
import ResultPanel from './ResultPanel.jsx'

const EXAMPLES = [
  'I need a ceramic material with electrical conductivity > 10,000 S/m, thermal expansion coefficient < 12 ppm/K, stable above 500°C, for SOFC interconnect.',
  '寻找适合固体氧化物燃料电池互联体的钙钛矿材料，800°C下电导率 > 5000 S/m，TEC 与 YSZ 匹配（9–11 ppm/K），避免含Cr组分。',
  'Find high-temperature conductive oxide ceramics: conductivity > 5000 S/m at 800°C, TEC < 13 ppm/K, max use temp > 900°C.',
]

function Logo() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{
        width:32, height:32, borderRadius:9,
        background:'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 2px 8px rgba(37,99,235,0.3)',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1 L14 5 L14 11 L8 15 L2 11 L2 5 Z" stroke="#fff" strokeWidth="1.2" fill="none"/>
          <path d="M8 4 L11 6 L11 10 L8 12 L5 10 L5 6 Z" fill="rgba(255,255,255,0.35)"/>
          <circle cx="8" cy="8" r="1.5" fill="#fff"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing:-0.4, lineHeight:1.2 }}>KiteLab</div>
        <div style={{ fontSize:10, color:'var(--text3)', letterSpacing:1 }}>鸢见 · AI for Science</div>
      </div>
    </div>
  )
}

function StatusDot() {
  const [s, setS] = useState('checking')
  useEffect(()=>{
    fetch('/api/health').then(r=>r.json())
      .then(d=>setS(d.api_key_configured?'ready':'no-key'))
      .catch(()=>setS('offline'))
  },[])
  const map = { checking:['#9ca3af','检查中'], ready:['#059669','就绪'], 'no-key':['#d97706','未配置Key'], offline:['#dc2626','离线'] }
  const [color,label] = map[s]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', background:`${color}11`, border:`1px solid ${color}33`, borderRadius:20 }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:color }} />
      <span style={{ fontSize:11, color, fontWeight:500 }}>{label}</span>
    </div>
  )
}

function Sidebar({ onSelect, isRunning, stats, traceOpen, setTraceOpen, hasResults }) {
  return (
    <div style={{
      width:220, flexShrink:0, background:'var(--bg2)',
      borderRight:'1px solid var(--border)',
      display:'flex', flexDirection:'column', height:'100%',
    }}>
      <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid var(--border)' }}>
        <Logo />
      </div>

      <div style={{ padding:'12px 10px 0' }}>
        {[
          { icon:'⚗', label:'材料逆向设计', active:true },
          { icon:'◈', label:'文献知识库',   active:false },
          { icon:'◉', label:'性质预测',     active:false },
          { icon:'◆', label:'实验设计',     active:false },
        ].map(item=>(
          <div key={item.label} style={{
            display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
            borderRadius:'var(--r)', marginBottom:2, cursor:item.active?'default':'not-allowed',
            background:item.active?'var(--blue-dim)':'transparent',
            border:`1px solid ${item.active?'rgba(37,99,235,0.2)':'transparent'}`,
            opacity:item.active?1:0.45,
          }}>
            <span style={{ fontSize:13, color:item.active?'var(--blue)':'var(--text3)' }}>{item.icon}</span>
            <span style={{ fontSize:12, color:item.active?'var(--blue)':'var(--text3)', fontWeight:item.active?500:400 }}>{item.label}</span>
            {item.active && <div style={{ marginLeft:'auto', width:5, height:5, borderRadius:'50%', background:'var(--blue)' }} />}
          </div>
        ))}
      </div>

      {/* Trace toggle */}
      <div style={{ padding:'12px 10px 0' }}>
        <div style={{ fontSize:10, color:'var(--text3)', marginBottom:6, padding:'0 4px', letterSpacing:0.5 }}>显示设置</div>
        <div
          onClick={()=>setTraceOpen(!traceOpen)}
          style={{
            display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
            borderRadius:'var(--r)', cursor:'pointer', userSelect:'none',
            background:'var(--bg3)', border:'1px solid var(--border)',
          }}
        >
          <span style={{ fontSize:12, color:'var(--text2)' }}>推理过程</span>
          <div style={{ marginLeft:'auto', position:'relative', width:28, height:16, borderRadius:8, background:traceOpen?'var(--blue)':'var(--bg4)', transition:'background 0.2s', border:'1px solid var(--border2)' }}>
            <div style={{ position:'absolute', top:2, left:traceOpen?12:2, width:10, height:10, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 2px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
      </div>

      {/* Examples */}
      <div style={{ padding:'12px 10px', flex:1, overflow:'auto' }}>
        <div style={{ fontSize:10, color:'var(--text3)', marginBottom:8, padding:'0 4px', letterSpacing:0.5 }}>示例查询</div>
        {EXAMPLES.map((q,i)=>(
          <div key={i} onClick={()=>!isRunning&&onSelect(q)} style={{
            padding:'9px 10px', borderRadius:'var(--r)', border:'1px solid var(--border)',
            marginBottom:6, cursor:isRunning?'not-allowed':'pointer',
            opacity:isRunning?0.5:1, fontSize:11, color:'var(--text2)', lineHeight:1.5,
            background:'var(--bg3)', transition:'border-color 0.15s',
          }}
            onMouseEnter={e=>{if(!isRunning) e.currentTarget.style.borderColor='var(--border3)'}}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
          >{q.length>85?q.slice(0,85)+'…':q}</div>
        ))}
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:10, color:'var(--text3)', marginBottom:8, letterSpacing:0.5 }}>本次研究统计</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {[
              { label:'推理步骤', val:stats.steps },
              { label:'工具调用', val:stats.actions },
              { label:'候选材料', val:stats.candidates },
              { label:'推荐材料', val:stats.recommended },
            ].map(s=>(
              <div key={s.label} style={{ background:'var(--bg3)', borderRadius:'var(--r-sm)', padding:'6px 8px', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:16, fontFamily:'var(--mono)', fontWeight:700, color:'var(--blue)' }}>{s.val}</div>
                <div style={{ fontSize:9, color:'var(--text3)', marginTop:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding:'10px 14px', borderTop:'1px solid var(--border)' }}>
        <StatusDot />
      </div>
    </div>
  )
}

function InterventionBox({ onIntervene, isRunning }) {
  const [text, setText] = useState('')
  const submit = () => { if(!text.trim()||isRunning) return; onIntervene(text.trim()); setText('') }
  return (
    <div style={{ background:'#faf5ff', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'var(--r-lg)', overflow:'hidden', marginTop:10 }}>
      <div style={{ padding:'8px 14px', borderBottom:'1px solid rgba(124,58,237,0.1)', display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:12, color:'var(--purple)' }}>⟳</span>
        <span style={{ fontSize:11, color:'var(--purple)', fontWeight:500 }}>人工介入 · 调整约束重新筛选</span>
      </div>
      <div style={{ display:'flex' }}>
        <input
          value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') submit() }}
          placeholder='例：排除含Cr材料，重新筛选…'
          style={{ flex:1, padding:'10px 14px', background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:12 }}
        />
        <button onClick={submit} disabled={!text.trim()||isRunning} style={{
          background:text.trim()&&!isRunning?'var(--purple)':'var(--bg3)',
          border:'none', borderLeft:'1px solid rgba(124,58,237,0.15)',
          padding:'0 16px', fontSize:12, fontWeight:500,
          color:text.trim()&&!isRunning?'#fff':'var(--text3)',
          transition:'all 0.15s',
        }}>提交 →</button>
      </div>
    </div>
  )
}

export default function App() {
  const [query, setQuery]       = useState('')
  const [events, setEvents]     = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [finalContent, setFinalContent] = useState(null)
  const [ranked, setRanked]     = useState([])
  const [synthesisMap, setSynthesisMap] = useState({})
  const [stats, setStats]       = useState({total:0,steps:0,actions:0,candidates:0,recommended:0})
  const [traceOpen, setTraceOpen] = useState(true)
  const traceRef = useRef(null)

  const scrollTrace = () => setTimeout(()=>{ if(traceRef.current) traceRef.current.scrollTop=traceRef.current.scrollHeight },60)

  const runResearch = async (q) => {
    setEvents([]); setFinalContent(null); setRanked([]); setSynthesisMap({})
    setIsRunning(true); setStats({total:0,steps:0,actions:0,candidates:0,recommended:0})
    let actionCount = 0
    try {
      const resp = await fetch('/api/research',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({query:q}),
      })
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buf=''
      while(true){
        const {done,value} = await reader.read()
        if(done) break
        buf += decoder.decode(value,{stream:true})
        const lines = buf.split('\n'); buf=lines.pop()
        for(const line of lines){
          if(!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if(raw==='[DONE]'){ setIsRunning(false); return }
          try{
            const ev = JSON.parse(raw)
            setEvents(prev=>[...prev,ev]); scrollTrace()
            if(ev.type==='action') actionCount++
            if(ev.type==='observation'&&ev.tool==='score_and_rank'){
              const r=ev.result?.ranked_candidates
              if(r?.length){ setRanked(r); setStats(s=>({...s,candidates:r.length,recommended:r.filter(m=>m.recommendation==='Recommended').length})) }
            }
            if(ev.type==='observation'&&ev.tool==='get_synthesis_route'){
              const {formula,route}=ev.result||{}
              if(formula&&route) setSynthesisMap(prev=>({...prev,[formula]:route}))
            }
            if(ev.type==='final'){
              setFinalContent(ev.content)
              setStats(s=>({...s,total:1,steps:ev.total_steps||0,actions:actionCount}))
            }
          }catch{}
        }
      }
    }catch(err){
      setEvents(prev=>[...prev,{type:'error',message:String(err)}])
    }finally{ setIsRunning(false) }
  }

  const hasResults = finalContent||ranked.length>0

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg)', overflow:'hidden' }}>
      <Sidebar
        onSelect={q=>{setQuery(q);runResearch(q)}}
        isRunning={isRunning} stats={stats}
        traceOpen={traceOpen} setTraceOpen={setTraceOpen}
        hasResults={hasResults}
      />

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <div style={{ height:48, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 20px', gap:12, background:'var(--bg2)', flexShrink:0, boxShadow:'0 1px 0 var(--border)' }}>
          <span style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>材料逆向设计</span>
          <span style={{ color:'var(--border2)' }}>·</span>
          <span style={{ fontSize:12, color:'var(--text3)' }}>SOFC 互联体候选材料发现</span>
          <div style={{ flex:1 }} />
          {isRunning && (
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--blue)' }}>
              <div style={{ width:10, height:10, border:'2px solid var(--blue-mid)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              智能体运行中
            </div>
          )}
          <span style={{ fontSize:11, color:'var(--text3)' }}>DeepSeek · ReAct</span>
        </div>

        <div style={{ flex:1, display:'grid', gridTemplateColumns:'360px 1fr', overflow:'hidden' }}>
          {/* Left: input */}
          <div style={{ borderRight:'1px solid var(--border)', padding:16, overflow:'auto', display:'flex', flexDirection:'column', gap:0, background:'var(--bg2)' }}>
            {/* Query box */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ padding:'8px 14px 6px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:6, background:'var(--bg3)' }}>
                <span style={{ fontSize:11, color:'var(--text3)', fontWeight:500, letterSpacing:0.5 }}>研究目标</span>
              </div>
              <textarea
                value={query} onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&query.trim()) runResearch(query) }}
                placeholder={'描述目标材料性能需求...\n例：电导率 > 10⁴ S/m、TEC < 12 ppm/K、800°C 稳定'}
                disabled={isRunning}
                style={{ width:'100%', minHeight:110, padding:'12px 14px', background:'#fff', border:'none', outline:'none', resize:'vertical', color:'var(--text)', fontSize:13, lineHeight:1.7 }}
              />
              <div style={{ padding:'8px 14px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8, background:'var(--bg3)' }}>
                <span style={{ fontSize:10, color:'var(--text3)' }}>Ctrl+Enter 提交</span>
                <div style={{ flex:1 }} />
                <button onClick={()=>{setQuery('');setEvents([]);setFinalContent(null);setRanked([]);setSynthesisMap({});setStats({total:0,steps:0,actions:0,candidates:0,recommended:0})}} style={{ background:'none', border:'1px solid var(--border2)', borderRadius:'var(--r-sm)', padding:'5px 12px', fontSize:11, color:'var(--text3)' }}>清除</button>
                <button
                  onClick={()=>{ if(query.trim()) runResearch(query) }}
                  disabled={isRunning||!query.trim()}
                  style={{ background:isRunning||!query.trim()?'var(--bg4)':'var(--blue)', border:'none', borderRadius:'var(--r-sm)', padding:'5px 16px', fontSize:12, fontWeight:600, color:isRunning||!query.trim()?'var(--text3)':'#fff', transition:'all 0.15s', boxShadow:isRunning||!query.trim()?'none':'0 2px 8px rgba(37,99,235,0.3)' }}
                >{isRunning?'研究中…':'开始研究 →'}</button>
              </div>
            </div>

            {hasResults && !isRunning && <InterventionBox onIntervene={msg=>runResearch(`Based on previous results, please refine with this constraint: ${msg}`)} isRunning={isRunning} />}

            {/* Trace panel (collapsible) */}
            {traceOpen && (
              <div style={{ marginTop:12, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', flex:1 }}>
                <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:6, background:'var(--bg3)' }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--blue)', animation:isRunning?'pulse-dot 1s infinite':'none' }} />
                  <span style={{ fontSize:10, color:'var(--text3)', fontWeight:500, letterSpacing:0.5 }}>AGENT TRACE</span>
                </div>
                <div ref={traceRef} style={{ padding:'12px', maxHeight:340, overflow:'auto' }}>
                  <AgentTrace events={events} isRunning={isRunning} />
                </div>
              </div>
            )}
          </div>

          {/* Right: results (takes most space) */}
          <div style={{ overflow:'auto', padding:'20px 24px', background:'var(--bg)' }}>
            {!hasResults && !isRunning && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16, color:'var(--text3)' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--bg2)', border:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:'var(--shadow-sm)' }}>⚗</div>
                <div style={{ textAlign:'center', lineHeight:1.9 }}>
                  <div style={{ fontSize:15, fontWeight:500, color:'var(--text2)', marginBottom:4 }}>鸢见 · KiteLab</div>
                  <div style={{ fontSize:12 }}>输入目标性能需求，智能体将自动完成</div>
                  <div style={{ fontSize:12 }}>文献检索 → 性质预测 → 评分排序 → 合成方案</div>
                </div>
              </div>
            )}
            {isRunning && !hasResults && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12, color:'var(--text3)' }}>
                <div style={{ width:36, height:36, border:'3px solid var(--blue-mid)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                <div style={{ fontSize:13, color:'var(--text2)' }}>智能体正在研究中，请稍候…</div>
              </div>
            )}
            {hasResults && (
              <div style={{ animation:'fade-in 0.4s ease' }}>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:16, display:'flex', alignItems:'center', gap:6, letterSpacing:0.5 }}>
                  <span style={{ fontWeight:500, color:'var(--text2)' }}>RESEARCH RESULTS</span>
                  <span>·</span>
                  <span>{ranked.length} 种候选材料</span>
                </div>
                <ResultPanel finalContent={finalContent} rankedCandidates={ranked} synthesisMap={synthesisMap} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
