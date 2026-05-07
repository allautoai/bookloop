import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function Cart() {
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleRemove = (id) => {
    removeFromCart(id)
    addToast('Item removed from cart', 'info')
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-[#2A364B] rounded-3xl p-12 border border-white/5 shadow-xl">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-extrabold mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-10 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Discover amazing pre-loved books in our catalog.
          </p>
          <Link 
            to="/books" 
            className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <BookOpen className="w-5 h-5" />
            Browse Catalog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">Shopping Cart</h1>
        <button 
          onClick={() => {
            clearCart()
            addToast('Cart cleared', 'info')
          }}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-[#2A364B] rounded-2xl p-4 flex gap-4 border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-[#1A2332]">
                <img src={item.foto_url} alt={item.titol} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1">{item.titol}</h3>
                  <p className="text-sm text-gray-400">{item.autor}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-[#3B82F6]">{Number(item.preu).toFixed(2)}€</span>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/books" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mt-4">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-[#2A364B] rounded-3xl p-6 border border-white/5 shadow-xl sticky top-28">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Items ({cart.length})</span>
                <span>{getCartTotal().toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-black text-white">{getCartTotal().toFixed(2)}€</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Secure Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest font-bold">
              Secure Payments • Money Back Guarantee
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
