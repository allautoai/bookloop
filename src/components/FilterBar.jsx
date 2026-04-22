export default function FilterBar({ filters, setFilters, categories }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const conditions = [
    { value: '', label: 'Tots els estats' },
    { value: 'nou', label: 'Nou' },
    { value: 'com_a_nou', label: 'Com a nou' },
    { value: 'bon_estat', label: 'Bon estat' },
    { value: 'acceptable', label: 'Acceptable' }
  ]

  const languages = [
    { value: '', label: 'Tots els idiomes' },
    { value: 'Català', label: 'Català' },
    { value: 'Castellà', label: 'Castellà' },
    { value: 'Anglès', label: 'Anglès' }
  ]

  return (
    <div className="bg-[#2A364B] p-4 rounded-xl border border-white/5 space-y-4 sticky top-24">
      <h3 className="font-bold text-lg mb-2 border-b border-white/5 pb-2">Filtres</h3>
      
      {/* Categories */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Categoria</label>
        <select 
          name="category" 
          value={filters.category} 
          onChange={handleChange}
          className="w-full bg-[#1A2332] border border-white/10 rounded-lg p-2 text-sm focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] outline-none"
        >
          <option value="">Totes les categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nom}</option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Idioma</label>
        <select 
          name="language" 
          value={filters.language} 
          onChange={handleChange}
          className="w-full bg-[#1A2332] border border-white/10 rounded-lg p-2 text-sm focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] outline-none"
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Estat</label>
        <div className="flex flex-col gap-2 mt-1">
          {conditions.map(cond => (
            <label key={cond.value || 'all'} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="condition" 
                value={cond.value} 
                checked={filters.condition === cond.value}
                onChange={handleChange}
                className="w-4 h-4 text-[#3B82F6] bg-[#1A2332] border-white/20 focus:ring-[#3B82F6]"
              />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range (simplified for V1) */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <label className="block text-sm font-medium text-gray-300">Preu Màxim</label>
        <div className="flex items-center justify-between">
          <input 
            type="range" 
            name="maxPrice" 
            min="0" 
            max="50" 
            step="1"
            value={filters.maxPrice} 
            onChange={handleChange}
            className="w-full h-2 bg-[#1A2332] rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
          />
        </div>
        <div className="text-right text-xs text-gray-400 font-mono">
          Fins a {filters.maxPrice}€
        </div>
      </div>

    </div>
  )
}
