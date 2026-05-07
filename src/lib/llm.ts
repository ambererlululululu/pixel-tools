export function sanitizeJsonResponse(text: string): string {
  let s = text.trim();
  s = s.replace(/```(?:json)?\s*\n?/g, "").trim();
  s = s.replace(/“/g, "'").replace(/”/g, "'");
  s = s.replace(/‘/g, "'").replace(/’/g, "'");
  const m = s.match(/\{[\s\S]*\}/);
  return m ? m[0] : s;
}

export async function callLLM(
  prompt: string,
  maxTokens = 4096,
  modelOverride?: string
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("No DASHSCOPE_API_KEY configured");

  const model =
    modelOverride || process.env.DASHSCOPE_MODEL || "qwen-plus";

  const res = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DashScope error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
