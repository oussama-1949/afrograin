import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(err.response?.data || err.message)
    return Promise.reject(err)
  }
)