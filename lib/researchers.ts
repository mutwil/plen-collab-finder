import researchersData from '@/data/researchers.json'

export type CollaborationFit = 'High' | 'Medium' | 'Low'

export interface Researcher {
  id: string
  name: string
  title?: string
  department?: string
  institution?: string
  url?: string
  topics?: string[]
  summary?: string
  recentWork?: string
  labGroup?: string
  collaborationFit?: CollaborationFit
  collaborationAngles?: string[]
  researchedAt?: number
}

const FIT_ORDER: Record<CollaborationFit, number> = { High: 0, Medium: 1, Low: 2 }

export function loadResearchers(): Researcher[] {
  return (researchersData as Researcher[]).map((r) => ({
    ...r,
    id: r.id || slugify(r.name),
  }))
}

export function getById(id: string): Researcher | undefined {
  return loadResearchers().find((r) => r.id === id)
}

export function sortResearchers(rs: Researcher[]): Researcher[] {
  return [...rs].sort((a, b) => {
    const fa = FIT_ORDER[a.collaborationFit ?? 'Low'] ?? 3
    const fb = FIT_ORDER[b.collaborationFit ?? 'Low'] ?? 3
    if (fa !== fb) return fa - fb
    return a.name.localeCompare(b.name)
  })
}

export function allDepartments(): string[] {
  const set = new Set<string>()
  for (const r of loadResearchers()) {
    if (r.department) set.add(r.department)
  }
  return Array.from(set).sort()
}

export function allInstitutions(): string[] {
  const set = new Set<string>()
  for (const r of loadResearchers()) {
    if (r.institution) set.add(r.institution)
  }
  return Array.from(set).sort()
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export const TITLE_COLORS: Record<string, string> = {
  'Professor': '#c084fc',
  'Full Professor': '#c084fc',
  'Associate Professor': '#3b82f6',
  'Assistant Professor': '#34d399',
  'Postdoc': '#64748b',
  'Senior Researcher': '#f97316',
}

export const FIT_COLORS: Record<CollaborationFit, string> = {
  High: '#16a34a',
  Medium: '#ca8a04',
  Low: '#94a3b8',
}

export function getTitleColor(title?: string): string {
  if (!title) return '#94a3b8'
  for (const [key, color] of Object.entries(TITLE_COLORS)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#94a3b8'
}
