import type { ExtractionJob, TranscriptionJob } from "./types";

const extractionJobs = new Map<string, ExtractionJob>();
const transcriptionJobs = new Map<string, TranscriptionJob>();

export function getExtractionJob(id: string) {
  return extractionJobs.get(id);
}

export function setExtractionJob(job: ExtractionJob) {
  extractionJobs.set(job.id, job);
}

export function getTranscriptionJob(id: string) {
  return transcriptionJobs.get(id);
}

export function setTranscriptionJob(job: TranscriptionJob) {
  transcriptionJobs.set(job.id, job);
}
