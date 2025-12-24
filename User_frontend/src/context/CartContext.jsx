import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    const res = await api.get("/cart");
    setCart(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity) => {
    if (!user) return;
    await api.post("/cart", { product_id: productId, quantity });
    await fetchCart();
  };

  const updateQuantity = async (cartId, quantity) => {
    await api.put(`/cart/${cartId}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async cartId => {
    await api.delete(`/cart/${cartId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete("/cart");
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);