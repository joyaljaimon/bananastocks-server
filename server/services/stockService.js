const BASE_URL = 'https://finnhub.io/api/v1'

async function safeFetchJson(url, context) {
  const res = await fetch(url)
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      `Finnhub returned a non-JSON response for ${context}: "${text.slice(0, 100)}"`
    )
  }
}

/**
 * Fetches and normalizes core financial data for a given ticker from Finnhub.
 * Combines company profile + real-time quote + basic financials into one
 * clean object matching our existing app-wide data shape.
 */
export async function getStockData(ticker) {
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY is not set in environment variables')
  }

  const symbol = ticker.toUpperCase()

  // Company profile (name, industry, shares outstanding, market cap)
  const profile = await safeFetchJson(
    `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${apiKey}`,
    'profile'
  )

  if (!profile || Object.keys(profile).length === 0) {
    throw new Error(`No data found for ticker "${symbol}"`)
  }

  // Real-time quote (current price)
  const quote = await safeFetchJson(
    `${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`,
    'quote'
  )

  // Basic financials (all the ratios/margins/growth data)
  const financials = await safeFetchJson(
    `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`,
    'basic financials'
  )
  const metric = financials?.metric || {}

  // Finnhub gives per-share revenue (TTM) - multiply by shares outstanding
  // to get a real dollar figure. shareOutstanding is in millions, so we
  // multiply by 1,000,000 to get the raw share count first.
  const sharesOutstanding = (profile.shareOutstanding ?? 0) * 1_000_000
  const revenue =
    metric.revenuePerShareTTM != null
      ? metric.revenuePerShareTTM * sharesOutstanding
      : null

  const grossMarginPct =
    metric.grossMarginTTM != null ? metric.grossMarginTTM / 100 : null
  const netMarginPct =
    metric.netProfitMarginTTM != null ? metric.netProfitMarginTTM / 100 : null
  const revenueGrowthPct =
    metric.revenueGrowthTTMYoy != null ? metric.revenueGrowthTTMYoy / 100 : null

  const grossProfit =
    revenue != null && grossMarginPct != null ? revenue * grossMarginPct : null
  const netIncome =
    revenue != null && netMarginPct != null ? revenue * netMarginPct : null

  return {
    symbol: profile.ticker,
    companyName: profile.name,
    price: quote?.c ?? null,
    marketCap: (profile.marketCapitalization ?? 0) * 1_000_000,
    industry: profile.finnhubIndustry ?? 'N/A',

    revenue,
    grossProfit,
    netIncome,
    revenueGrowthPct,
    grossMarginPct,
    netMarginPct,

    debtToEquity: metric['totalDebt/totalEquityAnnual'] ?? null,
    currentRatio: metric.currentRatioQuarterly ?? null,

    peRatio: metric.peTTM ?? null,
    priceToBook: metric.pb ?? null,
  }
}