const BASE_URL = 'https://finnhub.io/api/v1'

export async function searchTickers(query) {
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY is not set in environment variables')
  }

  const res = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}&token=${apiKey}`
  )
  const text = await res.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Finnhub search returned non-JSON: "${text.slice(0, 100)}"`)
  }

  const results = data?.result || []

  // Keep only common stocks, skip warrants/bonds/other noise, cap at 8 results
  return results
    .filter((r) => r.type === 'Common Stock')
    .slice(0, 8)
    .map((r) => ({
      symbol: r.symbol,
      name: r.description,
    }))
}