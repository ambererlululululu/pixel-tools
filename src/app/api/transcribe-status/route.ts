import { NextRequest, NextResponse } from "next/server";
import { getTranscriptionJob } from "@/lib/jobs";

export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  const job = getTranscriptionJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }
  return NextResponse.json(job);
}
