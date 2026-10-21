/** Server-safe avatar: photo, or initials on the quiet navy tone. */
export function MemberAvatarServer({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
  }
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(-2).join('').toUpperCase()
  return (
    <span aria-hidden="true" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2A4B8D] text-sm font-semibold text-white">
      {initials}
    </span>
  )
}
