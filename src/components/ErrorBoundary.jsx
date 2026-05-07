import { Component } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A2332] text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
          <div className="bg-[#2A364B] border border-red-500/30 text-red-400 p-4 rounded-xl max-w-2xl w-full mb-8 text-left overflow-auto">
            <p className="font-mono text-sm">{this.state.error?.toString()}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            Return to Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
