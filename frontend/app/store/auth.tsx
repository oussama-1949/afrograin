import { create } from 'zustand'

type User = {
  id: string
  name: string
  email: string
}

type AuthState = {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))