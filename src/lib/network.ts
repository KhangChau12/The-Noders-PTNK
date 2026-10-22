/**
 * "The network so far": members linked to the products they built, the posts they
 * wrote and the events they took part in (from club points). Pure data + a
 * deterministic layout, so the same data always draws the same picture.
 */

export type NodeKind = 'member' | 'product' | 'post' | 'event'
export type EdgeKind = 'built' | 'wrote' | 'part' | 'standout'

export interface NetNode {
  id: string
  kind: NodeKind
  name: string
  href?: string
  img?: string | null
  /** For posts: the author's node id */
  owner?: string
  x: number
  y: number
  r: number
}
export interface NetEdge {
  a: string
  b: string
  kind: EdgeKind
}
export interface Network {
  nodes: NetNode[]
  edges: NetEdge[]
  /** Members with nothing linked yet */
  loose: NetNode[]
  width: number
  height: number
}

export interface NetworkInput {
  members: { id: string; full_name: string | null; avatar_url: string | null }[]
  products: { id: string; title: string }[]
  credits: { project_id: string; user_id: string }[]
  posts: { id: string; slug: string; title: string; status: string; author_id: string }[]
  logs: { id: string; task_name: string }[]
  logMembers: { task_log_id: string; member_id: string }[]
}

const SHORT_PRODUCT: Record<string, string> = { 'The Noders Competition Platform': 'Competition Platform', 'The Noders PTNK': 'Club website' }

/** "Participate in NAIC 2025" → "NAIC 2025"; posts are shown as posts, so "Write web post" is skipped. */
export function eventOf(taskName: string): { name: string; standout: boolean } | null {
  if (/write .*post/i.test(taskName)) return null
  const name = taskName
    .replace(/^(participate in|participated in|outstanding performance in|prepare for)\s+/i, '')
    .replace(/\s+workshop$/i, '')
    .replace(/^mini-course:\s*/i, '')
    .replace(/introduction to/i, 'Intro to')
    .replace(/data science/i, 'DS')
    .replace(/artificial intelligence/i, 'AI')
    .trim()
  return { name, standout: /outstanding/i.test(taskName) }
}

export function buildNetwork(input: NetworkInput, width = 1184, height = 820): Network {
  const nodes: NetNode[] = []
  const edges: NetEdge[] = []
  const memberIds = new Set(input.members.map((m) => m.id))
  const add = (n: Omit<NetNode, 'x' | 'y' | 'r'>) => {
    const node = { ...n, x: 0, y: 0, r: 0 }
    nodes.push(node)
    return node
  }

  for (const m of input.members) add({ id: `m-${m.id}`, kind: 'member', name: m.full_name || 'Member', img: m.avatar_url, href: `/members/${m.id}` })
  for (const p of input.products) add({ id: `p-${p.id}`, kind: 'product', name: SHORT_PRODUCT[p.title] || p.title, href: `/products/${p.id}` })
  for (const c of input.credits) if (memberIds.has(c.user_id) && input.products.some((p) => p.id === c.project_id)) edges.push({ a: `m-${c.user_id}`, b: `p-${c.project_id}`, kind: 'built' })
  for (const p of input.posts) {
    if (p.status !== 'published' || !memberIds.has(p.author_id)) continue
    add({ id: `q-${p.id}`, kind: 'post', name: p.title, owner: `m-${p.author_id}`, href: `/posts/${p.slug}` })
    edges.push({ a: `m-${p.author_id}`, b: `q-${p.id}`, kind: 'wrote' })
  }
  const logEvent = new Map(input.logs.map((l) => [l.id, eventOf(l.task_name)]))
  const eventIds = new Map<string, string>()
  const seen = new Map<string, NetEdge>()
  for (const lm of input.logMembers) {
    const ev = logEvent.get(lm.task_log_id)
    if (!ev || !memberIds.has(lm.member_id)) continue
    let id = eventIds.get(ev.name)
    if (!id) {
      id = `e-${eventIds.size}`
      eventIds.set(ev.name, id)
      add({ id, kind: 'event', name: ev.name })
    }
    const key = `${lm.member_id}|${id}`
    const prev = seen.get(key)
    if (prev) {
      if (ev.standout) prev.kind = 'standout'
      continue
    }
    const e: NetEdge = { a: `m-${lm.member_id}`, b: id, kind: ev.standout ? 'standout' : 'part' }
    seen.set(key, e)
    edges.push(e)
  }

  // Products nobody is credited on still show; members with nothing linked go to the side
  const degree = new Map<string, number>()
  for (const e of edges) {
    degree.set(e.a, (degree.get(e.a) || 0) + 1)
    degree.set(e.b, (degree.get(e.b) || 0) + 1)
  }
  const deg = (id: string) => degree.get(id) || 0
  for (const n of nodes) n.r = n.kind === 'member' ? 14 + Math.min(10, Math.sqrt(deg(n.id)) * 2.2) : n.kind === 'event' ? 8 + Math.sqrt(deg(n.id)) * 2.2 : n.kind === 'post' ? 4.5 : 11
  const linked = nodes.filter((n) => deg(n.id) > 0 || n.kind === 'product')
  const loose = nodes.filter((n) => n.kind === 'member' && deg(n.id) === 0)

  layout(linked, edges, width, height, loose.length ? 150 : 0)
  loose.forEach((n, i) => {
    n.x = width - 80
    n.y = height / 2 - ((loose.length - 1) * 64) / 2 + i * 64
  })
  petals(nodes, edges, width, height)
  return { nodes: nodes.filter((n) => linked.includes(n) || loose.includes(n)), edges, loose, width, height }
}

