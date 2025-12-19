import { create } from 'zustand';

interface UserSession {
  name: string;
  isLoggedIn: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface AppState {
  user: UserSession;
  cart: CartItem[];
  login: (name: string) => void;
  logout: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: { name: '', isLoggedIn: false },
  cart: [],
  login: (name) => set({ user: { name, isLoggedIn: true } }),
  logout: () => set({ user: { name: '', isLoggedIn: false } }),
  addToCart: (item) =>
    set((state) => {
      // Check if item already exists in cart
      const existingItemIndex = state.cart.findIndex((cartItem) => cartItem.id === item.id);

      if (existingItemIndex !== -1) {
        // Item exists, increase quantity
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        };
        return { cart: updatedCart };
      } else {
        // New item, add with quantity 1
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }
    }),
  increaseQuantity: (id) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    })),
  decreaseQuantity: (id) =>
    set((state) => ({
      cart: state.cart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0), // Remove if quantity reaches 0
    })),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ cart: [] }),
}));
