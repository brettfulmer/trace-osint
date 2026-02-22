const MESSAGES = {
  username: [
    'Pinging GitHub API...',
    'Checking Reddit profile...',
    'Scanning Hacker News...',
    'Querying Dev.to...',
    'Checking Keybase...',
    'Probing 15+ social platforms...',
    'Aggregating intelligence...',
  ],
  email: [
    'Querying Gravatar...',
    'Enriching via Hunter.io...',
    'Checking breach databases...',
    'Validating email format...',
    'Cross-referencing sources...',
  ],
  phone: [
    'Querying carrier database...',
    'Detecting country code...',
    'Validating number format...',
    'Checking line type...',
  ],
  image: [
    'Processing image data...',
    'Running Google Vision analysis...',
    'Scanning web for matches...',
    'Finding similar images...',
    'Extracting entities...',
  ],
}

const PLATFORM_NAMES = [
  'GitHub', 'Reddit', 'Twitter', 'Instagram', 'TikTok', 'LinkedIn',
  'Twitch', 'YouTube', 'Hacker News', 'Dev.to', 'Keybase', 'GitLab',
  'Pinterest', 'Medium', 'Telegram', 'Snapchat', 'Tumblr', 'Mastodon',
]

export default function LoadingState({ searchType, query }) {
  return (
    <div className="mt-8 fade-in-up">
      {/* Main card */}
      <div className="card-glow rounded-2xl border border-border bg-bg-card p-8 text-center">
        {/* Animated radar */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full border-2 border-accent-purple/30"
            style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
          />
          <div
            className="absolute inset-3 rounded-full border-2 border-accent-cyan/30"
            style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.5s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))',
                border: '1px solid rgba(108,99,255,0.5)',
                boxShadow: '0 0 20px rgba(108,99,255,0.3)',
              }}
            >
              🔍
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-text-primary mb-1">
          Scanning Intelligence Networks
        </h2>
        <p className="text-text-muted text-sm mb-6">
          Searching for <span className="text-accent-cyan mono">"{query}"</span>
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-accent-purple"
              style={{
                animation: 'pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Platform pills for username */}
        {searchType === 'username' && (
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {PLATFORM_NAMES.map((name, i) => (
              <div
                key={name}
                className="px-2.5 py-1 rounded-full border border-border text-xs text-text-muted mono"
                style={{
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: `${(i * 0.15) % 2}s`,
                }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
