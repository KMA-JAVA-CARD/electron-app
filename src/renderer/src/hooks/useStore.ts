import { create } from 'zustand'

interface UserSession {
  name: string
  isLoggedIn: boolean
}

interface CartItem {
  id: string
  name: string
  price: number
}

interface AppState {
  user: UserSession
  cart: CartItem[]
  login: (name: string) => void
  logout: () => void
  addToCart: (item: CartItem) => void
  clearCart: () => void
}

export const useStore = create<AppState>((set) => ({
  user: { name: '', isLoggedIn: false },
  cart: [],
  login: (name) => set({ user: { name, isLoggedIn: true } }),
  logout: () => set({ user: { name: '', isLoggedIn: false } }),
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  clearCart: () => set({ cart: [] })
}))
