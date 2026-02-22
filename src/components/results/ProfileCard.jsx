function StatBadge({ label, value, color }) {
  const colors = {
    green: { text: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/20' },
    yellow: { text: 'text-accent-yellow', bg: 'bg-accent-yellow/10 border-accent-yellow/20' },
    red: { text: 'text-accent-red', bg: 'bg-accent-red/10 border-accent-red/20' },
    purple: { text: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20' },
    cyan: { text: 'text-accent-cyan', bg: 'bg-accent-cyan/10 border-accent-cyan/20' },
  }
  const c = colors[color] || colors.purple
  return (
    <div className={`flex flex-col items-center px-4 py-2.5 rounded-xl border ${c.bg}`}>
      <span className={`text-xl font-bold mono ${c.text}`}>{value ?? '—'}</span>
      <span className="text-xs text-text-dim mt-0.5">{label}</span>
    </div>
  )
}

export default function ProfileCard({ name, avatar, avatarPlatform, alternateNames, locations, websites, bios, stats }) {
  const hasSummaryData = name || avatar || (locations?.length > 0) || (bios?.length > 0)

  return (
    <div className="card-glow rounded-2xl border border-border bg-bg-card overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #6c63ff, #00d4ff, #00ff88)' }} />

      <div className="p-6">
        {hasSummaryData ? (
          <div className="flex items-start gap-5 mb-5">
            {/* Avatar */}
            {avatar ? (
              <div className="relative flex-shrink-0">
                <img
                  src={avatar}
                  alt={name || 'Profile'}
                  className="w-20 h-20 rounded-2xl object-cover border border-border"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                {avatarPlatform && (
                  <span className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-md bg-bg-card border border-border text-text-dim mono">
                    {avatarPlatform.split(' ')[0]}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl bg-bg-elevated border border-border flex-shrink-0">
                👤
              </div>
            )}

            {/* Identity info */}
            <div className="flex-1 min-w-0">
              {name ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-text-primary">{name}</h2>
                </div>
              ) : (
                <h2 className="text-xl font-bold text-text-dim italic">Name unknown</h2>
              )}

              {alternateNames?.length > 0 && (
                <p className="text-xs text-text-muted mt-0.5">
                  Also: {alternateNames.join(', ')}
                </p>
              )}

              {locations?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-text-muted text-sm">📍</span>
                  <span className="text-text-muted text-sm">{locations[0]}</span>
                </div>
              )}

              {websites?.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-text-muted text-sm">🔗</span>
                  <a
                    href={websites[0].startsWith('http') ? websites[0] : `https://${websites[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-cyan text-sm hover:underline truncate"
                  >
                    {websites[0]}
                  </a>
                </div>
              )}

              {bios?.length > 0 && (
                <p className="text-sm text-text-muted mt-2 line-clamp-2">
                  {bios[0].bio}
                  <span className="text-text-dim text-xs ml-1">({bios[0].platform})</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-bg-elevated border border-border">
              👤
            </div>
            <div>
              <p className="text-text-dim italic">No profile data aggregated</p>
              <p className="text-text-dim text-xs mt-0.5">Platform-specific data shown below</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            {stats.map((stat) => (
              <StatBadge key={stat.label} {...stat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
