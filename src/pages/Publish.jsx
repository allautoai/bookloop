import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Upload, X, Loader2 } from 'lucide-react'

export default function Publish() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    titol: '',
    autor: '',
    categoria_id: '',
    idioma: 'Català',
    estat: 'bon_estat',
    preu: '',
    descripcio: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('nom')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image is too large. Max 2MB.')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const userId = session.user.id
      let fotoUrl = null

      // 1. Upload image if exists
      if (imageFile) {
        const timestamp = Date.now()
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${timestamp}_${imageFile.name.replace(/\s/g, '_')}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(filePath)
        
        fotoUrl = publicUrl
      }

      // 2. Insert book
      const { data: bookData, error: insertError } = await supabase
        .from('books')
        .insert({
          ...formData,
          venedor_id: userId,
          foto_url: fotoUrl,
          preu: parseFloat(formData.preu),
          disponible: true
        })
        .select()
        .single()

      if (insertError) throw insertError

      navigate(`/books/${bookData.id}`)
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-8">Publish a Book</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#2A364B] p-8 rounded-3xl border border-white/5 shadow-xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              name="titol"
              required
              value={formData.titol}
              onChange={handleInputChange}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
              placeholder="The Great Gatsby"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Author</label>
            <input
              type="text"
              name="autor"
              required
              value={formData.autor}
              onChange={handleInputChange}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
              placeholder="F. Scott Fitzgerald"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              name="categoria_id"
              required
              value={formData.categoria_id}
              onChange={handleInputChange}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nom}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Language</label>
            <select
              name="idioma"
              required
              value={formData.idioma}
              onChange={handleInputChange}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
            >
              <option value="Català">Català</option>
              <option value="Castellà">Castellà</option>
              <option value="Anglès">Anglès</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Price (€)</label>
            <input
              type="number"
              name="preu"
              required
              min="0"
              step="0.01"
              value={formData.preu}
              onChange={handleInputChange}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6]"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Condition</label>
          <div className="flex flex-wrap gap-3">
            {['nou', 'com_a_nou', 'bon_estat', 'acceptable'].map(cond => (
              <button
                key={cond}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, estat: cond }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  formData.estat === cond 
                  ? 'bg-[#3B82F6] border-[#3B82F6] text-white' 
                  : 'bg-[#1A2332] border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {cond.replace(/_/g, ' ').charAt(0).toUpperCase() + cond.replace(/_/g, ' ').slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            name="descripcio"
            rows="4"
            value={formData.descripcio}
            onChange={handleInputChange}
            className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] resize-none"
            placeholder="Tell us about the book's content, edition, or specific condition details..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Book Cover</label>
          {imagePreview ? (
            <div className="relative w-40 aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 aspect-[3/4] bg-[#1A2332] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#3B82F6]/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-xs text-gray-400 font-medium text-center px-4">Upload Image (Max 2MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : 'Publish Book'}
          </button>
        </div>
      </form>
    </div>
  )
}
