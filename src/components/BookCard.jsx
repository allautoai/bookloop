import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'nou':
        return <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded text-xs font-medium border border-[#10B981]/20">New</span>
      case 'com_a_nou':
        return <span className="bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-1 rounded text-xs font-medium border border-[#3B82F6]/20">Like New</span>
      case 'bon_estat':
        return <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded text-xs font-medium border border-[#F59E0B]/20">Good</span>
      case 'acceptable':
        return <span className="bg-[#6B7280]/10 text-[#6B7280] px-2 py-1 rounded text-xs font-medium border border-[#6B7280]/20">Acceptable</span>
      default:
        return null
    }
  }

  // Format price
  const formattedPrice = Number(book.preu).toLocaleString('en-US', {
    style: 'currency',
    currency: 'EUR'
  })

  // Format language
  const formattedLanguage = book.idioma || 'Unknown'

  return (
    <Link to={`/books/${book.id}`} className="group relative bg-[#2A364B] rounded-xl overflow-hidden hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 border border-white/5 flex flex-col h-full">
      
      {/* Image container */}
      <div className="aspect-[3/4] w-full bg-[#1A2332] overflow-hidden p-4 flex items-center justify-center">
        {book.foto_url ? (
          <img 
            src={book.foto_url} 
            alt={`Cover of ${book.titol}`} 
            className="h-full object-cover rounded shadow-lg group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-gray-500 font-mono text-xs">No Cover</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-lg leading-tight text-white line-clamp-2 title-font">
            {book.titol}
          </h3>
          <span className="text-[#3B82F6] font-bold shrink-0">{formattedPrice}</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-3 font-medium line-clamp-1">{book.autor}</p>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          <span className="text-xs text-gray-500 capitalize">{formattedLanguage}</span>
          {getConditionBadge(book.estat)}
        </div>

      </div>
    </Link>
  )
}
