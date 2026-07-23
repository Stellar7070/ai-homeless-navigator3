// Netlify Function: /.netlify/functions/chat
// Keeps the Anthropic API key on the server — never expose it in client-side code.
// Set ANTHROPIC_API_KEY in Site Settings → Environment Variables in the Netlify dashboard.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY" }) };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || "{}");
    messages = body.messages;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "messages array is required" }) };
  }

  const systemPrompt =
    "You are a calm, practical assistant inside the AI Homeless Navigator app, helping people who may be experiencing homelessness, crisis, or housing instability in the US. Speak in plain, warm, respectful language, short sentences, no jargon. Give concrete, step-by-step next actions (what to do first, what to bring, typical hours). Never diagnose or make legal/medical determinations. If someone describes immediate danger, self-harm risk, or a medical emergency, gently but clearly tell them to call 911 or 988 right away, in addition to anything else you say. This app does not yet have live location data, so when location matters, describe the general type of place to look for (e.g. 'a HUD-funded emergency shelter' or 'your county's SNAP office') rather than inventing a specific name or address.";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.error?.message || "Upstream API error" }),
      };
    }

    const reply =
      (data.content || [])
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n") || "I couldn't quite process that — could you tell me a bit more about what you need?";

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error("Chat function error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong reaching the assistant." }) };
  }
};
