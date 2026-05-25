import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xl">
        {/* Eyebrow */}
        <p className="text-xs text-blue tracking-[3px] uppercase mb-4 font-mono">
          spend less through
        </p>

        {/* Logo */}
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none mb-4">
          spend<span className="text-blue">lens</span>
        </h1>

        {/* Tagline */}
        <p className="text-muted text-sm leading-relaxed max-w-sm mb-8">
          Your company is bleeding money on AI tools it barely uses.
          <br />
          Let&apos;s find exactly where — and what to do about it.
        </p>

        {/* CTA */}
        <Link
          href="/audit"
          className="bg-blue-dim hover:bg-blue text-white font-semibold px-8 py-3 rounded-md text-sm transition-colors"
        >
          Run the free audit →
        </Link>

        {/* Stats */}
        <div className="flex mt-12 border border-border rounded-lg overflow-hidden">
          {[
            { n: "₹33L+", l: "avg annual waste found" },
            { n: "3 min", l: "to complete audit" },
            { n: "100%", l: "free forever" },
          ].map((s) => (
            <div
              key={s.l}
              className="px-7 py-4 text-center border-r border-border last:border-r-0"
            >
              <div className="text-lg font-bold text-green">{s.n}</div>
              <div className="text-xs text-dimmer mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-left w-full">
          {[
            { step: "01", title: "Add your tools", desc: "Tell us what AI tools your team pays for." },
            { step: "02", title: "We find the waste", desc: "We detect overlaps, unused seats, and bad plans." },
            { step: "03", title: "Get your verdict", desc: "Cut what's wasteful. Invest where it matters." },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-surface border border-border rounded-lg p-4"
            >
              <div className="text-xs text-blue font-mono mb-2">{s.step}</div>
              <div className="text-sm font-semibold mb-1">{s.title}</div>
              <div className="text-xs text-muted leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
