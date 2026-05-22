import React, { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'

const REC_COLORS = {
  'Recommended': '#1dba8a',
  'Marginal': '#f5a623',
  'Not recommended': '#e05c5c',
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 5, background: 'var(--border)',
        borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${value * 100}%`,
          background: color, borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)', minWidth: 36 }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}

function MaterialCard({ mat, rank }) {
  const [expanded, setExpanded] = useState(false)
  const recColor = REC_COLORS[mat.recommendation] || '#9a9da6'

  return (
    <div style={{
      background: 'var(--bg3)',
      border: `1px solid ${rank === 1 ? 'var(--teal)' : 'var(--border)'}`,
      borderRadius: 'var(--r)',
      padding: '14px 16px',
      marginBottom: 10,
      animation: 'slide-in 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600,
              color: rank === 1 ? 'var(--teal)' : 'var(--text3)',
              minWidth: 20,
            }}>#{rank}</span>
            <span style={{ fontWeight: 500, fontSize: 14, fontFamily: 'var(--mono)', color: 'var(--text)' }}>
              {mat.formula}
            </span>
            <span style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 4,
              background: `${recColor}22`, color: recColor,
              fontWeight: 600,
            }}>{mat.recommendation}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, paddingLeft: 28 }}>
            {mat.name}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'var(--border)',
            border: 'none',
            borderRadius: 4,
            padding: '4px 10px',
            fontSize: 11,
            color: 'var(--text2)',
            flexShrink: 0,
          }}
        >
          {expanded ? '收起' : '详情'}
        </button>
      </div>

      <div style={{ paddingLeft: 28 }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, display: 'block' }}>综合评分</span>
          <ScoreBar value={mat.score} color={recColor} />
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8, marginTop: 10,
        }}>
          {[
            { label: '电导率', value: `${(mat.conductivity_S_m / 1000).toFixed(1)}k S/m`, ok: mat.conductivity_S_m >= 10000 },
            { label: '热膨胀系数', value: `${mat.tec_ppm_K.toFixed(1)} ppm/K`, ok: mat.tec_ppm_K <= 12 },
            { label: '最高使用温度', value: `${mat.max_temp_C}°C`, ok: mat.max_temp_C >= 500 },
          ].map(({ label, value, ok }) => (
            <div key={label} style={{
              background: 'var(--bg2)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 10px',
              borderLeft: `3px solid ${ok ? 'var(--teal)' : 'var(--red)'}`,
            }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 500, color: ok ? 'var(--teal)' : 'var(--red)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {expanded && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: 'var(--text3)' }}>评估说明：</span> {mat.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CompareChart({ candidates }) {
  const data = candidates.slice(0, 5).map(m => ({
    name: m.formula.length > 12 ? m.formula.slice(0, 12) + '…' : m.formula,
    score: Math.round(m.score * 100),
    conductivity: Math.round(Math.log10(m.conductivity_S_m + 1) * 10),
    tec: Math.round((15 - m.tec_ppm_K) * 5),
    temp: Math.round(m.max_temp_C / 15),
  }))

  const radarData = [
    { subject: '电导率', fullMark: 100 },
    { subject: '热稳定性', fullMark: 100 },
    { subject: '热匹配性', fullMark: 100 },
    { subject: '综合评分', fullMark: 100 },
  ].map(d => {
    const obj = { ...d }
    candidates.slice(0, 3).forEach((m, i) => {
      obj[`m${i}`] = i === 0
        ? Math.round(m.score * 100)
        : Math.round(Math.log10(m.conductivity_S_m + 1) * 15)
    })
    return obj
  })

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>候选材料评分对比</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5c6070', fontFamily: 'IBM Plex Mono' }} />
          <YAxis tick={{ fontSize: 10, fill: '#5c6070' }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: '#1e2027', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: '#e8e9eb' }}
            itemStyle={{ color: '#1dba8a' }}
            formatter={(v) => [`${v}%`, '综合评分']}
          />
          {data.map((_, i) => null)}
          <Bar dataKey="score" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={index === 0 ? '#1dba8a' : index === 1 ? '#4d9ef5' : '#7c6ff7'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ResultPanel({ finalContent, rankedCandidates }) {
  if (!finalContent && (!rankedCandidates || rankedCandidates.length === 0)) return null

  return (
    <div style={{ animation: 'slide-in 0.4s ease' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16, paddingBottom: 12,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>研究完成</span>
      </div>

      {rankedCandidates && rankedCandidates.length > 0 && (
        <>
          <CompareChart candidates={rankedCandidates} />
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 12, color: 'var(--text3)' }}>
            候选材料详细评估 ({rankedCandidates.length} 种)
          </div>
          {rankedCandidates.map((m, i) => (
            <MaterialCard key={m.formula} mat={m} rank={i + 1} />
          ))}
        </>
      )}

      {finalContent && (
        <div style={{
          marginTop: 16,
          background: 'rgba(29,186,138,0.06)',
          border: '1px solid rgba(29,186,138,0.2)',
          borderRadius: 'var(--r)',
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--teal)', marginBottom: 8, fontFamily: 'var(--mono)' }}>
            AGENT SUMMARY
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {finalContent}
          </div>
        </div>
      )}
    </div>
  )
}
