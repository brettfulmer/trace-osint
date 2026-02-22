import UsernameResults from './results/UsernameResults'
import EmailResults from './results/EmailResults'
import PhoneResults from './results/PhoneResults'
import ImageResults from './results/ImageResults'

export default function ResultsDisplay({ results, query }) {
  const searchType = results.searchType

  return (
    <div className="mt-8 fade-in-up">
      {/* Result header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent-green status-pulse" />
          <span className="text-text-muted text-sm mono">
            INTELLIGENCE REPORT · <span className="text-accent-cyan">{new Date().toUTCString()}</span>
          </span>
        </div>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `trace-${searchType}-${query.replace(/[^a-z0-9]/gi, '_')}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="text-xs text-text-muted hover:text-accent-cyan transition-colors mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-accent-cyan/30"
        >
          ⬇ Export JSON
        </button>
      </div>

      {searchType === 'username' && <UsernameResults results={results} />}
      {searchType === 'email' && <EmailResults results={results} />}
      {searchType === 'phone' && <PhoneResults results={results} />}
      {searchType === 'image' && <ImageResults results={results} />}
    </div>
  )
}
