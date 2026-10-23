'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Scroll reveal for the public pages. Marks top-level sections, and the children
 * of any [data-stagger] container, then fades each one in as it scrolls into view.
 * - Things already on screen when the page loads are left alone (no flash).
 * - Content that arrives later (client fetches, filters) is picked up too.
 * - Without JS, or with reduced motion, nothing is ever hidden.
 * - The class is removed when the animation ends, so no transform lingers.
 * Admin and dashboard are tools, so they skip it.
 */
export function Motion() {
  const pathname = usePathname() || '/'

  useEffect(() => {
    if (/^\/(admin|dashboard)(\/|$)/.test(pathname)) return
    if (typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const main = document.querySelector('main')
    if (!main) return

    const reveal = (el: Element) => {
      el.classList.remove('rv-hide')
      el.classList.add('rv-in')
      const done = (e: Event) => {
        if (e.target !== el) return
        el.classList.remove('rv-in')
        el.removeEventListener('animationend', done)
      }
      el.addEventListener('animationend', done)
      // Safety net if the animation never fires (e.g. element hidden by CSS)
      window.setTimeout(() => el.classList.remove('rv-in'), 2000)
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          io.unobserve(e.target)
          reveal(e.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    )
    const prepare = (el: HTMLElement, index = 0) => {
      if (el.dataset.rv) return
      el.dataset.rv = '1'
      el.style.setProperty('--rv-i', String(index % 8))
      const r = el.getBoundingClientRect()
      if (r.height === 0 || (r.top < window.innerHeight && r.bottom > 0)) return // on screen already, or not laid out
      el.classList.add('rv-hide')
      io.observe(el)
    }
    const scan = () => {
      main.querySelectorAll<HTMLElement>('[data-stagger]').forEach((list) => {
        Array.from(list.children).forEach((child, i) => prepare(child as HTMLElement, i))
      })
      // Top-level sections that don't hold their own staggered list
      main.querySelectorAll<HTMLElement>('section, [data-reveal]').forEach((s) => {
        if (s.parentElement?.closest('section')) return
        if (s.querySelector('[data-stagger]')) {
          // Reveal just the section's heading area: its first child
          const first = s.querySelector<HTMLElement>(':scope > div > :first-child, :scope > :first-child')
          if (first && !first.hasAttribute('data-stagger') && !first.querySelector('[data-stagger]')) prepare(first)
          return
        }
        prepare(s)
      })
    }

    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(scan)
    }
    schedule()
    const mo = new MutationObserver(schedule)
    mo.observe(main, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      io.disconnect()
      // Never leave anything hidden behind when leaving the page
      main.querySelectorAll('.rv-hide').forEach((el) => el.classList.remove('rv-hide'))
    }
  }, [pathname])

  return null
}
