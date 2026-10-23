/** Re-mounts on every navigation, so each new page fades and rises in (see .page-enter). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
