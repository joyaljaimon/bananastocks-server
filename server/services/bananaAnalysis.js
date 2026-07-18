/**
 * Scores a single metric on a 0-2 scale based on thresholds.
 * Returns { points, label } so we can both sum a total score
 * and explain *why* points were awarded or lost.
 */
function scoreGrowth(revenueGrowthPct) {
  if (revenueGrowthPct === null) return { points: 1, label: 'Growth data unavailable' }
  if (revenueGrowthPct >= 0.15) return { points: 2, label: 'Strong banana harvest growth' }
  if (revenueGrowthPct >= 0.05) return { points: 1.5, label: 'Steady banana harvest growth' }
  if (revenueGrowthPct >= 0) return { points: 1, label: 'Slow but positive harvest growth' }
  return { points: 0, label: 'Banana harvest is shrinking' }
}

function scoreProfitability(netMarginPct) {
  if (netMarginPct === null) return { points: 1, label: 'Profitability data unavailable' }
  if (netMarginPct >= 0.2) return { points: 2, label: 'Tribe keeps most bananas it harvests' }
  if (netMarginPct >= 0.1) return { points: 1.5, label: 'Tribe keeps a healthy share of bananas' }
  if (netMarginPct >= 0) return { points: 1, label: 'Tribe keeps only a few bananas after costs' }
  return { points: 0, label: 'Tribe is losing bananas overall' }
}

function scoreDebt(debtToEquity) {
  if (debtToEquity === null) return { points: 1, label: 'Debt data unavailable' }
  if (debtToEquity <= 0.5) return { points: 2, label: 'Storage cave built with little borrowing' }
  if (debtToEquity <= 1.5) return { points: 1.5, label: 'Manageable amount of borrowed bananas' }
  if (debtToEquity <= 2.5) return { points: 1, label: 'Tribe borrowed a lot of bananas' }
  return { points: 0, label: 'Tribe borrowed far too many bananas' }
}

function scoreLiquidity(currentRatio) {
  if (currentRatio === null) return { points: 1, label: 'Liquidity data unavailable' }
  if (currentRatio >= 1.5) return { points: 2, label: 'Plenty of bananas in short-term storage' }
  if (currentRatio >= 1) return { points: 1.5, label: 'Enough bananas for near-term needs' }
  if (currentRatio >= 0.75) return { points: 1, label: 'Short-term banana storage is a bit thin' }
  return { points: 0, label: 'Tribe may struggle to cover near-term needs' }
}

function scoreValuation(peRatio) {
  if (peRatio === null || peRatio <= 0) return { points: 1, label: 'Valuation data unavailable' }
  if (peRatio <= 15) return { points: 2, label: 'Bananas are cheap to buy into' }
  if (peRatio <= 25) return { points: 1.5, label: 'Bananas are fairly priced' }
  if (peRatio <= 40) return { points: 1, label: 'Many monkeys already want this farm, making bananas expensive' }
  return { points: 0, label: 'Bananas are extremely expensive right now' }
}

/**
 * Main entry point: takes normalized stock data, returns a full
 * banana analysis — score, strengths, risks, and the raw sub-scores
 * the AI will use to write the narrative.
 */
export function analyzeStock(stockData) {
  const growth = scoreGrowth(stockData.revenueGrowthPct)
  const profitability = scoreProfitability(stockData.netMarginPct)
  const debt = scoreDebt(stockData.debtToEquity)
  const liquidity = scoreLiquidity(stockData.currentRatio)
  const valuation = scoreValuation(stockData.peRatio)

  const subScores = { growth, profitability, debt, liquidity, valuation }

  // Total possible = 10 (5 categories x 2 points each)
  const totalPoints = Object.values(subScores).reduce((sum, s) => sum + s.points, 0)
  const bananaScore = Math.round(totalPoints * 10) / 10 // round to 1 decimal

  // Strengths = anything scoring 1.5+ ; Risks = anything scoring 1 or below
  const strengths = Object.values(subScores)
    .filter((s) => s.points >= 1.5)
    .map((s) => s.label)

  const risks = Object.values(subScores)
    .filter((s) => s.points <= 1)
    .map((s) => s.label)

  return {
    bananaScore,
    subScores,
    strengths,
    risks,
  }
}