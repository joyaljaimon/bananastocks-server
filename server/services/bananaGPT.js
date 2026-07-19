const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

/**
 * Builds the prompt sent to Gemini. The AI receives ONLY the data we've
 * already calculated — it explains, it doesn't invent.
 */
function buildPrompt(stockData, analysis) {
  return `
You are BananaGPT, a fun financial educator who explains stocks using an
extended metaphor: companies are monkey tribes, revenue/profit are bananas,
market cap is the size of the banana farm, and debt is borrowed bananas.

STRICT RULES:
- Do NOT invent, guess, or restate any numbers that are not given to you below.
- Do NOT add financial claims beyond what the data supports.
- Keep it fun, beginner-friendly, and encouraging — never condescending.
- Keep the narrative to 3-5 short sentences.
- End with one punchy "Monkey Verdict" sentence.

COMPANY: ${stockData.companyName} (${stockData.symbol})
INDUSTRY: ${stockData.industry}

BANANA SCORE: ${analysis.bananaScore}/10

STRENGTHS:
${analysis.strengths.map((s) => `- ${s}`).join('\n') || '- None notable'}

RISKS:
${analysis.risks.map((r) => `- ${r}`).join('\n') || '- None notable'}

Respond in JSON ONLY, with this exact shape and nothing else (no markdown
fences, no preamble):

{
  "narrative": "3-5 sentence banana-themed explanation",
  "monkeyVerdict": "one punchy closing sentence"
}
`.trim()
}

/**
 * Calls Gemini with the constructed prompt and parses the JSON response.
 */
export async function generateBananaExplanation(stockData, analysis) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }

  const prompt = buildPrompt(stockData, analysis)

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('Gemini returned an empty response')
  }

  // Gemini sometimes wraps JSON in markdown fences despite instructions —
  // strip them defensively before parsing.
  const cleaned = rawText.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    throw new Error(`Failed to parse Gemini response as JSON: ${cleaned}`)
  }
}