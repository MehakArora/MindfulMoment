export default function MeditationBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900" />
      
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>
      
      {/* Moon */}
      <div className="absolute top-16 right-16">
        <div className="w-20 h-20 bg-yellow-100 rounded-full shadow-lg shadow-yellow-100/50" />
        <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-200/50 rounded-full" />
      </div>
      
      {/* Mountains silhouette */}
      <svg 
        viewBox="0 0 1440 320" 
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <path 
          fill="#1e293b" 
          d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,197.3C840,192,960,160,1080,165.3C1200,171,1320,213,1380,234.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>
      
      {/* Foreground hills */}
      <svg 
        viewBox="0 0 1440 320" 
        className="absolute bottom-0 w-full"
        preserveAspectRatio="none"
      >
        <path 
          fill="#0f172a" 
          d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      
      {/* Ambient glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/5 to-transparent" />
    </div>
  )
}
