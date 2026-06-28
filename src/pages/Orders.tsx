import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TransactionItem {
  id: number;
  productId?: number;
  productName: string;
  productPrice: number;
  quantity: number;
  productImage?: string;
}

interface Transaction {
  id: number;
  createdAt: string;
  totalAmount: number;
  items: TransactionItem[];
}

export default function Orders() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/transactions/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
        setTransactions(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Orders</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {transactions.length === 0 && !error && <p className="text-gray-600">No orders yet.</p>}
      <div className="w-full max-w-3xl space-y-6">
        {transactions.map(tx => (
          <div key={tx.id} className="bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Order #{tx.id}</span>
              <span className="text-sm text-gray-600">{new Date(tx.createdAt).toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              {tx.items.map(item => (
                <div key={item.id || `${item.productId}-${item.quantity}`} className="flex items-center mb-2">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded mr-3" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p>{Number(item.productPrice).toFixed(2)} ₹</p>
                    <p className="text-sm text-gray-600">Subtotal: {(Number(item.productPrice) * item.quantity).toFixed(2)} ₹</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-2 text-right font-semibold">
              Total: {Number(tx.totalAmount).toFixed(2)} ₹
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
