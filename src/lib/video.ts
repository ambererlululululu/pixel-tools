import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const exec = promisify(execFile);

export async function downloadAudio(
  url: string,
  outputDir: string
): Promise<string> {
  const outputTemplate = path.join(outputDir, "download.%(ext)s");

  await exec("yt-dlp", [
    "--extract-audio",
    "--audio-format", "wav",
    "--audio-quality", "0",
    "-o", outputTemplate,
    "--no-playlist",
    url,
  ], { timeout: 300000 });

  const outputPath = path.join(outputDir, "download.wav");
  return outputPath;
}

export async function getVideoTitle(url: string): Promise<string> {
  try {
    const { stdout } = await exec("yt-dlp", [
      "--get-title",
      "--no-playlist",
      url,
    ], { timeout: 30000 });
    return stdout.trim();
  } catch {
    return "";
  }
}
