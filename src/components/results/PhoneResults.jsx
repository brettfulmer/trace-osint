function InfoRow({ label, value, highlight }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-text-muted text-sm">{label}</span>
      <span className={`text-sm font-medium mono ${highlight ? 'text-accent-cyan' : 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  )
}

const LINE_TYPE_META = {
  mobile: { icon: '📱', label: 'Mobile', color: 'text-accent-green' },
  landline: { icon: '📞', label: 'Landline', color: 'text-accent-cyan' },
  voip: { icon: '💻', label: 'VoIP', color: 'text-accent-yellow' },
  unknown: { icon: '❓', label: 'Unknown', color: 'text-text-muted' },
}

export default function PhoneResults({ results }) {
  const { phone, cleaned, valid, country, countryFlag, timezone, carrier, lineType, formatted, localFormat, callerName, lineStatus, portedNetwork, sources } = results
  const abstractData = sources?.abstractapi?.data

  const lineTypeMeta = lineType ? (LINE_TYPE_META[lineType.toLowerCase()] || LINE_TYPE_META.unknown) : null

  return (
    <div className="space-y-5 fade-in-up">
      {/* Main phone card */}
      <div className="card-glow rounded-2xl border border-border bg-bg-card overflow-hidden">
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #6c63ff, #00d4ff)' }} />
        <div className="p-6">
          {/* Phone number display */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))', border: '1px solid rgba(108,99,255,0.3)' }}
            >
              {countryFlag || '📱'}
            </div>
            <div>
              <p className="text-2xl font-bold mono text-text-primary">{formatted || phone}</p>
              {localFormat && localFormat !== formatted && (
                <p className="text-text-muted text-sm mono mt-0.5">Local: {localFormat}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {valid === true && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/20 mono">
                    ✓ Valid
                  </span>
                )}
                {valid === false && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red/15 text-accent-red border border-accent-red/20 mono">
                    ✗ Invalid
                  </span>
                )}
                {lineTypeMeta && (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-bg-elevated border border-border mono ${lineTypeMeta.color}`}>
                    {lineTypeMeta.icon} {lineTypeMeta.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            {callerName && <InfoRow label="Caller Name" value={callerName} highlight />}
            <InfoRow label="Country" value={country ? `${countryFlag || ''} ${country}`.trim() : null} highlight />
            <InfoRow label="Carrier / Operator" value={carrier} highlight />
            <InfoRow label="Line Type" value={lineType} />
            {lineStatus && <InfoRow label="Line Status" value={lineStatus} />}
            {portedNetwork && <InfoRow label="Ported Network" value={portedNetwork} />}
            <InfoRow label="Timezone" value={timezone} />
            <InfoRow label="International Format" value={formatted} />
            <InfoRow label="Local Format" value={localFormat} />
          </div>

          {/* Source */}
          {sources?.abstractapi?.found === null && sources?.abstractapi?.note && (
            <div className="mt-4 p-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20">
              <p className="text-accent-yellow text-xs flex items-start gap-1.5">
                <span>⚠</span>
                <span>{sources.abstractapi.note}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* OSINT tips card */}
      <div className="card-glow rounded-2xl border border-border bg-bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span>💡</span>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mono">Investigation Tips</h3>
        </div>
        <div className="space-y-3">
          {[
            { platform: 'WhatsApp', icon: '💬', url: `https://wa.me/${cleaned.replace(/\D/g, '')}`, tip: 'Check if registered on WhatsApp' },
            { platform: 'Telegram', icon: '✈️', url: `https://t.me/${cleaned.replace(/\D/g, '')}`, tip: 'Search on Telegram' },
            { platform: 'Truecaller', icon: '📋', url: `https://www.truecaller.com/search/au/${cleaned.replace(/\D/g, '')}`, tip: 'Name lookup via Truecaller' },
          ].map(({ platform, icon, url, tip }) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent-purple/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span>{icon}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{platform}</p>
                  <p className="text-xs text-text-muted">{tip}</p>
                </div>
              </div>
              <span className="text-text-dim group-hover:text-accent-cyan text-sm transition-colors">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
