import React, { useState, useEffect, useRef } from 'react'

const CAT_META = {
  'perovskite':        { color:'#2563eb', bg:'#eff6ff', label:'钙钛矿' },
  'spinel':            { color:'#059669', bg:'#ecfdf5', label:'尖晶石' },
  'ruddlesden-popper': { color:'#7c3aed', bg:'#f5f3ff', label:'R-P 相' },
  'simple oxide':      { color:'#6b7280', bg:'#f9fafb', label:'简单氧化物' },
  'review':            { color:'#d97706', bg:'#fffbeb', label:'综述' },
  'synthesis':         { color:'#0891b2', bg:'#ecfeff', label:'合成工艺' },
  'stability':         { color:'#dc2626', bg:'#fef2f2', label:'稳定性' },
  'computational':     { color:'#7c3aed', bg:'#f5f3ff', label:'计算材料' },
  'emerging':          { color:'#059669', bg:'#ecfdf5', label:'前沿研究' },
  'user-uploaded':     { color:'#ea580c', bg:'#fff7ed', label:'我的上传' },
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color='var(--blue)' }) {
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 18px', boxShadow:'var(--shadow-sm)' }}>
      <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--mono)', color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{sub}</div>}
    </div>
  )
}

function RelevanceBar({ score }) {
  const pct = Math.round(score * 100)
  const color = pct >= 90 ? '#059669' : pct >= 80 ? '#2563eb' : '#d97706'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:3, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:2 }} />
      </div>
      <span style={{ fontSize:10, fontFamily:'var(--mono)', color, minWidth:28 }}>{pct}%</span>
    </div>
  )
}

function PaperCard({ paper, onClick, onDelete, isUser }) {
  const meta = CAT_META[paper.category] || { color:'#6b7280', bg:'#f9fafb', label:paper.category }
  return (
    <div
      style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'14px 16px', cursor:'pointer', transition:'all 0.15s', boxShadow:'var(--shadow-sm)', position:'relative' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border3)'; e.currentTarget.style.boxShadow='var(--shadow)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='var(--shadow-sm)' }}
      onClick={() => onClick(paper)}
    >
      {isUser && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(paper.id) }}
          style={{ position:'absolute', top:10, right:10, background:'none', border:'1px solid rgba(220,38,38,0.2)', borderRadius:4, padding:'2px 7px', fontSize:10, color:'#dc2626', cursor:'pointer', zIndex:1 }}
        >删除</button>
      )}
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, flexShrink:0, marginTop:2, background:meta.bg, color:meta.color, border:`1px solid ${meta.color}33`, fontWeight:500 }}>
          {meta.label}
        </span>
        <div style={{ flex:1, minWidth:0, paddingRight: isUser ? 60 : 0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.5, marginBottom:3 }}>{paper.title}</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>
            {paper.authors?.slice(0,2).join(', ')}{paper.authors?.length > 2 ? ' et al.' : ''} · {paper.journal} · {paper.year}
          </div>
        </div>
      </div>
      <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:10, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
        {paper.abstract}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        {paper.extracted_materials?.length > 0 && (
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', flex:1 }}>
            {paper.extracted_materials.map(m => (
              <span key={m} style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:'var(--blue-dim)', color:'var(--blue)', border:'1px solid rgba(37,99,235,0.15)', fontFamily:'var(--mono)' }}>{m}</span>
            ))}
          </div>
        )}
        <div style={{ minWidth:100 }}>
          <div style={{ fontSize:10, color:'var(--text3)', marginBottom:2 }}>相关度</div>
          <RelevanceBar score={paper.relevance_score || 0.8} />
        </div>
      </div>
    </div>
  )
}

