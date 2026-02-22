import { useState, useCallback } from 'react'
import Header from './components/Header'
import SearchPanel from './components/SearchPanel'
import ResultsDisplay from './components/ResultsDisplay'
import LoadingState from './components/LoadingState'

export default function App() {
  const [searchType, setSearchType] = useState('username')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [lastQuery, setLastQuery] = useState('')

  const handleSearch = useCallback(async (query, type) => {
    setLoading(true)
    setResults(null)
    setError(null)
    setLastQuery(typeof query === 'string' ? query : query.filename || 'uploaded image')

    try {
      let bodyData
      if (type === 'image') {
        bodyData = JSON.stringify({ image: query.base64, filename: query.filename })
      } else {
        bodyData = JSON.stringify({ query })
      }

      const res = await fetch(`/.netlify/functions/search-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Search failed (${res.status})`)
      }

      const data = await res.json()
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'linear-gradient(160deg, #05050f 0%, #08081a 50%, #05050f 100%)' }}>
      {/* Animated scan line */}
      {loading && <div className="scan-line" />}

      <Header />

      <main className="container mx-auto px-4 pb-16 max-w-5xl">
        <SearchPanel
          searchType={searchType}
          onTypeChange={(t) => { setSearchType(t); setResults(null); setError(null) }}
          onSearch={handleSearch}
          loading={loading}
        />

        {loading && <LoadingState searchType={searchType} query={lastQuery} />}

        {error && !loading && (
          <div className="mt-8 p-5 rounded-2xl border border-accent-red/30 bg-accent-red/5 fade-in-up">
            <div className="flex items-start gap-3">
              <span className="text-accent-red text-xl">⚠</span>
              <div>
                <p className="font-semibold text-accent-red">Search Failed</p>
                <p className="text-sm text-text-muted mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {results && !loading && (
          <ResultsDisplay results={results} query={lastQuery} />
        )}

        {!results && !loading && !error && (
          <div className="mt-16 text-center text-text-dim">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg text-text-muted">Enter a search query above to begin investigation</p>
            <p className="text-sm mt-2 text-text-dim">Supports email, phone, username, and image reverse search</p>
          </div>
        )}
      </main>
    </div>
  )
}
