import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import { CheckCircle2, Loader2, CreditCard, Truck } from 'lucide-react'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: ''
  })

  useEffect(() => {
    if (cart.length === 0 && !success) {
      navigate('/cart')
    }
  }, [cart, success, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const compradorId = session.user.id
      const adrecaEnviament = `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.postalCode}`

      // Process each book in the cart
      for (const book of cart) {
        // 1. Create order
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            comprador_id: compradorId,
            book_id: book.id,
            preu_total: book.preu,
            adreca_enviament: adrecaEnviament,
            estat: 'pendent'
          })

        if (orderError) throw orderError

        // 2. Mark book as unavailable
        const { error: bookError } = await supabase
          .from('books')
          .update({ disponible: false })
          .eq('id', book.id)

        if (bookError) throw bookError
      }

      setSuccess(true)
      clearCart()
      
      // Redirect home after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)

    } catch (err) {
      console.error(err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-emerald-500/10 inline-flex p-6 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Comanda realitzada amb èxit!</h1>
        <p className="text-gray-400 mb-2">Thank you for your purchase. We've sent the details to your email.</p>
        <p className="text-[#3B82F6] font-medium animate-pulse">Redirecting to home in 3 seconds...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Shipping Form */}
        <div className="space-y-8">
          <div className="bg-[#2A364B] p-8 rounded-3xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#3B82F6]/10 p-2 rounded-lg">
                <Truck className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h2 className="text-xl font-bold">Shipping Details</h2>
            </div>

            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                  placeholder="Carrer de Mallorca, 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                    placeholder="Barcelona"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
                    placeholder="08001"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-[#2A364B] p-8 rounded-3xl border border-white/5 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#3B82F6]/10 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-gray-400">
              Cash on delivery / Direct seller transfer
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-[#2A364B] border border-white/5 p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-6">Review Items</h3>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{item.titol}</p>
                    <p className="text-sm text-gray-400 truncate">{item.autor}</p>
                  </div>
                  <span className="font-bold text-[#3B82F6] ml-4 shrink-0">
                    {Number(item.preu).toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{total.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between font-bold text-2xl">
                <span>Total</span>
                <span className="text-white">{total.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing Order...
                </>
              ) : 'Place Order Now'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
