import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { CartProvider } from './context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </ErrorBoundary>
  </StrictMode>,
)
