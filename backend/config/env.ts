// backend/config/env.ts
import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/afrograin',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLOUDINARY_CLOUD_NAME: 'dlbmowx0z',
  CLOUDINARY_API_KEY: '679825967588948',
  CLOUDINARY_API_SECRET: 'ONY7VQs3wLma0LA4-aEuAd9_Z7M',
  EMAIL_FROM: process.env.EMAIL_FROM || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
}