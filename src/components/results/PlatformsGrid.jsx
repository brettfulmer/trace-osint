const PLATFORM_META = {
  'GitHub': { icon: '🐙', color: '#fff' },
  'Reddit': { icon: '🤖', color: '#ff4500' },
  'Hacker News': { icon: '🟠', color: '#ff6600' },
  'Dev.to': { icon: '💻', color: '#08090a' },
  'Keybase': { icon: '🔑', color: '#3399ff' },
  'GitLab': { icon: '🦊', color: '#fc6d26' },
  'Twitter / X': { icon: '𝕏', color: '#fff' },
  'Instagram': { icon: '📸', color: '#e1306c' },
  'TikTok': { icon: '🎵', color: '#ff0050' },
  'Twitch': { icon: '🎮', color: '#9146ff' },
  'YouTube': { icon: '▶', color: '#ff0000' },
  'Pinterest': { icon: '📌', color: '#e60023' },
  'Medium': { icon: '✍️', color: '#fff' },
  'Telegram': { icon: '✈️', color: '#2aabee' },
  'Snapchat': { icon: '👻', color: '#fffc00' },
  'LinkedIn': { icon: '💼', color: '#0077b5' },
  'Tumblr': { icon: '🔵', color: '#35465c' },
  'Mastodon': { icon: '🐘', color: '#6364ff' },
}

const STATUS_CONFIG = {
  true: {
    label: 'Confirmed',
    dot: 'bg-accent-green',
    border: 'border-accent-green/30',
    bg: 'bg-accent-green/5',
    text: 'text-accent-green',
    badge: 'bg-accent-green/15 text-accent-green',
  },
  likely: {
    label: 'Possible',
    dot: 'bg-accent-yellow',
    border: 'border-accent-yellow/30',
    bg: 'bg-accent-yellow/5',
    text: 'text-accent-yellow',
    badge: 'bg-accent-yellow/15 text-accent-yellow',
  },
  false: {
    label: 'Not Found',
    dot: 'bg-accent-red/60',
    border: 'border-border',
    bg: '',
    text: 'text-text-dim',
    badge: 'bg-bg-elevated text-text-dim',
  },
  null: {
    label: 'Unknown',
    dot: 'bg-text-dim',
    border: 'border-border',
    bg: '',
    text: 'text-text-dim',
    badge: 'bg-bg-elevated text-text-dim',
  },
}

function PlatformBadge({ platform }) {
  const { platform: name, found, url, note } = platform
  const meta = PLATFORM_META[name] || { icon: '🌐', color: '#6c63ff' }
  const status = String(found) in STATUS_CONFIG ? STATUS_CONFIG[String(found)] : STATUS_CONFIG.null
  const isClickable = url && found !== false

  const content = (
    <div
      className={`platform-badge relative flex flex-col items-center gap-2 p-3 rounded-xl border ${status.border} ${status.bg} transition-all`}
    >
      {/* Status dot */}
      <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${status.dot} ${found === true ? 'status-pulse' : ''}`} />

      {/* Icon */}
      <span className="text-2xl">{meta.icon}</span>

      {/* Name */}
      <span className={`text-xs font-medium text-center leading-tight ${found === false || found === null ? 'text-text-dim' : 'text-text-primary'}`}>
        {name}
      </span>

      {/* Status badge */}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.badge} mono`}>
        {status.label}
      </span>

      {note && (
        <span className="text-[10px] text-text-dim text-center leading-tight">{note}</span>
      )}
    </div>
  )

  if (isClickable) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" title={`View ${name} profile`}>
        {content}
      </a>
    )
  }
  return content
}

export default function PlatformsGrid({ platforms }) {
  if (!platforms?.length) return null

  const confirmed = platforms.filter(p => p.found === true)
  const likely = platforms.filter(p => p.found === 'likely')
  const notFound = platforms.filter(p => p.found === false)
  const unknown = platforms.filter(p => p.found === null)

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span>🌐</span>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mono">Platform Scan</h2>
        <div className="flex-1 h-px bg-border" />
        <div className="flex gap-3 text-xs mono">
          <span className="text-accent-green">{confirmed.length} found</span>
          {likely.length > 0 && <span className="text-accent-yellow">{likely.length} possible</span>}
          <span className="text-text-dim">{notFound.length} not found</span>
        </div>
      </div>

      {/* Grid */}
      <div className="card-glow rounded-2xl border border-border bg-bg-card p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
          {/* Show confirmed first, then likely, then not found */}
          {[...confirmed, ...likely, ...notFound, ...unknown].map((platform) => (
            <PlatformBadge key={platform.platform} platform={platform} />
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50 text-xs text-text-dim">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-green" />
            <span>Confirmed via API</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-yellow" />
            <span>Possible (URL check)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-red/60" />
            <span>Not found</span>
          </div>
        </div>
      </div>
    </div>
  )
}
