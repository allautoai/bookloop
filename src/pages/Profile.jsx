import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { User, Book, Package, Star, MapPin, Mail, Trash2, Edit2, Loader2, ExternalLink, Camera, X, Check, Truck, MessageSquare } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'info'
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [userProfile, setUserProfile] = useState(null)
  const [myBooks, setMyBooks] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [soldBooksOrders, setSoldBooksOrders] = useState([])
  const [receivedReviews, setReceivedReviews] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      const userId = session.user.id

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      setUserProfile(profile || { id: userId, nom: session.user.email.split('@')[0], email: session.user.email, valoracio_mitjana: 0 })

      // 2. Fetch My Books (published by user)
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('venedor_id', userId)
        .order('created_at', { ascending: false })
      
      setMyBooks(books || [])

      // 3. Fetch Sold Books Orders (where user is the seller)
      // We need to join books to check venedor_id
      const { data: sales, error: salesError } = await supabase
        .from('orders')
        .select('*, books!inner(*), users!comprador_id(nom, email, avatar_url)')
        .eq('books.venedor_id', userId)
        .order('created_at', { ascending: false })
      
      if (salesError) {
        console.error('Sales fetch error:', salesError)
      }
      
      setSoldBooksOrders((sales || []).filter(o => o.books))

      // 4. Fetch My Orders (purchases where user is the buyer)
      const { data: orders } = await supabase
        .from('orders')
        .select('*, books(*, users!venedor_id(nom, email, id))')
        .eq('comprador_id', userId)
        .order('created_at', { ascending: false })
      
      setMyOrders(orders || [])

      // 5. Fetch Received Reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, autor:users!autor_id(nom, avatar_url)')
        .eq('valorat_id', userId)
        .order('created_at', { ascending: false })
      
      setReceivedReviews(reviews || [])

    } catch (err) {
      console.error('Error fetching profile data:', err)
      addToast('Failed to load profile data', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate, addToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return
    
    try {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
      setMyBooks(prev => prev.filter(b => b.id !== id))
      addToast('Book deleted successfully', 'success')
    } catch (err) {
      addToast('Error deleting book: ' + err.message, 'error')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ estat: newStatus, updated_at: new Date() })
        .eq('id', orderId)
      
      if (error) throw error
      
      addToast(`Order marked as ${newStatus}`, 'success')
      fetchData(true)
    } catch (err) {
      addToast('Error updating order: ' + err.message, 'error')
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
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-[calc(100vh-200px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 text-center shadow-xl sticky top-28">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full bg-[#3B82F6] rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-lg border-2 border-white/10">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile?.nom?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-1 -right-1 bg-[#1A2332] border border-white/10 p-2 rounded-full text-gray-400 hover:text-[#3B82F6] transition-colors shadow-lg"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">{userProfile?.nom}</h2>
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-6">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm">{userProfile?.valoracio_mitjana || '0.0'}</span>
              <span className="text-gray-500 text-xs font-normal">({receivedReviews.length} reviews)</span>
            </div>
            
            <div className="flex flex-col gap-2 text-left">
              <button 
                onClick={() => setSearchParams({ tab: 'info' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'info' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium text-sm">Dashboard</span>
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'books' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'books' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <Book className="w-5 h-5" />
                <span className="font-medium text-sm">My Books</span>
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'orders' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <Package className="w-5 h-5" />
                <span className="font-medium text-sm">My Purchases</span>
              </button>
              <button 
                onClick={() => setSearchParams({ tab: 'reviews' })}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reviews' ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium text-sm">Reviews</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          
          {/* Dashboard / Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-8">
              <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Personal Information</h3>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 text-sm font-bold text-[#3B82F6] hover:bg-[#3B82F6]/10 px-4 py-2 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-[#3B82F6]">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Full Name</p>
                        <p className="font-medium">{userProfile?.nom}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 opacity-60">
                      <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-gray-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address (Locked)</p>
                        <p className="font-medium">{userProfile?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-[#3B82F6]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Location</p>
                        <p className="font-medium">{userProfile?.ubicacio || 'Earth'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#1A2332] rounded-lg flex items-center justify-center text-amber-500">
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

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#2A364B] p-6 rounded-3xl border border-white/5 shadow-lg">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Books Listed</p>
                  <p className="text-3xl font-black">{myBooks.length}</p>
                </div>
                <div className="bg-[#2A364B] p-6 rounded-3xl border border-white/5 shadow-lg">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Sales</p>
                  <p className="text-3xl font-black text-emerald-400">
                    {soldBooksOrders.filter(o => o.estat === 'rebut').length}
                  </p>
                </div>
                <div className="bg-[#2A364B] p-6 rounded-3xl border border-white/5 shadow-lg">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Active Orders</p>
                  <p className="text-3xl font-black text-[#3B82F6]">
                    {myOrders.filter(o => o.estat !== 'rebut').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* My Books Tab */}
          {activeTab === 'books' && (
            <div className="space-y-8">
              <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold">My Books Inventory</h3>
                    <p className="text-gray-400 text-sm">Manage your published books and sales</p>
                  </div>
                  <Link to="/publish" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
                    Publish New Book
                  </Link>
                </div>

                {myBooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myBooks.map(book => (
                      <div key={book.id} className="bg-[#1A2332] border border-white/5 p-4 rounded-2xl flex gap-4 items-center group relative">
                        <div className="w-16 h-20 bg-[#2A364B] rounded-lg overflow-hidden shrink-0">
                          {book.foto_url && <img src={book.foto_url} alt={book.titol} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate text-white">{book.titol}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${book.disponible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {book.disponible ? 'Available' : 'Sold'}
                            </span>
                            <span className="text-xs text-[#3B82F6] font-bold">{book.preu}€</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Link 
                            to={`/edit-book/${book.id}`}
                            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-[#1A2332]/50 rounded-2xl border border-dashed border-white/10">
                    <Book className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                    <p className="text-gray-400 mb-6">You haven't published any books yet.</p>
                    <Link to="/publish" className="bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2563EB] transition-all inline-block">
                      Start selling now
                    </Link>
                  </div>
                )}
              </div>

              {/* Sales Orders (For the seller) */}
              <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-400" />
                  Recent Sales & Pending Shipments
                </h3>
                
                {soldBooksOrders.length > 0 ? (
                  <div className="space-y-4">
                    {soldBooksOrders.map(order => (
                      <div key={order.id} className="bg-[#1A2332] border border-white/5 p-5 rounded-2xl">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-xs font-bold text-[#3B82F6] overflow-hidden">
                                {order.users?.avatar_url ? <img src={order.users.avatar_url} className="w-full h-full object-cover" /> : order.users?.nom?.[0]}
                             </div>
                             <div>
                               <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Buyer</p>
                               <p className="text-sm font-bold">{order.users?.nom}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider text-right">Status</p>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                order.estat === 'pendent' ? 'bg-amber-500/20 text-amber-500' : 
                                order.estat === 'enviat' ? 'bg-blue-500/20 text-blue-500' : 
                                'bg-emerald-500/20 text-emerald-500'
                              }`}>
                                {order.estat}
                              </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-14 bg-[#2A364B] rounded overflow-hidden shrink-0">
                            {order.books?.foto_url && <img src={order.books.foto_url} alt={order.books.titol} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate">{order.books?.titol}</h4>
                            <p className="text-xs text-gray-400 truncate">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          
                          {order.estat === 'pendent' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'enviat')}
                              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                              <Truck className="w-3 h-3" />
                              Mark as Shipped
                            </button>
                          )}
                          {order.estat === 'enviat' && (
                            <span className="text-xs text-blue-400 italic font-medium flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              On its way
                            </span>
                          )}
                          {order.estat === 'rebut' && (
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Delivered
                            </span>
                          )}
                        </div>
                        
                        {order.adreca_enviament && (
                           <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-gray-500">
                             <p className="font-bold uppercase tracking-widest text-[9px] mb-1">Shipping Address</p>
                             {order.adreca_enviament}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-[#1A2332]/30 rounded-2xl border border-white/5">
                    <p className="text-gray-500 text-sm italic">No sales recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Orders (Purchases) Tab */}
          {activeTab === 'orders' && (
            <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-8">My Purchases</h3>
              
              {myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.id} className="bg-[#1A2332] border border-white/5 p-5 rounded-2xl">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
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
                          <p className="text-sm text-gray-400">Sold by {order.books?.users?.nom || 'Anonymous'}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-black text-white">{order.preu_total}€</p>
                          
                          {order.estat === 'enviat' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'rebut')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
                            >
                              Confirm Reception
                            </button>
                          )}
                          
                          {order.estat === 'rebut' && (
                            <button 
                              onClick={() => {
                                setSelectedOrderForReview(order)
                                setShowReviewModal(true)
                              }}
                              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Star className="w-3 h-3 text-amber-400" />
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#1A2332]/50 rounded-2xl border border-dashed border-white/10">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-400 mb-6">You haven't bought any books yet.</p>
                  <Link to="/books" className="text-[#3B82F6] font-bold hover:underline">Explore the catalog</Link>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-8">What people say about you</h3>
              
              {receivedReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receivedReviews.map(review => (
                    <div key={review.id} className="bg-[#1A2332] border border-white/5 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center overflow-hidden">
                           {review.autor?.avatar_url ? <img src={review.autor.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{review.autor?.nom || 'Someone'}</p>
                          <div className="flex items-center gap-1">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3 h-3 ${i < review.puntuacio ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />
                             ))}
                          </div>
                        </div>
                        <span className="ml-auto text-[10px] text-gray-500 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{review.comentari}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#1A2332]/50 rounded-2xl border border-dashed border-white/10">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-400">No reviews yet. Complete your first sale to get one!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal 
          user={userProfile} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={(newData) => {
            setUserProfile(prev => ({ ...prev, ...newData }))
            fetchData(true)
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrderForReview && (
        <ReviewModal 
          order={selectedOrderForReview} 
          onClose={() => {
            setShowReviewModal(false)
            setSelectedOrderForReview(null)
          }}
          onSuccess={() => {
            addToast('Review submitted successfully!', 'success')
            fetchData(true)
          }}
        />
      )}
    </div>
  )
}

function EditProfileModal({ user, onClose, onUpdate }) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nom: user.nom || '',
    ubicacio: user.ubicacio || '',
    avatar_url: user.avatar_url || ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || null)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalAvatarUrl = formData.avatar_url

      if (avatarFile) {
        const timestamp = Date.now()
        const fileName = `avatar_${timestamp}_${user.id}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('book-images') // Reusing book-images or use avatars
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(filePath)
        
        finalAvatarUrl = publicUrl
      }

      const { error } = await supabase
        .from('users')
        .update({
          nom: formData.nom,
          ubicacio: formData.ubicacio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date()
        })
        .eq('id', user.id)

      if (error) throw error

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { nom: formData.nom, avatar_url: finalAvatarUrl }
      })

      addToast('Profile updated successfully!', 'success')
      onUpdate({ ...formData, avatar_url: finalAvatarUrl })
      onClose()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#2A364B] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-[#1A2332] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#3B82F6]/50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Change Photo</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                required
                className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Location</label>
              <input 
                type="text" 
                value={formData.ubicacio}
                onChange={(e) => setFormData(prev => ({ ...prev, ubicacio: e.target.value }))}
                placeholder="City, Country"
                className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5">Email (Read Only)</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full bg-[#1A2332]/50 border border-white/5 rounded-xl px-4 py-3 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving Changes...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ReviewModal({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // We review the SELLER
      const { error } = await supabase
        .from('reviews')
        .insert({
          order_id: order.id,
          autor_id: session.user.id,
          valorat_id: order.books.venedor_id,
          puntuacio: rating,
          comentari: comment
        })

      if (error) throw error

      onSuccess()
      onClose()
    } catch (err) {
      addToast('Error submitting review: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#2A364B] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Leave a Review</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
             <div className="w-16 h-20 bg-[#1A2332] rounded overflow-hidden">
                <img src={order.books.foto_url} className="w-full h-full object-cover" />
             </div>
             <div>
               <p className="text-sm font-bold">{order.books.titol}</p>
               <p className="text-xs text-gray-400">Sold by {order.books.users.nom}</p>
             </div>
          </div>

          <div className="flex flex-col items-center">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="hover:scale-125 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Your Experience</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the book? How was the transaction?"
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all resize-none h-32"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
