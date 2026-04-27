import { createClient } from "@supabase/supabase-js";

const LLAMA_MODEL = "Llama-4-Maverick-17B-128E-Instruct-FP8";

const SYS = `You are HateGuard-7B, a BERT-based text classifier fine-tuned on the Davidson et al. (2017) hate speech detection dataset (24,783 annotated social media posts, ICWSM 2017). Replicate the inference behavior of that trained model.

Davidson (2017) three-class schema:
• 0 = hate_speech — Attacks/dehumanizes individuals or groups based on a PROTECTED CHARACTERISTIC: race, ethnicity, national origin, religion, gender, sexual orientation, disability.
• 1 = offensive_language — Vulgar, insulting, or profane content NOT targeting a protected characteristic. Generic insults, crude humor, strong language.
• 2 = neither — Neutral, informational, positive, or benign content.

Rules: Protected characteristic targeting REQUIRED for class 0. Generic insults = class 1. Criticism without dehumanization = class 2. High confidence (>0.90) for clear cases, moderate (0.70-0.89) for ambiguous.

Respond ONLY with JSON (no markdown, no extra text):
{"class_id":<0|1|2>,"class_label":"<hate_speech|offensive_language|neither>","confidence":<float>,"reasoning":"<one sentence citing Davidson criteria>"}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, post_id } = req.body;
  const LLAMA_API_KEY = process.env.LLAMA_API_KEY;

  if (!LLAMA_API_KEY) {
    console.error("LLAMA_API_KEY not set");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // 1. Call Llama API
    const llamaRes = await fetch("https://api.llama.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        messages: [
          { role: "system", content: SYS },
          { role: "user",   content: `Classify this social media post: "${text}"` },
        ],
        max_completion_tokens: 1000,
      }),
    });

    const data = await llamaRes.json();
    console.log("Llama status:", llamaRes.status);
    console.log("Llama response:", JSON.stringify(data));

    // Parse response — handle both Llama response shapes
    let rawText;
    if (data.completion_message?.content?.text) {
      rawText = data.completion_message.content.text;
    } else if (data.choices?.[0]?.message?.content) {
      rawText = data.choices[0].message.content;
    } else {
      console.error("Unexpected Llama response shape:", JSON.stringify(data));
      return res.status(500).json({ error: "Unexpected API response" });
    }

    const result = JSON.parse(rawText.replace(/```json|```/g, "").trim());

    // 2. Write classification to Supabase (only when post_id is provided)
    if (post_id) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabase.from("classifications").insert({
        post_id,
        class_id:    result.class_id,
        class_label: result.class_label,
        confidence:  result.confidence,
        reasoning:   result.reasoning,
      });

      // Auto-flag post if hate speech
      if (result.class_id === 0) {
        await supabase.from("posts").update({ is_flagged: true }).eq("id", post_id);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("classify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
