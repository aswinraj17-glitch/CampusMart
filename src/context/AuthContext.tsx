import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  department: string | null;
  semester: number | null;
  verificationStatus: string; // Pending, Verified, Rejected
  verification?: {
    collegeName: string;
    department: string;
    yearOfStudy: number;
    collegeEmail: string | null;
    idCardUrl: string;
    status: string;
    rejectReason: string | null;
  } | null;
  createdAt: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  signUp: (
    name: string,
    email: string,
    password: string,
    role?: string,
    phone?: string,
    verificationData?: {
      collegeName: string;
      department: string;
      yearOfStudy: number;
      collegeEmail?: string;
      idCardUrl?: string;
      semester?: number;
    }
  ) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => void;
  updateProfile: (data: { name?: string; email?: string; phone?: string; password?: string; department?: string; semester?: number }) => Promise<{ error: any; data: any }>;
  refreshSelf: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const signUp = async (
    name: string,
    email: string,
    password: string,
    role?: string,
    phone?: string,
    verificationData?: {
      collegeName: string;
      department: string;
      yearOfStudy: number;
      collegeEmail?: string;
      idCardUrl?: string;
      semester?: number;
    }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          ...verificationData
        })
      });
      const result = await res.json();
      if (!res.ok) {
        return { error: result.error || 'Registration failed', data: null };
      }
      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.user);
      return { error: null, data: result };
    } catch (err: any) {
      return { error: err.message || 'Network error', data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await res.json();
      if (!res.ok) {
        return { error: result.error || 'Login failed', data: null };
      }
      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.user);
      return { error: null, data: result };
    } catch (err: any) {
      return { error: err.message || 'Network error', data: null };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: { name?: string; email?: string; phone?: string; password?: string; department?: string; semester?: number }) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const result = await res.json();
      if (!res.ok) {
        return { error: result.error || 'Failed to update profile', data: null };
      }
      setUser(prev => prev ? { ...prev, ...result } : null);
      return { error: null, data: result };
    } catch (err: any) {
      return { error: err.message || 'Network error', data: null };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut, updateProfile, refreshSelf: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
