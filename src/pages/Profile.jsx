import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, Book, Package, Star, MapPin, Mail, Trash2, Edit2, Loader2, ChevronRight, ExternalLink } from 'lucide-react'

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'info'
  const navigate = useNavigate()

  const [userProfile, setUserProfile] = useState(null)
  const [myBooks, setMyBooks] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUserProfile(profile || { nom: session.user.email.split('@')[0], email: session.user.email })

        // 2. Fetch My Books
        const { data: books } = await supabase
          .from('books')
          .select('*')
          .eq('venedor_id', session.user.id)
          .order('created_at', { ascending: false })
        
        setMyBooks(books || [])

        // 3. Fetch My Orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*, books(*)')
          .eq('comprador_id', session.user.id)
          .order('created_at', { ascending: false })
        
        setMyOrders(orders || [])

      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return
    
    try {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
      setMyBooks(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      alert('Error deleting book: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 text-center shadow-xl">
            <div className="w-24 h-24 bg-[#3B82F6] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white">
              {userProfile?.nom?.[0]?.toUpperCase() || '?'}
            </div>
            <h2 className="text-xl font-bold">{userProfile?.nom}</h2>
            <p className="text-gray-400 text-sm mb-6">{userProfile?.email}</p>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSearchParams({ tab: 'info' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'info' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <User className="w-5 h-5" />
                <span>Personal Info</span>
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'books' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'books' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <Book className="w-5 h-5" />
                <span>My Books</span>
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'orders' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <Package className="w-5 h-5" />
                <span>My Orders</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          
          {activeTab === 'info' && (
            <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-8">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-[#3B82F6]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Full Name</p>
                      <p className="font-medium">{userProfile?.nom}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-[#3B82F6]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="font-medium">{userProfile?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-[#3B82F6]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Location</p>
                      <p className="font-medium">{userProfile?.ubicacio || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-[#3B82F6]">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Average Rating</p>
                      <p className="font-medium">★ {userProfile?.valoracio_mitjana || '0.0'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">My Published Books</h3>
                <Link to="/publish" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                  Publish New
                </Link>
              </div>

              {myBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myBooks.map(book => (
                    <div key={book.id} className="bg-[#1A2332] border border-white/5 p-4 rounded-2xl flex gap-4 items-center group">
                      <div className="w-16 h-20 bg-[#2A364B] rounded-lg overflow-hidden shrink-0">
                        {book.foto_url && <img src={book.foto_url} alt={book.titol} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{book.titol}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${book.disponible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {book.disponible ? 'Available' : 'Sold'}
                          </span>
                          <span className="text-xs text-[#3B82F6] font-bold">{book.preu}€</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-6">You haven't published any books yet.</p>
                  <Link to="/publish" className="text-[#3B82F6] font-bold hover:underline">Start selling now</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-8">My Orders</h3>
              
              {myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.id} className="bg-[#1A2332] border border-white/5 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order #{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            order.estat === 'pendent' ? 'bg-amber-500/20 text-amber-500' : 
                            order.estat === 'enviat' ? 'bg-blue-500/20 text-blue-500' : 
                            'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {order.estat}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-16 bg-[#2A364B] rounded overflow-hidden shrink-0">
                          {order.books?.foto_url && <img src={order.books.foto_url} alt={order.books.titol} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{order.books?.titol || 'Unknown Book'}</h4>
                          <p className="text-sm text-gray-400 truncate">{order.books?.autor}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{order.preu_total}€</p>
                          <Link to={`/books/${order.book_id}`} className="text-xs text-[#3B82F6] flex items-center gap-1 hover:underline mt-1">
                            Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-6">You haven't made any orders yet.</p>
                  <Link to="/books" className="text-[#3B82F6] font-bold hover:underline">Browse the catalog</Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
