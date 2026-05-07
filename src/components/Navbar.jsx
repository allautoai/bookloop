import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Search, ShoppingBag, User, LogOut, Plus, ChevronDown, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const { cart } = useCart()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <nav className="bg-[#1A2332] text-white py-4 px-6 md:px-12 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="text-[#3B82F6] h-8 w-8 group-hover:rotate-12 transition-transform" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            BookLoop
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl flex items-center bg-[#2A364B] rounded-full px-4 py-2 ring-1 ring-white/10 focus-within:ring-[#3B82F6]">
          <Search className="text-gray-400 h-5 w-5 mr-2" />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-gray-200 placeholder-gray-500"
          />
        </form>

        {/* Actions */}
        <div className="flex items-center justify-between md:justify-end gap-6 text-gray-300">
          <Link to="/books" className="hover:text-white font-medium text-sm transition-colors">Catalog</Link>
          
          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <Link to="/publish" className="hidden md:flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all">
              <Plus className="w-4 h-4" />
              Publish
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="hover:text-[#3B82F6] transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-xs">
                    {user.email[0].toUpperCase()}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2A364B] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link 
                      to="/profile?tab=books" 
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <BookOpen className="w-4 h-4" />
                      My Books
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout()
                        setIsDropdownOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 hover:text-[#3B82F6] transition-colors">
                <User className="h-5 w-5" />
                <span className="text-sm font-medium">Log in</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  )
}
