import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BookCard from '../components/BookCard'

const categories = [
  { name: 'Fiction', icon: '✨' },
  { name: 'Sci-Fi', icon: '🚀' },
  { name: 'Textbooks', icon: '📚' },
  { name: 'Children', icon: '🧸' },
  { name: 'Poetry', icon: '🖋️' },
  { name: 'History', icon: '🏛️' }
]

export default function Home() {
  const [recentBooks, setRecentBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('disponible', true)
          .order('created_at', { ascending: false })
          .limit(8)
        
        if (error) throw error
        if (data) setRecentBooks(data)
      } catch (err) {
        console.error('Error fetching books:', err)
        setError(err.message || 'An error occurred while fetching books.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentBooks()
  }, [])

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3B82F6]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#3B82F6] font-medium mb-8">
            <BookOpen className="w-4 h-4" />
            V2 Marketplace is Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Give books a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              second life
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover a curated selection of pre-loved books. From fiction to textbooks, find your next great read while supporting a circular economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/books')}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
            >
              Explore Catalog
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/publish')}
              className="bg-[#2A364B] hover:bg-[#34425A] text-white px-8 py-4 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center"
            >
              Start Selling
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button 
              key={cat.name}
              onClick={() => navigate(`/books?categoryName=${cat.name}`)}
              className="bg-[#2A364B] hover:bg-[#3B82F6] hover:text-white group border border-white/5 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Books */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recently Added</h2>
          <Link to="/books" className="text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1 group">
            View all 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="animate-pulse bg-[#2A364B] rounded-xl aspect-[3/4]"></div>
             ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-2xl text-center">
            <h3 className="font-bold text-lg mb-2">Error loading books</h3>
            <p>{error}</p>
          </div>
        ) : recentBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recentBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#2A364B]/50 rounded-2xl border border-white/5">
            <p className="text-gray-400">No books found in the database. Please run the seed script.</p>
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/publish')}
        className="fixed bottom-8 right-8 bg-[#3B82F6] hover:bg-[#2563EB] text-white p-4 rounded-full shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all z-40 group"
        title="Publish a book"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  )
}
