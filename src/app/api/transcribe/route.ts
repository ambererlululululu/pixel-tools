import { NextRequest, NextResponse } from "next/server";
import { setTranscriptionJob, getTranscriptionJob } from "@/lib/jobs";
import { extractAudio, getAudioDuration } from "@/lib/audio";
import { transcribeAudio } from "@/lib/asr";
import { callLLM, sanitizeJsonResponse } from "@/lib/llm";
import { MEETING_MINUTES_PROMPT } from "@/lib/prompts";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const jobId = `trx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const jobDir = path.join(UPLOAD_DIR, jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const filePath = path.join(jobDir, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const job = {
    id: jobId,
    filename: file.name,
    status: "extracting" as const,
    progress: 10,
    createdAt: new Date().toISOString(),
  };
  setTranscriptionJob(job);

  runTranscription(jobId, filePath, jobDir).catch(() => {});

  return NextResponse.json(job);
}

async function runTranscription(
  jobId: string,
  filePath: string,
  jobDir: string
) {
  try {
    const job = getTranscriptionJob(jobId)!;

    const isAudioOnly = /\.(mp3|wav|m4a|ogg|flac)$/i.test(filePath);
    let audioPath = filePath;

    if (!isAudioOnly) {
      audioPath = await extractAudio(filePath, jobDir);
    }

    job.status = "transcribing";
    job.progress = 30;
    setTranscriptionJob({ ...job });

    const duration = await getAudioDuration(audioPath);
    const transcript = await transcribeAudio(audioPath);
    job.transcript = transcript;
    job.status = "formatting";
    job.progress = 70;
    setTranscriptionJob({ ...job });

    const prompt = MEETING_MINUTES_PROMPT.replace("{transcript}", transcript);
    const raw = await callLLM(prompt, 4096);
    const parsed = JSON.parse(sanitizeJsonResponse(raw));

    job.minutes = {
      title: parsed.title || "Untitled Meeting",
      date: parsed.date || new Date().toISOString().slice(0, 10),
      duration: parsed.duration || duration,
      attendees: parsed.attendees || [],
      agenda: parsed.agenda || [],
      decisions: parsed.decisions || [],
      actionItems: parsed.actionItems || [],
      rawTranscript: transcript,
    };
    job.status = "done";
    job.progress = 100;
    setTranscriptionJob({ ...job });

    fs.rmSync(jobDir, { recursive: true, force: true });
  } catch (e) {
    const job = getTranscriptionJob(jobId);
    if (job) {
      job.status = "error";
      job.error = e instanceof Error ? e.message : "Unknown error";
      setTranscriptionJob({ ...job });
    }
  }
}
