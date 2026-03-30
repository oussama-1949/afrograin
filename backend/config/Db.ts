import mongoose from 'mongoose'
import { env } from './env'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 3000

let retries = 0

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })

    retries = 0
    console.log(`✅ MongoDB connected: ${env.MONGO_URI}`)
  } catch (error) {
    retries++
    console.error(`❌ MongoDB connection failed (attempt ${retries}/${MAX_RETRIES})`)

    if (retries >= MAX_RETRIES) {
      console.error('💀 Max retries reached. Exiting process.')
      process.exit(1)
    }

    console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`)
    setTimeout(connectDB, RETRY_DELAY_MS)
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...')
  connectDB()
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message)
})