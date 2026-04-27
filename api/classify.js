export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, sys } = req.body;
  const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
  const LLAMA_MODEL   = "Llama-4-Maverick-17B-128E-Instruct-FP8";

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
    const raw  = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(raw));
  } catch (err) {
    console.error("Llama classify error:", err);
    return res.status(500).json({ error: "Classification failed" });
  }
}
