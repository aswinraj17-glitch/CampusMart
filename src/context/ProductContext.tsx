import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  condition: string;
  collegeName: string | null;
  contactDetails: string | null;
  listingType: string; // Sell, Exchange, SellOrExchange, Donate
  department: string | null;
  semester: number | null;
  isAvailable: boolean;
  categoryId: number;
  category?: { id: number; name: string };
  sellerId: number;
  seller?: { id: number; name: string; email: string; phone: string | null };
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
}

interface FetchProductsParams {
  categoryId?: number | string;
  search?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  condition?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
  listingType?: string;
  department?: string;
  semester?: number | string;
  collegeName?: string;
  userCollegeName?: string;
}

type ProductContextType = {
  products: Product[];
  categories: Category[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error?: string;
  fetchProducts: (params?: FetchProductsParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  addProduct: (productData: any) => Promise<{ error: any; data: Product | null }>;
  deleteProduct: (productId: number) => Promise<boolean>;
  updateProduct: (productId: number, productData: any) => Promise<boolean>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchProducts = useCallback(async (params: FetchProductsParams = {}) => {
    setLoading(true);
    setError(undefined);
    try {
      const queryParts = [];
      if (params.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.minPrice) queryParts.push(`minPrice=${params.minPrice}`);
      if (params.maxPrice) queryParts.push(`maxPrice=${params.maxPrice}`);
      if (params.condition) queryParts.push(`condition=${params.condition}`);
      if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
      if (params.page) queryParts.push(`page=${params.page}`);
      if (params.limit) queryParts.push(`limit=${params.limit}`);
      if (params.listingType) queryParts.push(`listingType=${params.listingType}`);
      if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
      if (params.semester) queryParts.push(`semester=${params.semester}`);
      if (params.collegeName) queryParts.push(`collegeName=${encodeURIComponent(params.collegeName)}`);
      if (params.userCollegeName) queryParts.push(`userCollegeName=${encodeURIComponent(params.userCollegeName)}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const res = await fetch(`${API_BASE}/api/products${queryString}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      
      const data = await res.json();
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products. Please check your backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial catalog and categories
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const addProduct = async (productData: any) => {
    if (!token) return { error: 'Login required to list products', data: null };
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      const result = await res.json();
      if (!res.ok) {
        return { error: result.error || 'Failed to list product', data: null };
      }
      fetchProducts();
      return { error: null, data: result };
    } catch (err: any) {
      return { error: err.message || 'Network error', data: null };
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting product:', err);
      return false;
    }
  };

  const updateProduct = async (productId: number, productData: any) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        fetchProducts();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating product:', err);
      return false;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        totalProducts,
        totalPages,
        currentPage,
        loading,
        error,
        fetchProducts,
        fetchCategories,
        addProduct,
        deleteProduct,
        updateProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
