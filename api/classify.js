export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, sys } = req.body;
  const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
  const LLAMA_MODEL   = "Llama-4-Maverick-17B-128E-Instruct-FP8";

  if (!LLAMA_API_KEY) {
    console.error("LLAMA_API_KEY environment variable is not set");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const llamaRes = await fetch("https://api.llama.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user",   content: `Classify this social media post: "${text}"` },
        ],
        max_completion_tokens: 1000,
      }),
    });

    const data = await llamaRes.json();
    console.log("Llama HTTP status:", llamaRes.status);
    console.log("Llama raw response:", JSON.stringify(data));

    // Handle both Llama proprietary format and OpenAI-compatible format
    let rawText;
    if (data.choices?.[0]?.message?.content) {
      rawText = data.choices[0].message.content;
    } else if (data.completion_message?.content?.text) {
      rawText = data.completion_message.content.text;
    } else {
      console.error("Unrecognised response shape:", JSON.stringify(data));
      return res.status(500).json({ error: "Unexpected API response", raw: data });
    }

    const raw = rawText.replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    console.error("Llama classify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
