function Home() {
  const features = [
    { icon: "⚡", label: "Real-time delivery" },
    { icon: "💬", label: "Typing indicators" },
    { icon: "😛", label: "Reliable" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-50 rounded-full" />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Chat, instantly.
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Real-time messaging powered by WebSockets — see messages and typing indicators the moment they happen.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {features.map((feature) => (
            <span
              key={feature.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
            >
              <span>{feature.icon}</span>
              {feature.label}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href="/user/login"
            className="w-full text-center bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            Log In
          </a>

          <a 
            href="/user/register"
            className="w-full text-center bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-semibold py-3 rounded-xl border border-gray-200 transition-colors shadow-sm"
          >
            Create Account
          </a>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-8">
          Just conversations.
        </p>

      </div>
    </div>
  );
}

export default Home;