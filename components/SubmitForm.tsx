'use client'

import { useState } from 'react'

const INSTITUTIONS = [
  'University of Copenhagen',
  'Technical University of Denmark',
  'Aarhus University',
  'University of Southern Denmark',
  'Roskilde University',
  'Aalborg University',
  'Copenhagen Business School',
  'IT University of Copenhagen',
]

export default function SubmitForm() {
  const [form, setForm] = useState({
    name: '',
    title: '',
    department: '',
    institution: '',
    url: '',
    topicsText: '',
    summary: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const submit = async () => {
    if (loading) return
    setLoading(true)
    setResult(null)
    try {
      const topics = form.topicsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, topics }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setResult({ ok: true, message: data.message || 'Submitted successfully' })
        setForm({ name: '', title: '', department: '', institution: '', url: '', topicsText: '', summary: '' })
      } else {
        setResult({ ok: false, message: data.error || `HTTP ${res.status}` })
      }
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, type: 'input' | 'textarea' | 'select' = 'input', extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {type === 'textarea' ? (
        <textarea
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          rows={3}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          {...(extra as object)}
        />
      ) : type === 'select' ? (
        <select
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Select…</option>
          {INSTITUTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => update(key, e.target.value)}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          {...extra}
        />
      )}
    </label>
  )

  return (
    <div className="space-y-4">
      {field('name', 'Full name *', 'input', { placeholder: 'e.g. Jane Doe', maxLength: 120 })}
      {field('title', 'Academic title *', 'input', { placeholder: 'e.g. Associate Professor', maxLength: 100 })}

      <label className="block">
        <span className="block text-sm font-medium mb-1">Institution *</span>
        <select
          value={form.institution}
          onChange={(e) => update('institution', e.target.value)}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Select…</option>
          {INSTITUTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </label>

      {field('department', 'Department', 'input', { placeholder: 'e.g. PLEN, AU MBG', maxLength: 100 })}
      {field('url', 'Profile URL * (must be on a Danish academic domain)', 'input', { placeholder: 'https://plen.ku.dk/english/employees/...', maxLength: 400 })}
      {field('topicsText', 'Research topics (comma-separated, up to 15)', 'input', { placeholder: 'genomics, machine learning, microbiome, structural biology' })}

      <label className="block">
        <span className="block text-sm font-medium mb-1">Short research summary (optional)</span>
        <textarea
          value={form.summary}
          onChange={(e) => update('summary', e.target.value)}
          rows={4}
          maxLength={1500}
          placeholder="2-4 sentences describing your research focus and current projects."
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y"
        />
        <span className="text-xs text-[var(--text-subtle)]">{form.summary.length}/1500</span>
      </label>

      <p className="text-xs text-[var(--text-muted)]">
        Your submission is moderated by an AI to filter obvious spam or abuse, then queued for a brief human review before it goes public.
      </p>

      <button
        onClick={submit}
        disabled={loading || !form.name || !form.title || !form.institution || !form.url}
        className="bg-[var(--accent)] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer border-none"
      >
        {loading ? 'Submitting…' : 'Submit profile'}
      </button>

      {result && (
        <p className={`text-sm px-3 py-2 rounded-md border ${
          result.ok
            ? 'bg-green-100 border-green-200 text-green-800'
            : 'bg-red-100 border-red-200 text-red-800'
        }`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
