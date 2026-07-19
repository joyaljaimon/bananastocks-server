import express from 'express'
import { getStockData } from '../services/stockService.js'
import { analyzeStock } from '../services/bananaAnalysis.js'
import { generateBananaExplanation } from '../services/bananaGPT.js'

const router = express.Router()

// GET /api/stock/:ticker
router.get('/:ticker', async (req, res) => {
  const { ticker } = req.params

  if (!ticker || ticker.trim().length === 0) {
    return res.status(400).json({ error: 'Ticker is required' })
  }

  try {
    const data = await getStockData(ticker)
    const analysis = analyzeStock(data)

    let banana
    try {
      banana = await generateBananaExplanation(data, analysis)
    } catch (aiError) {
      // If the AI fails, we still return real data + score —
      // just without the fun narrative. The app should never fully break
      // because of an AI hiccup.
      console.error('BananaGPT error:', aiError.message)
      banana = {
        narrative:
          'Our banana translator monkey is napping right now, but the numbers below are real.',
        monkeyVerdict: 'Check the stats below for the full picture.',
      }
    }

    res.json({ ...data, analysis, banana })
  } catch (error) {
    console.error('Error fetching stock data:', error.message)
    res.status(500).json({
      error: 'Failed to fetch stock data',
      details: error.message,
    })
  }
})

export default router