'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { normalizeCode } from '@/lib/certificates'
import { cn } from '@/lib/utils'

/** Code entry on the navy intro. Accepts "c3", "0003", "C0003" or a pasted link. */
export function VerifyForm({ initial = '' }: { initial?: string }) {
  const router = useRouter()
  const [code, setCode] = useState(initial)
  const [tried, setTried] = useState(false)
  const normal = normalizeCode(code)
  const bad = tried && code.trim() !== '' && !normal

  let hint = 'A letter C and four digits. You can also paste the full link.'
  if (code.trim() && normal && normal !== code.trim().toUpperCase()) hint = `Will check ${normal}`
  if (bad) hint = 'That doesn’t look like a code — it should be C followed by four digits, like C0003.'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setTried(true)
        if (normal) router.push(`/verify/${normal}`)
      }}
      className="flex flex-wrap items-start gap-3"
    >
      <div className="min-w-0 flex-[1_1_320px]">
        <label htmlFor="code" className="mb-2 block text-sm text-on-navy">Certificate code</label>
        <input
          id="code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setTried(false)
          }}
          placeholder="C0003"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="code-hint"
          aria-invalid={bad}
          className={cn(
            'min-h-[60px] w-full rounded-lg border bg-white/[0.08] px-[18px] font-mono text-2xl tracking-[0.06em] text-white placeholder:text-[#9FB0CF] focus:outline-none',
            bad ? 'border-[#FF9C85]' : 'border-white/35 focus:border-white/70'
          )}
        />
        <p id="code-hint" role="status" className={cn('mt-2 text-sm', bad ? 'text-[#FFC9B8]' : 'text-on-navy')}>
          {hint}
        </p>
      </div>
      <button type="submit" className="mt-[30px] min-h-[60px] rounded-lg bg-white px-7 font-semibold text-navy-dark transition-colors hover:bg-on-navy">
        Verify
      </button>
    </form>
  )
}