function PaperModal({ paper, onClose }) {
  if (!paper) return null
  const meta = CAT_META[paper.category] || { color:'#6b7280', bg:'#f9fafb', label:paper.category }
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(2px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:680, maxHeight:'85vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', animation:'slide-in 0.2s ease' }}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:meta.bg, color:meta.color, border:`1px solid ${meta.color}33`, fontWeight:500, flexShrink:0, marginTop:2 }}>{meta.label}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', lineHeight:1.5 }}>{paper.title}</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>{paper.authors?.join(', ')} · {paper.journal} · {paper.year}</div>
            </div>
            <button onClick={onClose} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'var(--text3)', flexShrink:0, cursor:'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ padding:'18px 22px' }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500, marginBottom:8 }}>摘要</div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.8, background:'var(--bg3)', borderRadius:'var(--r)', padding:'12px 14px', border:'1px solid var(--border)' }}>{paper.abstract}</div>
          </div>
          {paper.extracted_materials?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500, marginBottom:10 }}>提取材料</div>
              {paper.extracted_materials.map(m => {
                const props = paper.key_properties?.[m]
                return (
                  <div key={m} style={{ background:'var(--blue-dim)', border:'1px solid rgba(37,99,235,0.15)', borderRadius:'var(--r)', padding:'10px 14px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontFamily:'var(--mono)', fontWeight:600, color:'var(--blue)' }}>{m}</span>
                    {props && (
                      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                        {props.conductivity_S_m && <span style={{ fontSize:11, color:'var(--text2)' }}>σ = {(props.conductivity_S_m/1000).toFixed(0)}k S/m</span>}
                        {props.tec_ppm_K       && <span style={{ fontSize:11, color:'var(--text2)' }}>TEC = {props.tec_ppm_K} ppm/K</span>}
                        {props.test_temp_C     && <span style={{ fontSize:11, color:'var(--text3)' }}>@ {props.test_temp_C}°C</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {paper.tags?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:500, marginBottom:8 }}>标签</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {paper.tags.map(t => <span key={t} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)', border:'1px solid var(--border)' }}>{t}</span>)}
              </div>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
            <div style={{ flex:1 }}>
              {paper.doi && <div style={{ fontSize:11, color:'var(--text3)' }}>DOI: <span style={{ fontFamily:'var(--mono)', color:'var(--text2)' }}>{paper.doi}</span></div>}
              {paper.source === 'user-uploaded' && <div style={{ fontSize:11, color:'#ea580c', marginTop:2 }}>📄 用户上传 · {paper.filename}</div>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ fontSize:11, color:'var(--text3)' }}>相关度</div>
              <div style={{ width:80 }}><RelevanceBar score={paper.relevance_score || 0.8} /></div>
            </div>
            {paper.url && (
              <a href={paper.url} target="_blank" rel="noopener noreferrer" style={{ background:'var(--blue)', color:'#fff', border:'none', borderRadius:'var(--r-sm)', padding:'6px 14px', fontSize:12, fontWeight:500, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                查看原文 ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Upload zone ────────────────────────────────────────────────────────────────
function UploadZone({ onUploadSuccess }) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus]       = useState(null)  // {type:'success'|'error', msg}
  const inputRef = useRef(null)

  const upload = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setStatus({ type:'error', msg:'请上传 PDF 文件' })
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setStatus({ type:'error', msg:'文件过大（最大 20 MB）' })
      return
    }
    setUploading(true); setStatus(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const resp = await fetch('/api/kb/upload', { method:'POST', body:form })
      const data = await resp.json()
      if (resp.ok && data.success) {
        setStatus({ type:'success', msg:`成功提取：《${data.paper.title.slice(0,40)}${data.paper.title.length>40?'…':''}》` })
        onUploadSuccess(data.paper)
      } else {
        setStatus({ type:'error', msg: data.detail || data.error || '上传失败' })
      }
    } catch(e) {
      setStatus({ type:'error', msg: String(e) })
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <div style={{ marginBottom:20 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border:`2px dashed ${dragging ? 'var(--blue)' : 'var(--border2)'}`,
          borderRadius:'var(--r-lg)', padding:'28px 20px', textAlign:'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? 'var(--blue-dim)' : '#fff',
          transition:'all 0.15s',
        }}
      >
        {uploading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, border:'3px solid var(--blue-mid)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
            <div style={{ fontSize:13, color:'var(--blue)' }}>AI 正在解析文献…</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>通常需要 10–20 秒</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize:28, marginBottom:8 }}>📄</div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)', marginBottom:4 }}>拖拽 PDF 到此处，或点击上传</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>AI 自动提取标题、摘要、材料数据 · 最大 20 MB</div>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => { if (e.target.files[0]) upload(e.target.files[0]); e.target.value='' }} />
      {status && (
        <div style={{
          marginTop:10, padding:'10px 14px', borderRadius:'var(--r)',
          background: status.type==='success' ? '#f0fdf4' : '#fef2f2',
          border:`1px solid ${status.type==='success' ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)'}`,
          fontSize:12, color: status.type==='success' ? '#059669' : '#dc2626',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span>{status.type==='success' ? '✓' : '✕'}</span>
          {status.msg}
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function KnowledgeBase() {
  const [activeTab, setActiveTab]   = useState('curated')   // 'curated' | 'user'
  const [stats, setStats]           = useState(null)
  const [papers, setPapers]         = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch]         = useState('')
  const [selectedPaper, setSelectedPaper] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [userPapers, setUserPapers] = useState([])

  const fetchPapers = (tab, cat='', q='') => {
    setLoading(true)
    let url
    if (tab === 'user') {
      url = '/api/kb/papers?source=user' + (q ? `&search=${encodeURIComponent(q)}` : '')
    } else {
      url = '/api/kb/papers?source=curated' + (q ? `&search=${encodeURIComponent(q)}` : '') + (cat ? `&category=${cat}` : '')
    }
    fetch(url).then(r=>r.json()).then(d => { setPapers(d.papers||[]); setLoading(false) })
  }

  useEffect(() => {
    fetch('/api/kb/stats').then(r=>r.json()).then(setStats)
    fetchPapers('curated')
    fetch('/api/kb/papers?source=user').then(r=>r.json()).then(d => setUserPapers(d.papers||[]))
  }, [])

  const handleTab = (tab) => {
    setActiveTab(tab); setActiveCategory(''); setSearch('')
    fetchPapers(tab)
  }

  const handleCategory = (cat) => {
    const next = activeCategory===cat ? '' : cat
    setActiveCategory(next)
    fetchPapers(activeTab, next, search)
  }

  const handleSearch = (q) => {
    setSearch(q); setActiveCategory('')
    fetchPapers(activeTab, '', q)
  }

  const handleUploadSuccess = (paper) => {
    setUserPapers(prev => [paper, ...prev])
    if (activeTab === 'user') setPapers(prev => [paper, ...prev])
    if (stats) setStats(s => ({ ...s, user_papers: (s.user_papers||0)+1 }))
  }

  const handleDelete = async (paperId) => {
    if (!window.confirm('确认删除这篇文献？')) return
    await fetch(`/api/kb/user/${paperId}`, { method:'DELETE' })
    setUserPapers(prev => prev.filter(p => p.id !== paperId))
    setPapers(prev => prev.filter(p => p.id !== paperId))
    if (stats) setStats(s => ({ ...s, user_papers: Math.max(0,(s.user_papers||1)-1) }))
  }

  const curatedCategories = stats ? Object.entries(stats.categories||{}) : []

  return (
    <div style={{ height:'100%', overflow:'auto', padding:'20px 24px', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:4 }}>文献知识库</div>
        <div style={{ fontSize:12, color:'var(--text3)' }}>精选 SOFC 互联体材料领域核心文献 · 支持上传 PDF 自动解析</div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
          <StatCard label="精选论文" value={stats.total_papers} sub={`${stats.year_range?.[0]}–${stats.year_range?.[1]}`} />
          <StatCard label="我的上传" value={stats.user_papers||0} sub="AI 自动解析" color="#ea580c" />
          <StatCard label="覆盖材料" value={stats.total_materials_covered} sub="种候选材料" />
          <StatCard label="平均相关度" value={`${Math.round((stats.avg_relevance||0)*100)}%`} sub="领域相关性" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:16, background:'#fff', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden', width:'fit-content' }}>
        {[
          { key:'curated', label:`📚 精选文献 (${stats?.total_papers||30})` },
          { key:'user',    label:`📄 我的文献 (${userPapers.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTab(tab.key)}
            style={{
              padding:'8px 20px', border:'none', cursor:'pointer', fontSize:12, fontWeight:500,
              background: activeTab===tab.key ? 'var(--blue)' : 'transparent',
              color: activeTab===tab.key ? '#fff' : 'var(--text2)',
              transition:'all 0.15s',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Upload zone (only in user tab) */}
      {activeTab === 'user' && (
        <UploadZone onUploadSuccess={handleUploadSuccess} />
      )}

      {/* Search + category filter */}
      <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'var(--text3)' }}>⌕</span>
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="搜索材料、方法、关键词…"
            style={{ width:'100%', padding:'8px 12px 8px 32px', background:'#fff', border:'1px solid var(--border2)', borderRadius:'var(--r)', outline:'none', color:'var(--text)', fontSize:12, boxShadow:'var(--shadow-sm)' }}
          />
        </div>
        {activeTab === 'curated' && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {curatedCategories.map(([cat, count]) => {
              const meta = CAT_META[cat] || { color:'#6b7280', bg:'#f9fafb', label:cat }
              const isActive = activeCategory===cat
              return (
                <button key={cat} onClick={() => handleCategory(cat)} style={{
                  padding:'4px 10px', borderRadius:20, cursor:'pointer',
                  background: isActive ? meta.color : meta.bg,
                  color: isActive ? '#fff' : meta.color,
                  border:`1px solid ${meta.color}44`,
                  fontSize:11, fontWeight:500, transition:'all 0.15s',
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  {meta.label}
                  <span style={{ fontSize:10, padding:'1px 5px', borderRadius:8, background: isActive?'rgba(255,255,255,0.25)':`${meta.color}22`, color: isActive?'#fff':meta.color }}>{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Count */}
      <div style={{ fontSize:11, color:'var(--text3)', marginBottom:12 }}>
        {search ? `搜索「${search}」` : activeCategory ? `分类：${CAT_META[activeCategory]?.label}` : activeTab==='user'?'我的上传文献':'全部精选文献'}
        {' · 共 '}{papers.length}{' 篇'}
      </div>

      {/* Papers */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)' }}>
          <div style={{ width:24, height:24, border:'2px solid var(--border2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 10px' }} />
          加载中…
        </div>
      ) : papers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)', fontSize:13 }}>
          {activeTab==='user' ? '还没有上传文献，拖拽 PDF 到上方区域开始添加' : '未找到相关文献'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {papers.map(p => (
            <PaperCard
              key={p.id} paper={p}
              onClick={setSelectedPaper}
              onDelete={handleDelete}
              isUser={activeTab==='user' || p.source==='user-uploaded'}
            />
          ))}
        </div>
      )}

      <PaperModal paper={selectedPaper} onClose={() => setSelectedPaper(null)} />
    </div>
  )
}
