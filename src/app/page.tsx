import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50 to-white">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-primary-500 rounded-3xl flex items-center justify-center shadow-medium">
            <span className="text-4xl font-bold text-white">V</span>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">
          VitAI
        </h1>

        {/* Tagline */}
        <p className="text-lg text-neutral-600 mb-8">
          Smart nutrition tracking powered by AI
        </p>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/signup"
            className="btn-primary w-full py-4 text-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="btn-secondary w-full py-4 text-lg"
          >
            Sign In
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 mx-auto bg-primary-100 rounded-xl flex items-center justify-center mb-2">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-sm text-neutral-600">Photo Logging</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto bg-secondary-100 rounded-xl flex items-center justify-center mb-2">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-sm text-neutral-600">AI Analysis</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto bg-info/10 rounded-xl flex items-center justify-center mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-neutral-600">Track Progress</p>
          </div>
        </div>
      </div>
    </main>
  );
}
