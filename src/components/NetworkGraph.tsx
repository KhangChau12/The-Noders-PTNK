'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { buildNetwork, neighboursOf, type EdgeKind, type NetNode, type NetworkInput } from '@/lib/network'

/**
 * "Ink" network: hairline grey map at rest; hovering (or tapping) a person or a hub
 * colours only their part of the club. Static SVG, no animation loop.
 */
const HUE: Record<EdgeKind, string> = { built: '#8DB1FF', part: '#F5B841', standout: '#F5B841', wrote: '#6FD39F' }
const REST: Record<EdgeKind, { o: number; w: number }> = { wrote: { o: 0.16, w: 0.7 }, part: { o: 0.14, w: 0.8 }, built: { o: 0.4, w: 1.1 }, standout: { o: 0.32, w: 1 } }
const ON: Record<EdgeKind, { o: number; w: number }> = { wrote: { o: 0.9, w: 1 }, part: { o: 0.8, w: 1.2 }, built: { o: 1, w: 1.8 }, standout: { o: 1, w: 1.8 } }

const f1 = (v: number) => Math.round(v * 10) / 10
const initials = (n: string) => n.split(' ').filter(Boolean).map((w) => w[0]).slice(-2).join('').toUpperCase()
const curve = (a: NetNode, b: NetNode, bend: number) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y
  return `M${f1(a.x)} ${f1(a.y)} Q${f1(mx - dy * bend)} ${f1(my + dx * bend)} ${f1(b.x)} ${f1(b.y)}`
}
const label = { paintOrder: 'stroke' as const, stroke: '#0F1117', strokeWidth: 5, strokeLinejoin: 'round' as const }

