import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Search, ShoppingBag, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

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
            {/* Cart Icon - V2 feature but keeping UI */}
            <button className="hover:text-[#3B82F6] transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium truncate max-w-[100px] hidden md:inline-block">
                  {user.email.split('@')[0]}
                </span>
                <button onClick={handleLogout} className="hover:text-red-400 transition-colors" title="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
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
