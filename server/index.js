import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthRoute from './routes/health.js'
import stockRoute from './routes/stock.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/health', healthRoute)
app.use('/api/stock', stockRoute)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🍌 BananaStocks server running on http://localhost:${PORT}`)
})