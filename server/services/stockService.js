const BASE_URL = 'https://financialmodelingprep.com/stable'

/**
 * Fetches and normalizes core financial data for a given ticker.
 * Combines company profile + financial ratios + income statement into one clean object.
 */
export async function getStockData(ticker) {
  const apiKey = process.env.FMP_API_KEY

  if (!apiKey) {
    throw new Error('FMP_API_KEY is not set in environment variables')
  }

  const symbol = ticker.toUpperCase()

  // Fetch company profile (name, price, market cap, etc.)
  const profileRes = await fetch(
    `${BASE_URL}/profile?symbol=${symbol}&apikey=${apiKey}`
  )
  const profileData = await profileRes.json()

  if (!profileData || profileData.length === 0) {
    throw new Error(`No data found for ticker "${symbol}"`)
  }

  const profile = profileData[0]

  // Fetch key financial ratios (P/E, margins, debt ratios)
  const ratiosRes = await fetch(
    `${BASE_URL}/ratios?symbol=${symbol}&apikey=${apiKey}&limit=1`
  )
  const ratiosData = await ratiosRes.json()
  const ratios = ratiosData?.[0] || {}

  // Fetch income statement (revenue, gross profit, net income) - last 2 years for growth calc
  const incomeRes = await fetch(
    `${BASE_URL}/income-statement?symbol=${symbol}&apikey=${apiKey}&limit=2`
  )
  const incomeData = await incomeRes.json()
  const latestIncome = incomeData?.[0] || {}
  const priorIncome = incomeData?.[1] || {}

  // Calculate year-over-year revenue growth, if we have two years of data
  let revenueGrowthPct = null
  if (latestIncome.revenue && priorIncome.revenue) {
    revenueGrowthPct =
      (latestIncome.revenue - priorIncome.revenue) / priorIncome.revenue
  }

  // Normalize into a clean, predictable shape for the rest of the app
  return {
    symbol: profile.symbol,
    companyName: profile.companyName,
    price: profile.price,
    marketCap: profile.marketCap,
    industry: profile.industry,

    // Growth & profitability
    revenue: latestIncome.revenue ?? null,
    grossProfit: latestIncome.grossProfit ?? null,
    netIncome: latestIncome.netIncome ?? null,
    revenueGrowthPct,
    grossMarginPct: ratios.grossProfitMargin ?? null,
    netMarginPct: ratios.netProfitMargin ?? null,

    // Debt & cash
    debtToEquity: ratios.debtToEquityRatio ?? null,
    currentRatio: ratios.currentRatio ?? null,

    // Valuation
    peRatio: ratios.priceToEarningsRatio ?? null,
    priceToBook: ratios.priceToBookRatio ?? null,
  }
}