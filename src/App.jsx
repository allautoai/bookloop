import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import BookList from './pages/BookList'
import BookDetail from './pages/BookDetail'
import Login from './pages/Login'
import Publish from './pages/Publish'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* Protected Routes */}
          <Route path="/publish" element={
            <ProtectedRoute>
              <Publish />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  )
}

export default App
