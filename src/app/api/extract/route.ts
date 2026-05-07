import { NextRequest, NextResponse } from "next/server";
import { setExtractionJob, getExtractionJob } from "@/lib/jobs";
import { downloadAudio, getVideoTitle } from "@/lib/video";
import { getAudioDuration } from "@/lib/audio";
import { transcribeAudio } from "@/lib/asr";
import { callLLM, sanitizeJsonResponse } from "@/lib/llm";
import { BLOG_SUMMARY_PROMPT } from "@/lib/prompts";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const jobId = `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const jobDir = path.join(UPLOAD_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const job = {
    id: jobId,
    url,
    status: "downloading" as const,
    progress: 10,
    createdAt: new Date().toISOString(),
  };
  setExtractionJob(job);

  runExtraction(jobId, url, jobDir).catch(() => {});

  return NextResponse.json(job);
}

async function runExtraction(jobId: string, url: string, jobDir: string) {
  try {
    const job = getExtractionJob(jobId)!;

    const [audioPath, title] = await Promise.all([
      downloadAudio(url, jobDir),
      getVideoTitle(url),
    ]);
    job.audioPath = audioPath;
    job.status = "transcribing";
    job.progress = 30;
    setExtractionJob({ ...job });

    const duration = await getAudioDuration(audioPath);
    const transcript = await transcribeAudio(audioPath);
    job.transcript = transcript;
    job.status = "summarizing";
    job.progress = 70;
    setExtractionJob({ ...job });

    const prompt = BLOG_SUMMARY_PROMPT.replace("{transcript}", transcript);
    const raw = await callLLM(prompt, 4096);
    const parsed = JSON.parse(sanitizeJsonResponse(raw));

    job.summary = {
      title: parsed.title || title || "Untitled",
      tldr: parsed.tldr || "",
      keyPoints: parsed.keyPoints || [],
      outline: parsed.outline || [],
      tags: parsed.tags || [],
      sourceUrl: url,
      duration,
    };
    job.status = "done";
    job.progress = 100;
    setExtractionJob({ ...job });

    fs.rmSync(jobDir, { recursive: true, force: true });
  } catch (e) {
    const job = getExtractionJob(jobId);
    if (job) {
      job.status = "error";
      job.error = e instanceof Error ? e.message : "Unknown error";
      setExtractionJob({ ...job });
    }
  }
}
