import express from 'express'
import { searchTickers } from '../services/searchService.js'

const router = express.Router()

// GET /api/search/:query
router.get('/:query', async (req, res) => {
  const { query } = req.params

  if (!query || query.trim().length < 1) {
    return res.json([])
  }

  try {
    const results = await searchTickers(query)
    res.json(results)
  } catch (error) {
    console.error('Search error:', error.message)
    res.status(500).json({ error: 'Search failed' })
  }
})

export default router