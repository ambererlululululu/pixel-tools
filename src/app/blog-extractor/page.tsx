"use client";

import { useState } from "react";
import PixelNav from "@/components/PixelNav";
import PixelCard from "@/components/PixelCard";
import PixelButton from "@/components/PixelButton";
import PixelInput from "@/components/PixelInput";
import PixelLoading from "@/components/PixelLoading";
import PixelBadge from "@/components/PixelBadge";
import type { BlogSummary } from "@/lib/types";

type Status = "idle" | "downloading" | "transcribing" | "summarizing" | "done" | "error";

const statusLabels: Record<Status, string> = {
  idle: "",
  downloading: "Downloading video...",
  transcribing: "Transcribing audio via ASR...",
  summarizing: "Generating summary...",
  done: "Complete!",
  error: "Error occurred",
};

export default function BlogExtractorPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<BlogSummary | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleExtract = async () => {
    if (!url) return;
    setStatus("downloading");
    setProgress(10);
    setError("");
    setSummary(null);
    setSaved(false);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extract failed");

      const jobId = data.jobId;
      let job = data;

      while (job.status !== "done" && job.status !== "error") {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch("/api/extract-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        job = await pollRes.json();
        setStatus(job.status);
        setProgress(job.progress);
      }

      if (job.status === "error") throw new Error(job.error);
      setSummary(job.summary);
      setStatus("done");
      setProgress(100);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleSaveToKB = async () => {
    if (!summary) return;
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: summary.title,
        content: `## TLDR\n${summary.tldr}\n\n## Key Points\n${summary.keyPoints.map((p) => `- ${p}`).join("\n")}\n\n## Outline\n${summary.outline.map((s) => `### ${s.heading}\n${s.content}`).join("\n\n")}`,
        category: "blog-extract",
        tags: summary.tags,
        source: summary.sourceUrl,
        sourceType: "blog-extract",
      }),
    });
    setSaved(true);
  };

  return (
    <>
      <PixelNav />
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold tracking-wide mb-1">
            <span className="text-accent-blue">{">>"}</span> BLOG EXTRACTOR
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Extract and summarize content from video/blog URLs
          </p>

          {/* Input */}
          <PixelCard className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <PixelInput
                  value={url}
                  onChange={setUrl}
                  placeholder="Paste a video or blog URL (Bilibili, etc.)"
                />
              </div>
              <PixelButton
                variant="primary"
                onClick={handleExtract}
                disabled={!url || (status !== "idle" && status !== "done" && status !== "error")}
              >
                EXTRACT
              </PixelButton>
            </div>
          </PixelCard>

          {/* Progress */}
          {status !== "idle" && status !== "done" && status !== "error" && (
            <PixelCard className="mb-6">
              <PixelLoading text={statusLabels[status]} />
              <div className="pixel-progress mt-3">
                <div
                  className="pixel-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </PixelCard>
          )}

          {/* Error */}
          {status === "error" && (
            <PixelCard className="mb-6">
              <p className="text-accent-red text-sm">{error}</p>
            </PixelCard>
          )}

          {/* Result */}
          {summary && (
            <div className="space-y-4 animate-fade-in-up">
              <PixelCard>
                <h2 className="text-lg font-bold mb-2">{summary.title}</h2>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {summary.tags.map((tag) => (
                    <PixelBadge key={tag} label={tag} color="blue" />
                  ))}
                  {summary.duration && (
                    <PixelBadge label={summary.duration} color="green" />
                  )}
                </div>
                <div className="pixel-divider my-3" />
                <h3 className="text-sm font-bold text-text-muted mb-2">
                  // TLDR
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {summary.tldr}
                </p>
              </PixelCard>

              <PixelCard>
                <h3 className="text-sm font-bold text-text-muted mb-3">
                  // KEY POINTS
                </h3>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-accent-green shrink-0">{">"}</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </PixelCard>

              <PixelCard>
                <h3 className="text-sm font-bold text-text-muted mb-3">
                  // OUTLINE
                </h3>
                <div className="space-y-3">
                  {summary.outline.map((section, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-bold text-accent-purple">
                        {section.timestamp && (
                          <span className="text-text-muted mr-2">
                            [{section.timestamp}]
                          </span>
                        )}
                        {section.heading}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1 ml-4">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
              </PixelCard>

              <div className="flex gap-3">
                <PixelButton
                  variant="primary"
                  onClick={handleSaveToKB}
                  disabled={saved}
                >
                  {saved ? "SAVED!" : "SAVE TO KNOWLEDGE BASE"}
                </PixelButton>
                <PixelButton
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `# ${summary.title}\n\n${summary.tldr}\n\n${summary.keyPoints.map((p) => `- ${p}`).join("\n")}`
                    );
                  }}
                >
                  COPY MARKDOWN
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
