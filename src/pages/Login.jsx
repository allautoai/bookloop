import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        navigate(from, { replace: true })
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        if (data?.user?.id) {
          const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            email: email,
            nom: name || email.split('@')[0],
          })
          if (insertError) console.error("Error creating user profile", insertError)
        }
        
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#2A364B] rounded-3xl border border-white/5 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 pointer-events-auto cursor-pointer">
            <BookOpen className="text-[#3B82F6] h-8 w-8" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              BookLoop
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin ? 'Enter your details to access your account' : 'Join the BookLoop community today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A2332] border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 rounded-xl transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="text-[#3B82F6] hover:underline font-medium"
          >
            {isLogin ? 'Sign up here' : 'Log in here'}
          </button>
        </div>
      </div>
    </div>
  )
}
