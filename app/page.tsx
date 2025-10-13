export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          World Heritage Explorer
        </h1>
        <p className="text-center text-lg mb-8">
          Discover 1,248 UNESCO World Heritage Sites around the world
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/heritage"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            Explore Sites
          </a>
          <a
            href="/games"
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
          >
            Play Games
          </a>
        </div>
      </div>
    </main>
  )
}
