import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Added this import
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Router must wrap AuthProvider so Auth can use navigation hooks if needed */}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)