import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  condition?: string;
  collegeName?: string | null;
}

export interface CartItem {
  id: number; // CartItem ID in database
  productId: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from DB if logged in, or local storage if not
  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        // Load offline cart from local storage
        const saved = localStorage.getItem('campusmart_cart_offline');
        if (saved) {
          try {
            setCart(JSON.parse(saved));
          } catch (e) {
            setCart([]);
          }
        } else {
          setCart([]);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const dbCart = await res.json();
          // Transform items if needed or use db format
          // The database returns cart with items: { id, cartId, productId, quantity, product: { ... } }
          setCart(dbCart.items || []);
        }
      } catch (err) {
        console.error('Failed to load cart from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  // Sync offline cart to localStorage when it changes and offline
  useEffect(() => {
    if (!token) {
      localStorage.setItem('campusmart_cart_offline', JSON.stringify(cart));
    }
  }, [cart, token]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!token) {
      // Offline implementation
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        // Mock a CartItem
        const newMockItem: CartItem = {
          id: Math.floor(Math.random() * 100000),
          productId: product.id,
          quantity,
          product
        };
        return [...prev, newMockItem];
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, quantity })
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart.items || []);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!token) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart.items || []);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!token) {
      setCart((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart.items || []);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const clearCart = async () => {
    if (!token) {
      setCart([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart.items || []);
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
