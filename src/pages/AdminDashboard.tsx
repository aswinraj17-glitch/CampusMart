import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Stats state
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Verifications state
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationsLoading, setVerificationsLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      alert('Access Denied. You need Administrator privileges to access this panel.');
      navigate('/');
    }
  }, [token, user, navigate]);

  // Fetch admin overview stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch all products
  const fetchProductsList = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch all orders
  const fetchOrdersList = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch student verification requests
  const fetchVerificationsList = async () => {
    setVerificationsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/verifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifications(data);
      }
    } catch (err) {
      console.error('Error fetching verifications:', err);
    } finally {
      setVerificationsLoading(false);
    }
  };

  // Trigger loading based on active tab
  useEffect(() => {
    if (token) {
      if (activeTab === 'overview') fetchStats();
      else if (activeTab === 'users') fetchUsers();
      else if (activeTab === 'listings') fetchProductsList();
      else if (activeTab === 'orders') fetchOrdersList();
      else if (activeTab === 'verifications') fetchVerificationsList();
    }
  }, [activeTab, token]);

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? All their listings will be removed.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('User profile deleted');
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (productId: number) => {
    if (!window.confirm('Remove this product listing from CampusMart?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Product listing removed');
        fetchProductsList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrdersList();
        alert('Order shipment status updated');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Respond to college verification (Approve/Reject)
  const handleVerifyResponse = async (studentId: number, status: 'Verified' | 'Rejected') => {
    let rejectReason = '';
    if (status === 'Rejected') {
      const reason = prompt('Please specify a rejection reason for the student ID card document:');
      if (reason === null) return; // cancel
      rejectReason = reason || 'ID card image was blurry/unclear';
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/verifications/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectReason })
      });
      if (res.ok) {
        alert(`ID card verification status updated to: ${status}`);
        fetchVerificationsList();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update verification status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '1rem' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Admin Control Panel</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Navigation Tabs */}
        <aside className="glass" style={{ padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            📊 Stats Overview
          </button>
          <button onClick={() => setActiveTab('verifications')} className={`tab-btn ${activeTab === 'verifications' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            🏫 ID Verifications
          </button>
          <button onClick={() => setActiveTab('users')} className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            👥 Manage Users
          </button>
          <button onClick={() => setActiveTab('listings')} className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            📦 Manage Catalog
          </button>
          <button onClick={() => setActiveTab('orders')} className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            🛍️ Manage Orders
          </button>
        </aside>

        {/* Content Panel */}
        <main className="glass" style={{ padding: '2rem', borderRadius: '12px', minHeight: '550px' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Global Analytics</h2>
              {statsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}><div className="spinner"></div></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div className="metric-card glass">
                    <span className="metric-label">Total Users</span>
                    <span className="metric-value">{stats.totalUsers}</span>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-label">Active Listings</span>
                    <span className="metric-value">{stats.totalProducts}</span>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-label">Total Orders</span>
                    <span className="metric-value">{stats.totalOrders}</span>
                  </div>
                  <div className="metric-card glass">
                    <span className="metric-label">Gross Revenue</span>
                    <span className="metric-value" style={{ color: 'var(--accent-secondary)' }}>
                      ₹{stats.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VERIFICATION CENTER */}
          {activeTab === 'verifications' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>ID Card Verification Center</h2>
              {verificationsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}><div className="spinner"></div></div>
              ) : verifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No student verification requests are currently pending review.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {verifications.map((v) => (
                    <div key={v.userId} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                      <div className="form-row" style={{ marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STUDENT NAME</div>
                          <strong style={{ fontSize: '1.05rem' }}>{v.user?.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.user?.email}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>COLLEGE DETAILS</div>
                          <div style={{ fontWeight: 600 }}>{v.collegeName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v.department} - Year {v.yearOfStudy}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ID Card Upload Preview:</div>
                        <a href={v.idCardUrl} target="_blank" rel="noreferrer">
                          <img src={v.idCardUrl} alt="id_preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'block' }} />
                        </a>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                        <button onClick={() => handleVerifyResponse(v.userId, 'Rejected')} className="btn btn-secondary" style={{ color: '#f87171', padding: '0.5rem 1rem' }}>
                          Reject Application
                        </button>
                        <button onClick={() => handleVerifyResponse(v.userId, 'Verified')} className="btn btn-primary" style={{ background: '#34d399', color: '#000', padding: '0.5rem 1.25rem', fontWeight: 700 }}>
                          Approve Verification
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USERS LIST */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Registered Users Directory</h2>
              {usersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner"></div></div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Verification</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role.toUpperCase()}</td>
                          <td>
                            <span className={`badge-status ${u.verificationStatus === 'Verified' ? 'badge-verified' : u.verificationStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              {u.verificationStatus}
                            </span>
                          </td>
                          <td>
                            {u.role !== 'admin' && (
                              <button onClick={() => handleDeleteUser(u.id)} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>
                                Delete User
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LISTINGS */}
          {activeTab === 'listings' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Global Product Catalog</h2>
              {productsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner"></div></div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Item ID</th>
                        <th>Name</th>
                        <th>Seller</th>
                        <th>Price</th>
                        <th>Listing Type</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td>#{prod.id}</td>
                          <td>{prod.name}</td>
                          <td>{prod.seller?.name || 'Seller #' + prod.sellerId}</td>
                          <td>{prod.listingType === 'Donate' ? 'FREE 💚' : `₹${Number(prod.price).toLocaleString('en-IN')}`}</td>
                          <td>{prod.listingType}</td>
                          <td>
                            <button onClick={() => handleDeleteListing(prod.id)} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>
                              Remove Listing
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Global Order Records</h2>
              {ordersLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><div className="spinner"></div></div>
              ) : (
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Recipient</th>
                        <th>Order Date</th>
                        <th>Amount</th>
                        <th>Shipment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td><strong>#{ord.id}</strong></td>
                          <td>{ord.fullName}</td>
                          <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid var(--card-border)',
                                background: 'var(--bg-main)',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                fontWeight: 600
                              }}
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Seller Confirmed">Seller Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
