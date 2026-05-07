import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('bookloop_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('bookloop_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (book) => {
    setCart(prev => {
      if (prev.find(item => item.id === book.id)) return prev
      return [...prev, book]
    })
  }

  const removeFromCart = (bookId) => {
    setCart(prev => prev.filter(item => item.id !== bookId))
  }

  const clearCart = () => setCart([])

  const isInCart = (bookId) => cart.some(item => item.id === bookId)

  const total = cart.reduce((sum, item) => sum + Number(item.preu), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isInCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
