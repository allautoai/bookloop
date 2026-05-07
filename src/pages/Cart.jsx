import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Cart() {
  const { cart, removeFromCart, total } = useCart()
  const navigate = useNavigate()

  const formattedTotal = total.toLocaleString('ca-ES', {
    style: 'currency',
    currency: 'EUR'
  })

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-[#2A364B] inline-flex p-6 rounded-full mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added any books to your cart yet. Explore our catalog to find your next favorite read!
        </p>
        <Link 
          to="/books" 
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-2"
        >
          Explore Catalog
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-8">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-[#2A364B] border border-white/5 p-4 rounded-2xl flex gap-4 items-center">
              <div className="w-20 h-28 bg-[#1A2332] rounded-lg overflow-hidden shrink-0">
                {item.foto_url ? (
                  <img src={item.foto_url} alt={item.titol} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{item.titol}</h3>
                <p className="text-sm text-gray-400 truncate">{item.autor}</p>
                <div className="mt-2 font-bold text-[#3B82F6]">
                  {Number(item.preu).toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#2A364B] border border-white/5 p-6 rounded-2xl sticky top-24 shadow-xl">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Books ({cart.length})</span>
                <span>{formattedTotal}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              Checkout Now
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
              Secure payment via BookLoop Pay
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
