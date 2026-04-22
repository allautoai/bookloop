import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BookCard from '../components/BookCard'
import FilterBar from '../components/FilterBar'
import { Search } from 'lucide-react'

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    condition: '',
    maxPrice: 50,
    search: searchParams.get('search') || ''
  })

  // Watch searchParams for changes from Navbar
  useEffect(() => {
    const search = searchParams.get('search')
    if (search !== null && search !== filters.search) {
      setFilters(prev => ({ ...prev, search }))
    }
  }, [searchParams])

  // Also handle categoryName from home page shortcuts logically
  useEffect(() => {
    const categoryName = searchParams.get('categoryName')
    if (categoryName && categories.length > 0) {
      const cat = categories.find(c => c.nom.toLowerCase() === categoryName.toLowerCase())
      if (cat) {
        setFilters(prev => ({ ...prev, category: cat.id.toString() }))
      }
    }
  }, [searchParams, categories])

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('nom')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // Fetch books when filters change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      
      let query = supabase
        .from('books')
        .select('*')
        .eq('disponible', true)
        
      if (filters.category) {
        query = query.eq('categoria_id', filters.category)
      }
      
      if (filters.language) {
        query = query.eq('idioma', filters.language)
      }
      
      if (filters.condition) {
        query = query.eq('estat', filters.condition)
      }

      if (filters.maxPrice) {
        query = query.lte('preu', filters.maxPrice)
      }

      if (filters.search) {
        // Simple search in V1 matching either titol or autor
        query = query.or(`titol.ilike.%${filters.search}%,autor.ilike.%${filters.search}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (!error && data) {
        setBooks(data)
      }
      setLoading(false)
    }

    // Debounce slightly to avoid slamming Supabase while typing/sliding
    const timer = setTimeout(() => {
      fetchBooks()
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
    // Optionally update URL
    if (e.target.value) {
      setSearchParams({ search: e.target.value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Catalog</h1>
          <p className="text-gray-400">Showing {books.length} available books</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full bg-[#2A364B] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterBar 
            filters={filters} 
            setFilters={setFilters} 
            categories={categories}
          />
        </div>

        {/* Books Grid */}
        <div className="lg:col-span-3">
          {loading ? (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="animate-pulse bg-[#2A364B] rounded-xl aspect-[3/4]"></div>
               ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#2A364B]/50 rounded-2xl border border-white/5">
              <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">No books found</h3>
              <p className="text-gray-400">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => setFilters({ category: '', language: '', condition: '', maxPrice: 50, search: '' })}
                className="mt-4 text-[#3B82F6] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
