import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { CreditCard, Truck, ShieldCheck, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [address, setAddress] = useState('')

  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const userId = session.user.id

      for (const item of cart) {
        // 1. Create order
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            comprador_id: userId,
            book_id: item.id,
            preu_total: item.preu,
            adreca_enviament: address,
            estat: 'pendent'
          })

        if (orderError) throw orderError

        // 2. Mark book as sold
        const { error: bookError } = await supabase
          .from('books')
          .update({ disponible: false })
          .eq('id', item.id)

        if (bookError) throw bookError
      }

      setSuccess(true)
      addToast('Order placed successfully!', 'success')
      clearCart()
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (err) {
      console.error(err)
      addToast(err.message || 'Error processing your order.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="bg-[#2A364B] rounded-3xl p-12 border border-white/5 shadow-2xl flex flex-col items-center">
          <div className="bg-emerald-500/20 p-6 rounded-full mb-8">
            <CheckCircle className="w-20 h-20 text-emerald-500 animate-bounce" />
          </div>
          <h1 className="text-4xl font-black mb-4">Thank you for your purchase!</h1>
          <p className="text-gray-400 mb-8">
            Your order has been placed successfully. You will be redirected to the home page in a few seconds...
          </p>
          <Link to="/" className="text-[#3B82F6] font-bold hover:underline">
            Go to Home now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen">
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Checkout Form */}
        <div className="space-y-8">
          <h1 className="text-3xl font-extrabold">Checkout</h1>
          
          <form onSubmit={handleCheckout} id="checkout-form" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#3B82F6]" />
                Shipping Information
              </h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Delivery Address</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, number, apartment, city, zip code..."
                  rows="3"
                  className="w-full bg-[#2A364B] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                Payment Method
              </h2>
              <div className="bg-[#2A364B] border border-[#3B82F6] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="font-bold">BookLoop Pay</p>
                    <p className="text-xs text-gray-400">Secure and fast transaction</p>
                  </div>
                </div>
                <div className="bg-[#3B82F6] h-5 w-5 rounded-full flex items-center justify-center">
                  <div className="bg-white h-2 w-2 rounded-full" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-[#2A364B] rounded-3xl p-8 border border-white/5 h-fit shadow-xl">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 truncate max-w-[150px]">{item.titol}</span>
                <span className="font-bold">{item.preu}€</span>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Subtotal</span>
              <span>{getCartTotal().toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Shipping</span>
              <span className="text-emerald-400">Free</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4">
              <span>Total</span>
              <span className="text-[#3B82F6]">{getCartTotal().toFixed(2)}€</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-8"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Processing Order...' : `Pay ${getCartTotal().toFixed(2)}€`}
          </button>
        </div>

      </div>
    </div>
  )
}
