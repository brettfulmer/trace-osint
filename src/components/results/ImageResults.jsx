function SectionHeader({ icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span>{icon}</span>
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mono">{title}</h2>
      {count !== undefined && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple mono">{count}</span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function ImageResults({ results }) {
  const { filename, faceCount, possibleNames, bestGuess, sources } = results
  const vision = sources?.vision

  if (vision?.found === null && vision?.note?.includes('not configured')) {
    return (
      <div className="card-glow rounded-2xl border border-accent-yellow/30 bg-bg-card p-8 text-center">
        <div className="text-5xl mb-4">🔑</div>
        <h2 className="text-xl font-semibold text-accent-yellow mb-2">Google Vision API Key Required</h2>
        <p className="text-text-muted mb-4 max-w-md mx-auto text-sm">
          Reverse image search requires a Google Vision API key. You get <strong className="text-text-primary">1,000 free requests per month</strong>.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-accent-purple text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 0 20px rgba(108,99,255,0.4)' }}
          >
            Get API Key →
          </a>
          <p className="text-text-dim text-xs mt-2">
            Then set <code className="bg-bg-elevated px-1 py-0.5 rounded mono">GOOGLE_VISION_API_KEY</code> in Netlify environment variables
          </p>
        </div>
      </div>
    )
  }

  const visionData = vision?.data
  const hasResults = vision?.found === true

  return (
    <div className="space-y-5 fade-in-up">
      {/* Summary card */}
      <div className="card-glow rounded-2xl border border-border bg-bg-card overflow-hidden">
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #6c63ff, #00d4ff, #00ff88)' }} />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))', border: '1px solid rgba(108,99,255,0.3)' }}
            >
              🖼️
            </div>
            <div>
              <p className="font-semibold text-text-primary">{filename}</p>
              <p className="text-text-muted text-sm mt-0.5">
                {hasResults ? 'Matches found on the web' : 'No matches found'}
              </p>
              {faceCount > 0 && (
                <p className="text-accent-cyan text-sm mt-0.5">👤 {faceCount} face{faceCount > 1 ? 's' : ''} detected</p>
              )}
            </div>
          </div>

          {/* Possible identities */}
          {possibleNames?.length > 0 && (
            <div className="p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/20 mb-4">
              <p className="text-xs text-text-muted mono mb-2">POSSIBLE IDENTITY</p>
              <div className="flex flex-wrap gap-2">
                {possibleNames.map((name, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-accent-purple/20 text-accent-cyan text-sm font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Best guess labels */}
          {bestGuess?.length > 0 && (
            <div>
              <p className="text-xs text-text-dim mono mb-1.5">BEST GUESS</p>
              <div className="flex flex-wrap gap-1.5">
                {bestGuess.map((label, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-xs">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Web entities */}
      {visionData?.entities?.length > 0 && (
        <div>
          <SectionHeader icon="🏷️" title="Identified Entities" count={visionData.entities.length} />
          <div className="card-glow rounded-2xl border border-border bg-bg-card p-5">
            <div className="flex flex-wrap gap-2">
              {visionData.entities.map((entity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-elevated border border-border"
                >
                  <span className="text-sm text-text-primary">{entity.description}</span>
                  <span className="text-xs text-accent-purple mono">{entity.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pages with matching images */}
      {visionData?.pagesWithImage?.length > 0 && (
        <div>
          <SectionHeader icon="🌐" title="Found on Web Pages" count={visionData.pagesWithImage.length} />
          <div className="space-y-2">
            {visionData.pagesWithImage.map((page, i) => (
              <a
                key={i}
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-glow flex items-start gap-3 p-4 rounded-xl border border-border bg-bg-card hover:border-accent-cyan/30 transition-colors group"
              >
                {page.thumbnails?.[0] && (
                  <img
                    src={page.thumbnails[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  {page.title && (
                    <p className="font-medium text-text-primary text-sm line-clamp-1 group-hover:text-accent-cyan transition-colors">
                      {page.title}
                    </p>
                  )}
                  <p className="text-text-muted text-xs mt-0.5 truncate mono">{page.url}</p>
                </div>
                <span className="text-text-dim group-hover:text-accent-cyan text-sm flex-shrink-0 transition-colors">→</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Full matching images */}
      {visionData?.fullMatches?.length > 0 && (
        <div>
          <SectionHeader icon="🎯" title="Exact Image Matches" count={visionData.fullMatches.length} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visionData.fullMatches.map((match, i) => (
              <a
                key={i}
                href={match.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-accent-green/30 bg-bg-card hover:border-accent-green transition-colors"
              >
                <img
                  src={match.url}
                  alt={`Match ${i + 1}`}
                  className="w-full h-28 object-cover"
                  onError={(e) => {
                    e.target.parentElement.innerHTML = `<div class="w-full h-28 flex items-center justify-center text-text-dim text-xs p-2 text-center">${match.url.substring(0, 40)}...</div>`
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Similar images */}
      {visionData?.similarImages?.length > 0 && (
        <div>
          <SectionHeader icon="🔍" title="Visually Similar Images" count={visionData.similarImages.length} />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {visionData.similarImages.map((img, i) => (
              <a
                key={i}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-border bg-bg-card hover:border-accent-purple/30 transition-colors"
              >
                <img
                  src={img.url}
                  alt={`Similar ${i + 1}`}
                  className="w-full h-20 object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!hasResults && vision?.found !== null && (
        <div className="card-glow rounded-2xl border border-border bg-bg-card p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-muted">No web matches found for this image</p>
          <p className="text-text-dim text-sm mt-1">Try a different image or a more prominent photo</p>
        </div>
      )}
    </div>
  )
}
