const BASE_URL = 'https://financialmodelingprep.com/stable'

/**
 * Safely fetches and parses JSON. If FMP returns plain text (e.g. a
 * "Premium Query Parameter" message instead of real data), this throws
 * a clean, readable error instead of crashing on JSON.parse.
 */
async function safeFetchJson(url, context) {
  const res = await fetch(url)
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      `FMP returned a non-JSON response for ${context}: "${text.slice(0, 100)}"`
    )
  }
}

export async function getStockData(ticker) {
  const apiKey = process.env.FMP_API_KEY

  if (!apiKey) {
    throw new Error('FMP_API_KEY is not set in environment variables')
  }

  const symbol = ticker.toUpperCase()

  const profileData = await safeFetchJson(
    `${BASE_URL}/profile?symbol=${symbol}&apikey=${apiKey}`,
    'profile'
  )

  if (!profileData || profileData.length === 0) {
    throw new Error(`No data found for ticker "${symbol}"`)
  }

  const profile = profileData[0]

  const ratiosData = await safeFetchJson(
    `${BASE_URL}/ratios?symbol=${symbol}&apikey=${apiKey}&limit=1`,
    'ratios'
  )
  const ratios = ratiosData?.[0] || {}

  const incomeData = await safeFetchJson(
    `${BASE_URL}/income-statement?symbol=${symbol}&apikey=${apiKey}&limit=2`,
    'income statement'
  )
  const latestIncome = incomeData?.[0] || {}
  const priorIncome = incomeData?.[1] || {}

  let revenueGrowthPct = null
  if (latestIncome.revenue && priorIncome.revenue) {
    revenueGrowthPct =
      (latestIncome.revenue - priorIncome.revenue) / priorIncome.revenue
  }

  return {
    symbol: profile.symbol,
    companyName: profile.companyName,
    price: profile.price,
    marketCap: profile.marketCap,
    industry: profile.industry,
    revenue: latestIncome.revenue ?? null,
    grossProfit: latestIncome.grossProfit ?? null,
    netIncome: latestIncome.netIncome ?? null,
    revenueGrowthPct,
    grossMarginPct: ratios.grossProfitMargin ?? null,
    netMarginPct: ratios.netProfitMargin ?? null,
    debtToEquity: ratios.debtToEquityRatio ?? null,
    currentRatio: ratios.currentRatio ?? null,
    peRatio: ratios.priceToEarningsRatio ?? null,
    priceToBook: ratios.priceToBookRatio ?? null,
  }
}