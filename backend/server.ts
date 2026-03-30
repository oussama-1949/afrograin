import 'dotenv/config'
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { connectDB } from './config/Db'
import authRoutes from './routes/Auth'
import categoryRoutes from './routes/Categories'
import productRoutes from './routes/Products'
import cartRoutes from './routes/Cart'
import orderRoutes from './routes/Orders'
import userRoutes from './routes/Users'
import { errorHandler } from './middlewares/ErrorHandler'
import { apiLimiter, authLimiter } from './middlewares/Ratelimiter'

const app: Application = express()

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Afrograin API is running',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes) // Phase 5
app.use('/api/users', userRoutes)   // Phase 6

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// ─── Error Handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Boot ─────────────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  })
}

start()

export default app