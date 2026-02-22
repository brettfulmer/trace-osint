import ProfileCard from './ProfileCard'
import PlatformsGrid from './PlatformsGrid'
import DataCard from './DataCard'

export default function UsernameResults({ results }) {
  const { username, summary, platforms } = results
  const confirmed = platforms?.filter(p => p.found === true) || []
  const likely = platforms?.filter(p => p.found === 'likely') || []
  const notFound = platforms?.filter(p => p.found === false) || []
  const unknown = platforms?.filter(p => p.found === null) || []

  // Get rich data from platforms that have it
  const richPlatforms = platforms?.filter(p => p.found === true && p.data) || []

  return (
    <div className="space-y-5">
      {/* Profile summary card */}
      <ProfileCard
        name={summary?.name}
        avatar={summary?.avatar?.url}
        avatarPlatform={summary?.avatar?.platform}
        alternateNames={summary?.names?.filter(n => n !== summary?.name)}
        locations={summary?.locations}
        websites={summary?.websites}
        bios={summary?.bios}
        stats={[
          { label: 'Confirmed', value: summary?.confirmed, color: 'green' },
          { label: 'Possible', value: summary?.likely, color: 'yellow' },
          { label: 'Not Found', value: notFound.length, color: 'red' },
          { label: 'Platforms', value: summary?.total, color: 'purple' },
        ]}
      />

      {/* Platform grid */}
      <PlatformsGrid platforms={platforms} />

      {/* Detailed data from API platforms */}
      {richPlatforms.length > 0 && (
        <div>
          <SectionHeader icon="📊" title="Detailed Platform Data" />
          <div className="grid gap-4 md:grid-cols-2">
            {richPlatforms.map((platform) => (
              <PlatformDetailCard key={platform.platform} platform={platform} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{icon}</span>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mono">{title}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function PlatformDetailCard({ platform }) {
  const { platform: name, data, url } = platform

  const PLATFORM_COLORS = {
    'GitHub': { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', icon: '🐙' },
    'Reddit': { bg: 'rgba(255,69,0,0.05)', border: 'rgba(255,69,0,0.2)', icon: '🤖' },
    'Hacker News': { bg: 'rgba(255,102,0,0.05)', border: 'rgba(255,102,0,0.2)', icon: '🗞️' },
    'Dev.to': { bg: 'rgba(0,212,255,0.05)', border: 'rgba(0,212,255,0.15)', icon: '💻' },
    'Keybase': { bg: 'rgba(69,133,255,0.05)', border: 'rgba(69,133,255,0.2)', icon: '🔑' },
    'GitLab': { bg: 'rgba(252,109,38,0.05)', border: 'rgba(252,109,38,0.2)', icon: '🦊' },
  }

  const style = PLATFORM_COLORS[name] || { bg: 'rgba(108,99,255,0.05)', border: 'rgba(108,99,255,0.2)', icon: '🌐' }

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <span className="font-semibold text-text-primary">{name}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-cyan hover:underline mono"
        >
          View Profile →
        </a>
      </div>

      <div className="space-y-1.5">
        {data?.name && <DataRow label="Name" value={data.name} />}
        {data?.bio && <DataRow label="Bio" value={data.bio} clamp />}
        {data?.location && <DataRow label="Location" value={data.location} />}
        {data?.company && <DataRow label="Company" value={data.company} />}
        {data?.website && <DataRow label="Website" value={data.website} link />}
        {data?.email && <DataRow label="Email" value={data.email} copy />}
        {data?.karma !== undefined && <DataRow label="Karma" value={data.karma?.toLocaleString()} />}
        {data?.followers !== undefined && <DataRow label="Followers" value={data.followers?.toLocaleString()} />}
        {data?.publicRepos !== undefined && <DataRow label="Repos" value={data.publicRepos} />}
        {data?.createdAt && <DataRow label="Joined" value={new Date(data.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' })} />}
        {data?.isPremium && <DataRow label="Premium" value="Yes" highlight />}
        {data?.about && <DataRow label="About" value={data.about} clamp />}
        {data?.submissions > 0 && <DataRow label="Submissions" value={data.submissions?.toLocaleString()} />}

        {/* Keybase proofs */}
        {data?.proofs?.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-text-muted mb-1.5 mono">VERIFIED IDENTITIES</p>
            <div className="flex flex-wrap gap-1.5">
              {data.proofs.map((proof, i) => (
                <a
                  key={i}
                  href={proof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded-md bg-accent-green/10 border border-accent-green/20 text-accent-green text-xs hover:bg-accent-green/20 transition-colors"
                >
                  ✓ {proof.type}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DataRow({ label, value, link, copy, clamp, highlight }) {
  if (!value) return null
  const handleCopy = () => navigator.clipboard.writeText(value)

  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-text-dim mono min-w-[60px] pt-0.5">{label}</span>
      {link ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
          className="text-accent-cyan hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className={`text-text-primary flex-1 ${clamp ? 'line-clamp-2' : ''} ${highlight ? 'text-accent-yellow' : ''}`}>
          {value}
          {copy && (
            <button onClick={handleCopy} className="ml-1.5 text-text-dim hover:text-accent-cyan" title="Copy">
              📋
            </button>
          )}
        </span>
      )}
    </div>
  )
}
