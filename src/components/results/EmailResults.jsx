import ProfileCard from './ProfileCard'

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{icon}</span>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mono">{title}</h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function SourceCard({ source, children }) {
  const STATUS = {
    true: { border: 'border-accent-green/30', dot: 'bg-accent-green', label: 'Found' },
    false: { border: 'border-border', dot: 'bg-accent-red/60', label: 'Not Found' },
    null: { border: 'border-border', dot: 'bg-text-dim', label: source.note ? 'No API Key' : 'Unknown' },
  }
  const s = STATUS[String(source.found)] || STATUS.null

  return (
    <div className={`card-glow rounded-2xl border ${s.border} bg-bg-card p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${s.dot} ${source.found === true ? 'status-pulse' : ''}`} />
          <span className="font-semibold text-text-primary">{source.source}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full mono ${
          source.found === true ? 'bg-accent-green/15 text-accent-green' :
          source.found === false ? 'bg-bg-elevated text-text-dim' :
          'bg-accent-yellow/10 text-accent-yellow'
        }`}>
          {s.label}
        </span>
      </div>
      {source.note && (
        <p className="text-xs text-accent-yellow mb-3 flex items-start gap-1.5">
          <span>⚠</span>{source.note}
        </p>
      )}
      {children}
    </div>
  )
}

function Row({ label, value, link, copy, mono: isMonospace }) {
  if (!value) return null
  const handleCopy = () => navigator.clipboard.writeText(String(value))
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-text-dim text-xs mono min-w-[100px] pt-0.5">{label}</span>
      {link ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
          className="text-accent-cyan text-sm hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className={`text-sm text-text-primary flex-1 ${isMonospace ? 'mono' : ''}`}>
          {String(value)}
          {copy && (
            <button onClick={handleCopy} className="ml-2 text-text-dim hover:text-accent-cyan text-xs">📋</button>
          )}
        </span>
      )}
    </div>
  )
}

export default function EmailResults({ results }) {
  const { email, valid, emailHash, emailParts, summary, sources } = results

  if (!valid) {
    return (
      <div className="card-glow rounded-2xl border border-accent-red/30 bg-bg-card p-6 text-center">
        <div className="text-4xl mb-3">❌</div>
        <p className="text-accent-red font-semibold">Invalid Email Format</p>
        <p className="text-text-muted text-sm mt-1">"{email}" does not appear to be a valid email address</p>
      </div>
    )
  }

  const { gravatar, hunter, hibp } = sources || {}

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <ProfileCard
        name={summary?.name}
        avatar={summary?.avatar}
        stats={[
          { label: 'Gravatar', value: gravatar?.found === true ? '✓' : '—', color: gravatar?.found === true ? 'green' : 'purple' },
          { label: 'Hunter.io', value: hunter?.found === true ? '✓' : '—', color: hunter?.found === true ? 'green' : 'purple' },
          { label: 'Breaches', value: hibp?.found === true ? hibp.data?.breachCount : '—', color: hibp?.found === true ? 'red' : 'purple' },
          { label: 'Valid', value: '✓', color: 'green' },
        ]}
      />

      {/* Email details */}
      <div>
        <SectionHeader icon="✉️" title="Email Analysis" />
        <div className="card-glow rounded-2xl border border-border bg-bg-card p-5">
          <Row label="Address" value={email} copy mono />
          <Row label="MD5 Hash" value={emailHash} copy mono />
          <Row label="Local Part" value={emailParts?.local} mono />
          <Row label="Domain" value={emailParts?.domain} mono />
          <Row label="Gravatar URL" value={`https://www.gravatar.com/${emailHash}`} link />
        </div>
      </div>

      {/* Source cards */}
      <div>
        <SectionHeader icon="🔍" title="Data Sources" />
        <div className="grid gap-4 md:grid-cols-2">

          {/* Gravatar */}
          {gravatar && (
            <SourceCard source={gravatar}>
              {gravatar.found === true && gravatar.data && (
                <div>
                  {gravatar.data.avatar && (
                    <img src={gravatar.data.avatar} alt="Gravatar" className="w-16 h-16 rounded-xl mb-3 border border-border" />
                  )}
                  <Row label="Name" value={gravatar.data.name} />
                  <Row label="About" value={gravatar.data.about} />
                  <Row label="Location" value={gravatar.data.location} />
                  <Row label="Profile" value={gravatar.data.profileUrl} link />
                  {gravatar.data.accounts?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-text-dim mono mb-1.5">LINKED ACCOUNTS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gravatar.data.accounts.map((acc, i) => (
                          <a key={i} href={acc.url} target="_blank" rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs hover:bg-accent-cyan/20">
                            {acc.shortname}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {gravatar.found === false && (
                <p className="text-text-muted text-sm">No Gravatar profile linked to this email</p>
              )}
            </SourceCard>
          )}

          {/* Hunter.io */}
          {hunter && (
            <SourceCard source={hunter}>
              {hunter.found === true && hunter.data && (
                <div>
                  <Row label="Name" value={hunter.data.name} />
                  <Row label="Position" value={hunter.data.position} />
                  <Row label="Company" value={hunter.data.company} />
                  <Row label="Industry" value={hunter.data.industry} />
                  <Row label="Location" value={hunter.data.location} />
                  <Row label="LinkedIn" value={hunter.data.linkedin} link />
                  <Row label="Twitter" value={hunter.data.twitter} link />
                  <Row label="Website" value={hunter.data.website} link />
                  {hunter.data.confidence && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-text-dim text-xs mono">Confidence</span>
                      <div className="flex-1 h-1.5 rounded-full bg-bg-elevated">
                        <div
                          className="h-full rounded-full bg-accent-green"
                          style={{ width: `${hunter.data.confidence}%` }}
                        />
                      </div>
                      <span className="text-accent-green text-xs mono">{hunter.data.confidence}%</span>
                    </div>
                  )}
                </div>
              )}
              {hunter.found === false && (
                <p className="text-text-muted text-sm">Email not found in Hunter.io database</p>
              )}
            </SourceCard>
          )}
        </div>
      </div>

      {/* HIBP Breach card */}
      {hibp && (
        <div>
          <SectionHeader icon="🔓" title="Data Breach Check" />
          <SourceCard source={hibp}>
            {hibp.found === true && hibp.data && (
              <div>
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-accent-red">
                      Found in {hibp.data.breachCount} data breach{hibp.data.breachCount > 1 ? 'es' : ''}
                    </p>
                    <p className="text-xs text-text-muted">This email has been exposed in data breaches</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {hibp.data.breaches?.map((breach, i) => (
                    <div key={i} className="p-3 rounded-xl bg-bg-elevated border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-text-primary text-sm">{breach.name}</p>
                          <p className="text-xs text-text-muted">{breach.domain} · {breach.date}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red/15 text-accent-red mono flex-shrink-0">
                          {(breach.pwnCount / 1e6).toFixed(1)}M records
                        </span>
                      </div>
                      {breach.dataClasses?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {breach.dataClasses.map((cls, j) => (
                            <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-bg-card border border-border text-text-dim">
                              {cls}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hibp.found === false && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-green/10 border border-accent-green/20">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-accent-green">No breaches found</p>
                  <p className="text-xs text-text-muted">Email not found in known data breaches</p>
                </div>
              </div>
            )}
          </SourceCard>
        </div>
      )}
    </div>
  )
}