export function NetworkGraph({ input }: { input: NetworkInput }) {
  const net = useMemo(() => buildNetwork(input), [input])
  const byId = useMemo(() => new Map(net.nodes.map((n) => [n.id, n])), [net])
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const focus = hover || pinned
  const near = useMemo(() => (focus ? neighboursOf(net, focus) : null), [net, focus])
  const lit = (id: string) => !focus || id === focus || !!near?.has(id)

  const enter = (id: string) => () => setHover(id)
  const leave = () => setHover(null)
  const tap = (id: string) => () => setPinned((p) => (p === id ? null : id))

  const counts = {
    members: net.nodes.filter((n) => n.kind === 'member').length,
    products: net.nodes.filter((n) => n.kind === 'product').length,
    posts: net.nodes.filter((n) => n.kind === 'post').length,
    events: net.nodes.filter((n) => n.kind === 'event').length,
    links: net.edges.length,
  }
  const focused = focus ? byId.get(focus) : null

  return (
    <div>
      <dl className="mb-5 flex flex-wrap gap-x-8 gap-y-2">
        {[
          [counts.members, 'members'],
          [counts.products, 'products'],
          [counts.posts, 'posts'],
          [counts.events, 'events'],
          [counts.links, 'connections'],
        ].map(([n, l]) => (
          <div key={l} className="flex flex-col-reverse">
            <dt className="text-[13px] text-text-tertiary">{l}</dt>
            <dd className="font-mono text-[26px] leading-tight">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-hidden rounded-[18px] border border-[#1A1E27] bg-[radial-gradient(ellipse_at_50%_45%,#141823_0%,#0F1117_70%)] p-3 sm:p-[18px]">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${net.width} ${net.height}`}
            className="block w-full min-w-[720px]"
            role="img"
            aria-label={`Network of ${counts.members} members, ${counts.products} products, ${counts.posts} posts and ${counts.events} events`}
            onClick={(e) => e.target === e.currentTarget && setPinned(null)}
          >
            <defs>
              {net.nodes
                .filter((n) => n.kind === 'member' && n.img)
                .map((n) => (
                  <clipPath key={n.id} id={`nc-${n.id}`}>
                    <circle cx={f1(n.x)} cy={f1(n.y)} r={f1(n.r - 3)} />
                  </clipPath>
                ))}
            </defs>
            <g>
              {net.edges.map((e, i) => {
                const a = byId.get(e.a), b = byId.get(e.b)
                if (!a || !b) return null
                const on = !!focus && (e.a === focus || e.b === focus)
                const s = on ? ON[e.kind] : REST[e.kind]
                return (
                  <path
                    key={i}
                    d={curve(a, b, e.kind === 'wrote' ? 0.06 : 0.14)}
                    fill="none"
                    strokeLinecap="round"
                    stroke={on ? HUE[e.kind] : '#C9CED8'}
                    strokeOpacity={focus && !on ? 0.04 : s.o}
                    strokeWidth={s.w}
                    style={{ transition: 'stroke-opacity .2s, stroke .2s' }}
                  />
                )
              })}
            </g>
            {net.nodes.map((n) => {
              const x = f1(n.x), y = f1(n.y)
              const dim = { opacity: lit(n.id) ? 1 : 0.18, transition: 'opacity .2s' }
              const showLabel = n.id === focus || (!!near?.has(n.id) && n.kind !== 'post')
              if (n.kind === 'post') {
                return (
                  <a key={n.id} href={n.href} style={dim}>
                    <title>{n.name}</title>
                    <circle cx={x} cy={y} r={2.6} fill={focus && near?.has(n.id) ? '#6FD39F' : '#C9CED8'} />
                  </a>
                )
              }
              if (n.kind === 'event' || n.kind === 'product') {
                const c = n.kind === 'event' ? '#F5B841' : '#8DB1FF'
                const r = n.kind === 'event' ? n.r : 9
                return (
                  <g key={n.id} style={{ ...dim, cursor: 'pointer' }} onMouseEnter={enter(n.id)} onMouseLeave={leave} onClick={tap(n.id)}>
                    <title>{n.name}</title>
                    <circle cx={x} cy={y} r={r} fill="#0D0F14" stroke={c} strokeWidth={1.5} />
                    <circle cx={x} cy={y} r={2.5} fill={c} />
                    <text x={x} y={f1(n.y + r + 16)} textAnchor="middle" fontSize={12} fontWeight={500} fill={n.kind === 'event' ? '#E8D5A6' : '#C9D8FF'} {...label}>
                      {n.name}
                    </text>
                  </g>
                )
              }
              const colour = !focus || lit(n.id)
              return (
                <g key={n.id} style={{ ...dim, cursor: 'pointer' }} onMouseEnter={enter(n.id)} onMouseLeave={leave} onClick={tap(n.id)}>
                  <title>{n.name}</title>
                  <circle cx={x} cy={y} r={f1(n.r)} fill="#0D0F14" stroke={n.id === focus ? '#EEF0F4' : '#5A6272'} />
                  {n.img ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <image
                      href={n.img}
                      x={f1(n.x - n.r + 3)}
                      y={f1(n.y - n.r + 3)}
                      width={f1(n.r * 2 - 6)}
                      height={f1(n.r * 2 - 6)}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#nc-${n.id})`}
                      style={{ filter: colour && focus ? 'none' : 'grayscale(1)', opacity: colour && focus ? 1 : 0.75, transition: 'filter .2s, opacity .2s' }}
                    />
                  ) : (
                    <text x={x} y={f1(n.y + 4)} textAnchor="middle" fontSize={Math.round(n.r * 0.55)} fontWeight={600} fill="#AAB0BC">
                      {initials(n.name)}
                    </text>
                  )}
                  {showLabel && (
                    <text x={x} y={f1(n.y + n.r + 18)} textAnchor="middle" fontSize={12} fontWeight={600} fill="#EEF0F4" {...label}>
                      {n.name}
                    </text>
                  )}
                </g>
              )
            })}
            {net.loose.length > 0 && (
              <text x={net.width - 80} y={f1(net.loose[0].y - 36)} textAnchor="middle" fontSize={12} fill="#6B7180">
                No links yet
              </text>
            )}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-1.5 pt-3.5 text-[13px] text-text-secondary">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full border border-[#5A6272]" />Member — bigger = more links</span>
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#C9CED8]" />Post</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border-[1.5px] border-link" />Product</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border-[1.5px] border-signal" />Event (from club points)</span>
          </div>
          <span className="text-text-disabled">Hover or tap a person · colour shows their part</span>
        </div>
      </div>

      <FocusLine net={net} node={focused || null} pinned={!!pinned && pinned === focus} />
    </div>
  )
}

function FocusLine({ net, node, pinned }: { net: ReturnType<typeof buildNetwork>; node: NetNode | null; pinned: boolean }) {
  if (!node) return <p className="mt-3 text-sm text-text-tertiary">Tap a person, product or event to keep it highlighted.</p>
  const links = Array.from(neighboursOf(net, node.id))
    .map((id) => net.nodes.find((n) => n.id === id))
    .filter((n): n is NetNode => !!n)
  const of = (k: NetNode['kind']) => links.filter((n) => n.kind === k)
  const parts =
    node.kind === 'member'
      ? [
          of('product').length && `built ${of('product').map((n) => n.name).join(', ')}`,
          of('post').length && `wrote ${of('post').length} post${of('post').length > 1 ? 's' : ''}`,
          of('event').length && `took part in ${of('event').map((n) => n.name).join(', ')}`,
        ].filter(Boolean)
      : [`${of('member').length} member${of('member').length === 1 ? '' : 's'}: ${of('member').map((n) => n.name).join(', ')}`]
  return (
    <p className="mt-3 text-sm text-text-secondary">
      <b className="text-text-primary">{node.name}</b>
      {parts.length ? ` — ${parts.join(' · ')}` : ' — nothing linked yet'}
      {node.href && node.kind !== 'event' && (
        <>
          {' · '}
          <Link href={node.href} className="font-semibold text-link hover:text-text-primary">Open {node.kind === 'member' ? 'profile' : 'page'}</Link>
        </>
      )}
      {pinned && <span className="text-text-disabled"> · tap again to release</span>}
    </p>
  )
}