/** Force-directed layout with a seeded start, then fitted to the box. */
function layout(nodes: NetNode[], edges: NetEdge[], W: number, H: number, rightGap: number) {
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const v = new Map<string, { vx: number; vy: number }>()
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * Math.PI * 2
    const rad = n.kind === 'member' ? 220 : 120
    n.x = W / 2 + Math.cos(a) * rad * 1.6 + rnd() * 20
    n.y = H / 2 + Math.sin(a) * rad * 0.8 + rnd() * 20
    v.set(n.id, { vx: 0, vy: 0 })
  })
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const hub = (n: NetNode) => n.kind === 'event' || n.kind === 'product'
  const STEPS = 900
  for (let it = 0; it < STEPS; it++) {
    const t = 1 - it / STEPS
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], va = v.get(a.id)!, vb = v.get(b.id)!
        const dx = b.x - a.x, dy = (b.y - a.y) * 1.7
        const d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2)
        const f = (5200 * (a.kind === 'post' ? 0.3 : 1) * (b.kind === 'post' ? 0.3 : 1)) / d2
        va.vx -= (dx / d) * f; va.vy -= (dy / d) * f; vb.vx += (dx / d) * f; vb.vy += (dy / d) * f
      }
    for (const e of edges) {
      const a = byId.get(e.a), b = byId.get(e.b)
      if (!a || !b) continue
      const va = v.get(a.id)!, vb = v.get(b.id)!
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01
      const k = (d - (e.kind === 'wrote' ? 34 : e.kind === 'built' ? 70 : 115)) * (e.kind === 'wrote' ? 0.05 : 0.02)
      va.vx += (dx / d) * k; va.vy += (dy / d) * k; vb.vx -= (dx / d) * k; vb.vy -= (dy / d) * k
    }
    for (const n of nodes) {
      const vn = v.get(n.id)!
      vn.vx += (W / 2 - n.x) * 0.004
      vn.vy += (H / 2 - n.y) * 0.008
      n.x += Math.max(-12, Math.min(12, vn.vx)) * t
      n.y += Math.max(-12, Math.min(12, vn.vy)) * t
      vn.vx *= 0.6; vn.vy *= 0.6
    }
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j]
        const min = a.r + b.r + (a.kind === 'post' || b.kind === 'post' ? 5 : hub(a) && hub(b) ? 110 : a.kind !== 'member' || b.kind !== 'member' ? 26 : 10)
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01
        if (d < min) {
          const p = (min - d) / 2
          a.x -= (dx / d) * p; a.y -= (dy / d) * p; b.x += (dx / d) * p; b.y += (dy / d) * p
        }
      }
  }
  if (!nodes.length) return
  const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y)
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  for (const n of nodes) {
    n.x = 60 + ((n.x - x0) / (x1 - x0 || 1)) * (W - 120 - rightGap)
    n.y = 50 + ((n.y - y0) / (y1 - y0 || 1)) * (H - 100)
  }
}

/** Posts sit in an arc around their author, facing away from the author's other links. */
function petals(nodes: NetNode[], edges: NetEdge[], W: number, H: number) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  for (const m of nodes.filter((n) => n.kind === 'member')) {
    const mine = nodes.filter((n) => n.kind === 'post' && n.owner === m.id)
    if (!mine.length) continue
    let ax = 0, ay = 0, others = 0
    for (const e of edges) {
      if (e.kind === 'wrote') continue
      const o = e.a === m.id ? byId.get(e.b) : e.b === m.id ? byId.get(e.a) : null
      if (!o) continue
      const d = Math.hypot(o.x - m.x, o.y - m.y) || 1
      ax += (o.x - m.x) / d; ay += (o.y - m.y) / d; others++
    }
    if (!others) { ax = m.x - W / 2; ay = m.y - H / 2 }
    const dir = Math.atan2(-ay, -ax)
    const perRing = 9
    mine.forEach((p, i) => {
      const ring = Math.floor(i / perRing), inRing = Math.min(perRing, mine.length - ring * perRing), k = i % perRing
      const a = dir + (k - (inRing - 1) / 2) * (0.36 - ring * 0.08)
      const rad = m.r + 13 + ring * 11
      p.x = m.x + Math.cos(a) * rad
      p.y = m.y + Math.sin(a) * rad
    })
  }
}

/** Ids directly linked to `id`. */
export function neighboursOf(net: Network, id: string) {
  const out = new Set<string>()
  for (const e of net.edges) {
    if (e.a === id) out.add(e.b)
    else if (e.b === id) out.add(e.a)
  }
  return out
}
