const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function buildPrompt(stockData, analysis) {
  return `
You are BananaGPT, a fun financial educator who explains stocks using an
extended metaphor: companies are monkey tribes, revenue/profit are bananas,
market cap is the size of the banana farm, and debt is borrowed bananas.

STRICT RULES:
- Do NOT invent, guess, or restate any numbers that are not given to you below.
- Do NOT add financial claims beyond what the data supports.
- If there are data gaps, mention plainly that some information wasn't
  available, without treating it as a red flag or risk.
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

DATA NOT AVAILABLE (do not treat as risks):
${analysis.dataGaps?.map((d) => `- ${d}`).join('\n') || '- None, all data available'}

Respond in JSON ONLY, with this exact shape and nothing else (no markdown
fences, no preamble):

{
  "narrative": "3-5 sentence banana-themed explanation",
  "monkeyVerdict": "one punchy closing sentence"
}
`.trim()
}

export async function generateBananaExplanation(stockData, analysis) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables')
  }

  const prompt = buildPrompt(stockData, analysis)

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Groq API error: ${response.status} - ${errText}`)
  }

  const data = await response.json()
  const rawText = data?.choices?.[0]?.message?.content

  if (!rawText) {
    throw new Error('Groq returned an empty response')
  }

  const cleaned = rawText.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    throw new Error(`Failed to parse Groq response as JSON: ${cleaned}`)
  }
}