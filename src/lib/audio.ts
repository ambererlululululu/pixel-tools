import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const exec = promisify(execFile);

export async function extractAudio(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(
    outputDir,
    `${path.basename(inputPath, path.extname(inputPath))}.wav`
  );

  await exec("ffmpeg", [
    "-i", inputPath,
    "-vn",
    "-acodec", "pcm_s16le",
    "-ar", "16000",
    "-ac", "1",
    "-y",
    outputPath,
  ]);

  return outputPath;
}

export async function splitAudio(
  inputPath: string,
  outputDir: string,
  segmentSeconds = 300
): Promise<string[]> {
  const prefix = path.join(outputDir, "chunk_");

  await exec("ffmpeg", [
    "-i", inputPath,
    "-f", "segment",
    "-segment_time", String(segmentSeconds),
    "-acodec", "pcm_s16le",
    "-ar", "16000",
    "-ac", "1",
    "-y",
    `${prefix}%03d.wav`,
  ]);

  const chunks = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith("chunk_") && f.endsWith(".wav"))
    .sort()
    .map((f) => path.join(outputDir, f));

  return chunks;
}

export async function getAudioDuration(inputPath: string): Promise<string> {
  try {
    const { stdout } = await exec("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      inputPath,
    ]);
    const seconds = Math.round(parseFloat(stdout.trim()));
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  } catch {
    return "unknown";
  }
}
