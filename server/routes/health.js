import express from 'express'

const router = express.Router()

// GET /api/health
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🍌 BananaStocks server is running',
    timestamp: new Date().toISOString(),
  })
})

export default router