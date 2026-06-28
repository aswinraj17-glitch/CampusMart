import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 
                      toast.type === 'info' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                      'linear-gradient(135deg, #10b981, #047857)',
          color: '#fff',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: 600,
          fontSize: '0.9rem',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }}>
          <span>{toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
