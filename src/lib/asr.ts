import fs from "fs";

export async function transcribeAudio(audioPath: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("No DASHSCOPE_API_KEY configured");

  const audioData = fs.readFileSync(audioPath);
  const base64Audio = audioData.toString("base64");
  const ext = audioPath.split(".").pop()?.toLowerCase() || "wav";

  const formatMap: Record<string, string> = {
    wav: "wav",
    mp3: "mp3",
    m4a: "m4a",
    flac: "flac",
    ogg: "ogg",
  };

  const res = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-audio-turbo",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: `data:audio/${formatMap[ext] || "wav"};base64,${base64Audio}`,
                },
              },
              {
                type: "text",
                text: "请将这段音频完整转录为文字。保留所有说话人的区分（如果能识别的话用【说话人A】【说话人B】等标记）。输出纯文本，不要加额外解释。",
              },
            ],
          },
        ],
        max_tokens: 8192,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ASR error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export async function transcribeAudioChunked(
  chunkPaths: string[]
): Promise<string> {
  const transcripts = await Promise.all(
    chunkPaths.map((p) => transcribeAudio(p))
  );
  return transcripts.join("\n\n");
}
