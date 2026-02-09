import Link from "next/link";

const features = [
  {
    title: "Web Worker Offloading",
    description:
      "Heavy computation moves off the main thread, keeping the UI responsive even under extreme event pressure.",
  },
  {
    title: "Batching & Flush Control",
    description:
      "Buffered events are committed to the UI at configurable intervals, reducing render pressure and preventing frame drops.",
  },
  {
    title: "Graceful Degradation",
    description:
      "When ingestion exceeds capacity, excess events are dropped intentionally to preserve UI stability — not crashed.",
  },
  {
    title: "Pause, Inspect & Drill-Down",
    description:
      "Freeze the live stream to inspect a snapshot. Drill into any time window to isolate context without losing data.",
  },
  {
    title: "Performance Comparison",
    description:
      "Capture a baseline, toggle Worker mode, and see FPS, throughput, and processing-time deltas side by side.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <span className="mb-4 inline-block text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Frontend Engineering Case Study
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          ⚡ HyperDash
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground leading-relaxed">
          A real-time performance monitoring dashboard that simulates frontend
          observability challenges under extreme event pressure — and
          demonstrates how batching, workers, degradation, and inspection
          protect UI stability.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Launch Dashboard →
        </Link>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border bg-card p-5 space-y-2"
            >
              <h3 className="text-sm font-semibold text-card-foreground">
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built with Next.js 16, React 19, Zustand, Web Workers & Recharts
      </footer>
    </div>
  );
}
