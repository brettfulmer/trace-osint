export default function Header() {
  return (
    <header className="pt-12 pb-8 text-center relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(108,99,255,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-purple/30 bg-accent-purple/10 text-accent-cyan text-xs font-medium mb-5 mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green status-pulse inline-block" />
          WORLDWIDE INTELLIGENCE NETWORK · LIVE
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', boxShadow: '0 0 20px rgba(108,99,255,0.5)' }}
          >
            🔍
          </div>
          <h1 className="text-4xl font-bold tracking-tight glow-text">
            TRACE
          </h1>
        </div>

        <p className="text-text-muted text-base max-w-md mx-auto">
          Comprehensive OSINT Intelligence Platform — search by email, phone, username, or image
        </p>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-8 mt-6 text-xs text-text-dim mono">
          <span><span className="text-accent-green">18+</span> platforms</span>
          <span className="text-text-dim">·</span>
          <span><span className="text-accent-cyan">4</span> search modes</span>
          <span className="text-text-dim">·</span>
          <span><span className="text-accent-purple">Free</span> APIs</span>
        </div>
      </div>
    </header>
  )
}
