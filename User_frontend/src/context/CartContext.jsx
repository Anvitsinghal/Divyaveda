import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null); // Backend usually returns { items: [], total: 0 }
  const { user } = useAuth(); // We only fetch cart if user is logged in

  // 1. Fetch Cart from Backend
  const fetchCart = async () => {
    if (!user) return; // Don't fetch if not logged in
    try {
      const res = await api.get('/cart');
      // Backend likely returns the cart object directly
      setCart(res.data); 
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };

  // 2. Load cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null); // Clear cart on logout
    }
  }, [user]);

  // 3. Add to Cart Function
  const addToCart = async (productId, quantity) => {
    if (!user) {
      alert("Please login to add items");
      return;
    }

    try {
      // Based on your cart.routes.js: POST / with body
      await api.post('/cart', { productId, quantity });
      
      // Refresh local state to match backend
      await fetchCart(); 
      alert("Added to cart!");
    } catch (err) {
      console.error("Add to cart error", err);
      alert(err.response?.data?.message || "Failed to add item");
    }
  };

  // 4. Remove Item Function
  const removeFromCart = async (itemId) => {
    try {
      // Based on cart.routes.js: DELETE /:id
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (err) {
      console.error("Remove error", err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);