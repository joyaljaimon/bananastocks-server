import express from 'express'
import { getStockData } from '../services/stockService.js'
import { analyzeStock } from '../services/bananaAnalysis.js'

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
    res.json({ ...data, analysis })
  } catch (error) {
    console.error('Error fetching stock data:', error.message)
    res.status(500).json({
      error: 'Failed to fetch stock data',
      details: error.message,
    })
  }
})

export default router