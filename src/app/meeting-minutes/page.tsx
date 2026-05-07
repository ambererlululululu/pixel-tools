"use client";

import { useState } from "react";
import PixelNav from "@/components/PixelNav";
import PixelCard from "@/components/PixelCard";
import PixelButton from "@/components/PixelButton";
import PixelLoading from "@/components/PixelLoading";
import PixelBadge from "@/components/PixelBadge";
import FileUpload from "@/components/FileUpload";
import type { MeetingMinutes } from "@/lib/types";

type Status = "idle" | "uploading" | "extracting" | "transcribing" | "formatting" | "done" | "error";

const statusLabels: Record<Status, string> = {
  idle: "",
  uploading: "Uploading file...",
  extracting: "Extracting audio...",
  transcribing: "Transcribing via ASR...",
  formatting: "Formatting meeting minutes...",
  done: "Complete!",
  error: "Error occurred",
};

export default function MeetingMinutesPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState("");
  const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleFileSelect = async (file: File) => {
    setFilename(file.name);
    setStatus("uploading");
    setProgress(10);
    setError("");
    setMinutes(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const jobId = data.jobId;
      let job = data;

      while (job.status !== "done" && job.status !== "error") {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch("/api/transcribe-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        job = await pollRes.json();
        setStatus(job.status);
        setProgress(job.progress);
      }

      if (job.status === "error") throw new Error(job.error);
      setMinutes(job.minutes);
      setStatus("done");
      setProgress(100);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleSaveToKB = async () => {
    if (!minutes) return;
    const content = [
      `## Meeting: ${minutes.title}`,
      `**Date:** ${minutes.date}`,
      `**Duration:** ${minutes.duration}`,
      `**Attendees:** ${minutes.attendees.join(", ")}`,
      "",
      "## Agenda",
      ...minutes.agenda.map(
        (a) => `### ${a.topic}\n${a.speaker ? `Speaker: ${a.speaker}\n` : ""}${a.discussion}`
      ),
      "",
      "## Decisions",
      ...minutes.decisions.map((d) => `- ${d}`),
      "",
      "## Action Items",
      ...minutes.actionItems.map(
        (a) => `- ${a.task}${a.assignee ? ` (@${a.assignee})` : ""}${a.deadline ? ` [${a.deadline}]` : ""}`
      ),
    ].join("\n");

    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: minutes.title,
        content,
        category: "meeting",
        tags: ["meeting", minutes.date],
        sourceType: "meeting-minutes",
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
            <span className="text-accent-green">##</span> MEETING MINUTES
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Upload audio/video to generate structured meeting notes
          </p>

          {/* Upload */}
          {status === "idle" && (
            <FileUpload
              accept="audio/*,video/*,.mp4,.m4a,.mp3,.wav,.webm"
              onFileSelect={handleFileSelect}
              maxSizeMB={500}
            />
          )}

          {/* Progress */}
          {status !== "idle" && status !== "done" && status !== "error" && (
            <PixelCard className="mb-6">
              <p className="text-xs text-text-muted mb-2">FILE: {filename}</p>
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
              <p className="text-accent-red text-sm mb-3">{error}</p>
              <PixelButton onClick={() => setStatus("idle")}>
                TRY AGAIN
              </PixelButton>
            </PixelCard>
          )}

          {/* Result */}
          {minutes && (
            <div className="space-y-4 animate-fade-in-up">
              <PixelCard>
                <h2 className="text-lg font-bold mb-2">{minutes.title}</h2>
                <div className="flex gap-2 flex-wrap mb-3">
                  <PixelBadge label={minutes.date} color="blue" />
                  <PixelBadge label={minutes.duration} color="green" />
                  <PixelBadge
                    label={`${minutes.attendees.length} attendees`}
                    color="purple"
                  />
                </div>
              </PixelCard>

              <PixelCard>
                <h3 className="text-sm font-bold text-text-muted mb-3">
                  // AGENDA
                </h3>
                <div className="space-y-4">
                  {minutes.agenda.map((item, i) => (
                    <div key={i}>
                      <h4 className="text-sm font-bold text-accent-blue">
                        {item.topic}
                      </h4>
                      {item.speaker && (
                        <p className="text-xs text-text-muted">
                          Speaker: {item.speaker}
                        </p>
                      )}
                      <p className="text-sm text-text-secondary mt-1 ml-4">
                        {item.discussion}
                      </p>
                    </div>
                  ))}
                </div>
              </PixelCard>

              {minutes.decisions.length > 0 && (
                <PixelCard>
                  <h3 className="text-sm font-bold text-text-muted mb-3">
                    // DECISIONS
                  </h3>
                  <ul className="space-y-1">
                    {minutes.decisions.map((d, i) => (
                      <li key={i} className="text-sm text-text-secondary flex gap-2">
                        <span className="text-accent-yellow shrink-0">*</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </PixelCard>
              )}

              {minutes.actionItems.length > 0 && (
                <PixelCard>
                  <h3 className="text-sm font-bold text-text-muted mb-3">
                    // ACTION ITEMS
                  </h3>
                  <div className="space-y-2">
                    {minutes.actionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-accent-green shrink-0">
                          [ ]
                        </span>
                        <div>
                          <span className="text-text-primary">{item.task}</span>
                          {item.assignee && (
                            <span className="text-accent-purple ml-2">
                              @{item.assignee}
                            </span>
                          )}
                          {item.deadline && (
                            <span className="text-text-muted ml-2">
                              [{item.deadline}]
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </PixelCard>
              )}

              <div className="flex gap-3">
                <PixelButton
                  variant="primary"
                  onClick={handleSaveToKB}
                  disabled={saved}
                >
                  {saved ? "SAVED!" : "SAVE TO KNOWLEDGE BASE"}
                </PixelButton>
                <PixelButton onClick={() => setStatus("idle")}>
                  NEW UPLOAD
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
