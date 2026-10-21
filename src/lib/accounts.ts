import { SITE_CONFIG } from '@/lib/constants'

/** Helpers for accounts the core team creates on someone's behalf. */

const WORDS = ['river', 'maple', 'orbit', 'pixel', 'cedar', 'delta', 'ember', 'lotus', 'nova', 'quartz', 'sable', 'tango', 'vector', 'willow', 'zephyr', 'mango']

export const makePassword = () => {
  const a = new Uint32Array(3)
  crypto.getRandomValues(a)
  return `${WORDS[a[0] % WORDS.length]}-${WORDS[a[1] % WORDS.length]}-${10 + (a[2] % 90)}`
}

/** "Nguyễn Văn An" → "an.nguyen.van" */
export const usernameFrom = (name: string) => {
  const parts = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  return [parts[parts.length - 1], ...parts.slice(0, -1)].join('.').slice(0, 30)
}

/** A username not already taken by `taken`, adding 2, 3… when needed. */
export const freeUsername = (name: string, taken: Set<string>) => {
  const base = usernameFrom(name)
  if (!base) return ''
  let u = base
  for (let i = 2; taken.has(u); i++) u = `${base}${i}`
  return u
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())

export const welcomeMessage = (name: string, email: string, password: string) => {
  const first = name.trim().split(/\s+/).pop() || 'there'
  return `Hi ${first}, welcome to The Noders!\nSign in at ${SITE_CONFIG.url.replace(/^https?:\/\//, '')}/login\nEmail: ${email}\nPassword: ${password}\nYour dashboard walks you through setting up your profile.`
}
