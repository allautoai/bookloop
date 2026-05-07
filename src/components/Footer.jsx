import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1A2332] border-t border-white/5 pt-12 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <BookOpen className="text-[#3B82F6] h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                BookLoop
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Give books a second life. Join our community and discover your next great read.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase text-xs tracking-widest">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/books" className="text-gray-400 hover:text-white text-sm transition-colors">Catalog</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login / Signup</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white uppercase text-xs tracking-widest">Contact</h4>
            <p className="text-gray-400 text-sm">support@bookloop.com</p>
            <div className="flex gap-4">
              <span className="text-gray-500 text-xs">Barcelona, Spain</span>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            BookLoop © 2026 — All rights reserved
          </p>
          <div className="flex gap-6">
            <span className="text-gray-500 text-xs hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="text-gray-500 text-xs hover:text-gray-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
