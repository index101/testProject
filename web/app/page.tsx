"use client";

import { useState, useCallback } from "react";

interface SignalInput {
  id: string;
  signalType: string;
  signalCategory: string;
  signalSource: string;
  signalValue: string;
  priorityLevel: number;
  timestamp: string;
  version: number;
  isActive: boolean;
}

interface SignalOutput {
  id: string;
  inputSignalId: string;
  processedBy: string;
  status: string;
  result: string;
  priorityLevel: number;
  metadata: string[];
  processedAt: string;
}

const MODULE_NAMES = [
  "SignalRegistry",
  "SignalClassification",
  "SignalPriorityEngine",
  "SignalWeighting",
  "SignalRouting",
  "SignalConflictResolver",
  "SignalExpiration",
  "SignalSilenceFilter",
  "SignalEscalation",
  "SignalIntegrityChecker",
];

interface VideoResult {
  success: boolean;
  videos: { name: string; file: string }[];
  srt: { name: string; file: string }[];
}

export default function Home() {
  const [signal, setSignal] = useState<SignalInput | null>(null);
  const [results, setResults] = useState<Record<string, SignalOutput> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>(MODULE_NAMES);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);

  const fetchSample = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/signals/sample");
      if (!res.ok) throw new Error("Failed to fetch sample");
      const data = await res.json();
      setSignal(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const processSignal = useCallback(async () => {
    if (!signal) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signals/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal,
          modules: selectedModules,
        }),
      });
      if (!res.ok) throw new Error("Failed to process");
      const { results: r } = await res.json();
      setResults(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [signal, selectedModules]);

  const toggleModule = (name: string) => {
    setSelectedModules((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const generateVideos = useCallback(async () => {
    setVideoLoading(true);
    setVideoError(null);
    setVideoResult(null);
    try {
      const res = await fetch("/api/videos/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setVideoResult(data);
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setVideoLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                Signal Intelligence
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Backend × Frontend — Modular pipeline demo
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="px-2 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">
                Node.js · TypeScript
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Controls */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchSample}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] font-medium text-sm hover:bg-[var(--accent-muted)] disabled:opacity-50 transition-colors"
            >
              {loading && !signal ? "Loading…" : "1. Load Sample Signal"}
            </button>
            <button
              onClick={processSignal}
              disabled={loading || !signal}
              className="px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm hover:border-[var(--accent)] disabled:opacity-50 transition-colors"
            >
              {loading && signal ? "Processing…" : "2. Process Signal"}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </section>

        {/* Module selector */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Select modules to run
          </h2>
          <div className="flex flex-wrap gap-2">
            {MODULE_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => toggleModule(name)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  selectedModules.includes(name)
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]"
                }`}
              >
                {name.replace("Signal", "")}
              </button>
            ))}
          </div>
        </section>

        {/* Input / Output layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 card-hover">
            <h2 className="text-sm font-medium text-[var(--accent)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              SignalInput
            </h2>
            {signal ? (
              <pre className="text-xs font-mono text-[var(--text-secondary)] overflow-x-auto p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
                {JSON.stringify(signal, null, 2)}
              </pre>
            ) : (
              <div className="p-8 rounded-lg bg-[var(--background)] border border-dashed border-[var(--border)] text-center text-[var(--text-secondary)] text-sm">
                Click &quot;Load Sample Signal&quot; to fetch input
              </div>
            )}
          </section>

          {/* Output */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 card-hover">
            <h2 className="text-sm font-medium text-[var(--accent)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              SignalOutput (per module)
            </h2>
            {results ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {Object.entries(results).map(([name, output]) => (
                  <div
                    key={name}
                    className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                  >
                    <div className="text-xs font-mono text-[var(--accent)] mb-2">
                      {name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] space-y-1">
                      <div>
                        <span className="text-[var(--text-primary)]">status:</span>{" "}
                        <span className={output.status.includes("OK") || output.status.includes("REGISTERED") || output.status.includes("VALID") ? "text-emerald-400" : ""}>
                          {output.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-primary)]">result:</span>{" "}
                        {output.result}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-[var(--background)] border border-dashed border-[var(--border)] text-center text-[var(--text-secondary)] text-sm">
                Click &quot;Process Signal&quot; to see outputs
              </div>
            )}
          </section>
        </div>

        {/* Video Pipeline */}
        <section className="mt-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <h2 className="text-sm font-medium text-[var(--accent)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            Video Pipeline (Signal → Video)
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Generate HIGH and LOW priority videos from the integrated pipeline. Takes ~30–60 seconds.
          </p>
          <button
            onClick={generateVideos}
            disabled={videoLoading}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] font-medium text-sm hover:bg-[var(--accent-muted)] disabled:opacity-50 transition-colors"
          >
            {videoLoading ? "Generating videos…" : "3. Generate Videos"}
          </button>
          {videoError && (
            <p className="mt-3 text-sm text-red-400">{videoError}</p>
          )}
          {videoResult && (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {videoResult.videos.map((v) => (
                <div key={v.file} className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                  <div className="p-2 text-xs font-medium text-[var(--text-primary)] border-b border-[var(--border)]">
                    {v.name}
                  </div>
                  <video
                    src={`/api/videos/file?name=${encodeURIComponent(v.file)}`}
                    controls
                    className="w-full aspect-[9/16] max-h-[320px] object-contain bg-black"
                  />
                  <div className="p-2 flex gap-2">
                    <a
                      href={`/api/videos/file?name=${encodeURIComponent(v.file)}`}
                      download={v.file}
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      Download MP4
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Architecture note */}
        <section className="mt-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/50">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
            Architecture
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Each module follows: <code className="text-[var(--accent)] font-mono text-xs">input model → service logic → output object</code>.
            The frontend calls Next.js API routes; the API runs the modular backend services. Clean separation, no mixed responsibilities.
          </p>
        </section>
      </main>
    </div>
  );
}
