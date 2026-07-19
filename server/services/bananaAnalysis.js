function scoreGrowth(revenueGrowthPct) {
  if (revenueGrowthPct === null)
    return { points: 1, label: 'Growth data unavailable', available: false }
  if (revenueGrowthPct >= 0.15)
    return { points: 2, label: 'Strong banana harvest growth', available: true }
  if (revenueGrowthPct >= 0.05)
    return { points: 1.5, label: 'Steady banana harvest growth', available: true }
  if (revenueGrowthPct >= 0)
    return { points: 1, label: 'Slow but positive harvest growth', available: true }
  return { points: 0, label: 'Banana harvest is shrinking', available: true }
}

function scoreProfitability(netMarginPct) {
  if (netMarginPct === null)
    return { points: 1, label: 'Profitability data unavailable', available: false }
  if (netMarginPct >= 0.2)
    return { points: 2, label: 'Tribe keeps most bananas it harvests', available: true }
  if (netMarginPct >= 0.1)
    return { points: 1.5, label: 'Tribe keeps a healthy share of bananas', available: true }
  if (netMarginPct >= 0)
    return { points: 1, label: 'Tribe keeps only a few bananas after costs', available: true }
  return { points: 0, label: 'Tribe is losing bananas overall', available: true }
}

function scoreDebt(debtToEquity) {
  if (debtToEquity === null)
    return { points: 1, label: 'Debt data unavailable', available: false }
  if (debtToEquity <= 0.5)
    return { points: 2, label: 'Storage cave built with little borrowing', available: true }
  if (debtToEquity <= 1.5)
    return { points: 1.5, label: 'Manageable amount of borrowed bananas', available: true }
  if (debtToEquity <= 2.5)
    return { points: 1, label: 'Tribe borrowed a lot of bananas', available: true }
  return { points: 0, label: 'Tribe borrowed far too many bananas', available: true }
}

function scoreLiquidity(currentRatio) {
  if (currentRatio === null)
    return { points: 1, label: 'Liquidity data unavailable', available: false }
  if (currentRatio >= 1.5)
    return { points: 2, label: 'Plenty of bananas in short-term storage', available: true }
  if (currentRatio >= 1)
    return { points: 1.5, label: 'Enough bananas for near-term needs', available: true }
  if (currentRatio >= 0.75)
    return { points: 1, label: 'Short-term banana storage is a bit thin', available: true }
  return { points: 0, label: 'Tribe may struggle to cover near-term needs', available: true }
}

function scoreValuation(peRatio) {
  if (peRatio === null || peRatio <= 0)
    return { points: 1, label: 'Valuation data unavailable', available: false }
  if (peRatio <= 15)
    return { points: 2, label: 'Bananas are cheap to buy into', available: true }
  if (peRatio <= 25)
    return { points: 1.5, label: 'Bananas are fairly priced', available: true }
  if (peRatio <= 40)
    return { points: 1, label: 'Many monkeys already want this farm, making bananas expensive', available: true }
  return { points: 0, label: 'Bananas are extremely expensive right now', available: true }
}

export function analyzeStock(stockData) {
  const growth = scoreGrowth(stockData.revenueGrowthPct)
  const profitability = scoreProfitability(stockData.netMarginPct)
  const debt = scoreDebt(stockData.debtToEquity)
  const liquidity = scoreLiquidity(stockData.currentRatio)
  const valuation = scoreValuation(stockData.peRatio)

  const subScores = { growth, profitability, debt, liquidity, valuation }
  const allScores = Object.values(subScores)

  const totalPoints = allScores.reduce((sum, s) => sum + s.points, 0)
  const bananaScore = Math.round(totalPoints * 10) / 10

  // Only categorize AVAILABLE data as a strength or risk.
  // Unavailable data is neither - it's just missing, not good or bad.
  const strengths = allScores
    .filter((s) => s.available && s.points >= 1.5)
    .map((s) => s.label)

  const risks = allScores
    .filter((s) => s.available && s.points <= 1)
    .map((s) => s.label)

  const dataGaps = allScores
    .filter((s) => !s.available)
    .map((s) => s.label)

  return {
    bananaScore,
    subScores,
    strengths,
    risks,
    dataGaps, // new: separate list for "we just don't know this"
  }
}