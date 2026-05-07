import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Upload, X, Loader2, ArrowLeft } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function EditBook() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    titol: '',
    autor: '',
    categoria_id: '',
    idioma: '',
    estat: '',
    preu: '',
    descripcio: '',
    foto_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch categories
        const { data: catData } = await supabase.from('categories').select('*').order('nom')
        if (catData) setCategories(catData)

        // Fetch book data
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single()
        
        if (bookError) throw bookError
        
        // Verify ownership
        const { data: { session } } = await supabase.auth.getSession()
        if (bookData.venedor_id !== session?.user?.id) {
          addToast('You do not have permission to edit this book.', 'error')
          navigate('/profile')
          return
        }

        setFormData({
          titol: bookData.titol,
          autor: bookData.autor,
          categoria_id: bookData.categoria_id,
          idioma: bookData.idioma,
          estat: bookData.estat,
          preu: bookData.preu,
          descripcio: bookData.descripcio || '',
          foto_url: bookData.foto_url
        })
        setImagePreview(bookData.foto_url)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate, addToast])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image is too large. Max 2MB.', 'error')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session.user.id
      let finalFotoUrl = formData.foto_url

      // 1. Upload new image if exists
      if (imageFile) {
        const timestamp = Date.now()
        const fileName = `${timestamp}_${imageFile.name.replace(/\s/g, '_')}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('book-images')
          .getPublicUrl(filePath)
        
        finalFotoUrl = publicUrl
      }

      // 2. Update book
      const { error: updateError } = await supabase
        .from('books')
        .update({
          ...formData,
          foto_url: finalFotoUrl,
          preu: parseFloat(formData.preu)
        })
        .eq('id', id)

      if (updateError) throw updateError

      addToast('Book updated successfully!', 'success')
      navigate(`/books/${id}`)
    } catch (err) {
      console.error(err)
      addToast(err.message || 'Error updating book, please try again.', 'error')
    } finally {
      setSaving(false)
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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      <h1 className="text-3xl font-extrabold mb-8">Edit Book</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#2A364B] p-8 rounded-3xl border border-white/5 shadow-xl">
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
              <option value="English">English</option>
              <option value="Catalan">Catalan</option>
              <option value="Spanish">Spanish</option>
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
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Book Cover</label>
          {imagePreview ? (
            <div className="relative w-40 aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 aspect-[3/4] bg-[#1A2332] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#3B82F6]/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-500 mb-2" />
              <span className="text-xs text-gray-400 font-medium text-center px-4">Upload Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
