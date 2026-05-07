import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, User, MessageCircle, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [category, setCategory] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart, isInCart } = useCart()

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch book
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single()
          
        if (bookError) throw bookError
        if (!bookData) {
          navigate('/books')
          return
        }
        
        setBook(bookData)

        // Fetch category
        if (bookData.categoria_id) {
          const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('id', bookData.categoria_id)
            .single()
          
          if (catData) setCategory(catData)
        }

        // Fetch seller
        if (bookData.venedor_id) {
          const { data: sellerData } = await supabase
            .from('users')
            .select('*')
            .eq('id', bookData.venedor_id)
            .single()
          
          if (sellerData) setSeller(sellerData)
        }
        
      } catch (err) {
        console.error('Error fetching book details:', err)
        setError(err.message || 'An error occurred while fetching book details.')
      } finally {
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [id, navigate])

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'nou':
        return <span className="bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-sm font-medium border border-[#10B981]/20">Nou</span>
      case 'com_a_nou':
        return <span className="bg-[#3B82F6]/10 text-[#3B82F6] px-3 py-1 rounded-full text-sm font-medium border border-[#3B82F6]/20">Com a nou</span>
      case 'bon_estat':
        return <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-full text-sm font-medium border border-[#F59E0B]/20">Bon estat</span>
      case 'acceptable':
        return <span className="bg-[#6B7280]/10 text-[#6B7280] px-3 py-1 rounded-full text-sm font-medium border border-[#6B7280]/20">Acceptable</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center max-w-2xl mx-auto">
          <h3 className="font-bold text-lg mb-2">Error loading book details</h3>
          <p>{error}</p>
          <Link to="/books" className="inline-block mt-4 text-[#3B82F6] hover:underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    )
  }

  if (!book) return null

  const formattedPrice = Number(book.preu).toLocaleString('ca-ES', {
    style: 'currency',
    currency: 'EUR'
  })

  const inCart = isInCart(book.id)

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Link to="/books" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Cover Image */}
        <div className="w-full md:w-2/5 shrink-0">
          <div className="bg-[#2A364B] rounded-2xl aspect-[3/4] overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center p-6">
            {book.foto_url ? (
              <img 
                src={book.foto_url} 
                alt={`Cover of ${book.titol}`} 
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-gray-500 font-mono">No Cover Image</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-3/5 flex flex-col">
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {getConditionBadge(book.estat)}
            {category && (
              <span className="bg-[#2A364B] text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-white/10">
                {category.nom}
              </span>
            )}
            <span className="bg-[#2A364B] text-gray-300 px-3 py-1 rounded-full text-sm font-medium border border-white/10 capitalize">
              {book.idioma}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold mb-2 text-white">{book.titol}</h1>
          <p className="text-xl text-[#3B82F6] font-medium mb-6">{book.autor}</p>

          <div className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-6">
            {formattedPrice}
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3">Description</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
              {book.descripcio || 'No description provided by the seller.'}
            </p>
          </div>

          {/* Seller Info Card */}
          {seller && (
             <div className="bg-[#2A364B] rounded-xl p-5 border border-white/5 mb-8">
               <h3 className="text-sm font-bold text-gray-400 capitalize mb-4 uppercase tracking-wider">Seller Information</h3>
               <div className="flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    {seller.avatar_url ? (
                      <img src={seller.avatar_url} alt={seller.nom} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1A2332] flex items-center justify-center">
                        <User className="text-gray-500 w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold">{seller.nom}</h4>
                      <p className="text-sm text-gray-400">{seller.ubicacio || 'Location unavailable'} • ★ {seller.valoracio_mitjana}</p>
                    </div>
                 </div>
                 
                 <button className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                   <MessageCircle className="w-4 h-4" />
                   Contact Seller
                 </button>
               </div>
             </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex gap-4">
             <button 
                onClick={() => !inCart && addToCart(book)}
                disabled={!book.disponible || inCart}
                className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  inCart 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-none' 
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-blue-500/20'
                } disabled:opacity-50`}
             >
               {inCart ? (
                 <>
                   <Check className="w-5 h-5" />
                   In Cart
                 </>
               ) : (
                 <>
                   <ShoppingCart className="w-5 h-5" />
                   Add to Cart
                 </>
               )}
             </button>
             {/* Future feature: Add to Wishlist */}
          </div>

        </div>
      </div>
    </div>
  )
}
