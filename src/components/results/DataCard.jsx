export default function DataCard({ title, icon, children, borderColor }) {
  return (
    <div
      className="card-glow rounded-2xl border bg-bg-card p-5"
      style={{ borderColor: borderColor || 'rgb(30,30,74)' }}
    >
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span>{icon}</span>}
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mono">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}
