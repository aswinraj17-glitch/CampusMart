import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function UserDashboard() {
  const { token, user, updateProfile, signOut, refreshSelf } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();

  // Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Edit States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('1');
  const [password, setPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wishlist State
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Exchange Requests State
  const [swapRequests, setSwapRequests] = useState<{ incoming: any[]; outgoing: any[] }>({ incoming: [], outgoing: [] });
  const [swapLoading, setSwapLoading] = useState(false);

  // Chat State
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Check query parameter tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setSemester(user.semester ? String(user.semester) : '1');
    }
    refreshSelf(); // Reload latest verification status on dashboard load
  }, [token, navigate]);

  // Scroll messages to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load wishlist
  const loadWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Remove from wishlist
  const handleRemoveWishlist = async (productId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/wishlist/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadWishlist();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Swap/Exchange Requests
  const loadSwapRequests = async () => {
    setSwapLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/exchange`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSwapRequests(data);
      }
    } catch (err) {
      console.error('Error fetching swap requests:', err);
    } finally {
      setSwapLoading(false);
    }
  };

  // Respond to exchange request (Accept/Reject)
  const handleSwapResponse = async (requestId: number, status: 'Accepted' | 'Rejected') => {
    try {
      const res = await fetch(`${API_BASE}/api/exchange/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Exchange request ${status.toLowerCase()} successfully!`);
        loadSwapRequests();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to process response', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Chats Threads List
  const loadChats = async () => {
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  // Load Single Chat Messages
  const loadMessages = async (chatId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/chats/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start polling messages if chat is open
  useEffect(() => {
    if (!activeChatId || activeTab !== 'chat') return;
    loadMessages(activeChatId);
    const interval = setInterval(() => {
      loadMessages(activeChatId);
    }, 4000); // refresh chat every 4s
    return () => clearInterval(interval);
  }, [activeChatId, activeTab]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;

    // Find the chat object to get recipient
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const recipientId = activeChat.buyerId === user?.id ? activeChat.sellerId : activeChat.buyerId;

    try {
      const res = await fetch(`${API_BASE}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId,
          productId: activeChat.productId,
          text: chatInput
        })
      });
      if (res.ok) {
        setChatInput('');
        loadMessages(activeChatId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Notifications
  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic content fetcher on tab swap
  useEffect(() => {
    if (token) {
      if (activeTab === 'orders') loadOrders();
      else if (activeTab === 'wishlist') loadWishlist();
      else if (activeTab === 'swaps') loadSwapRequests();
      else if (activeTab === 'chat') loadChats();
      else if (activeTab === 'notifications') loadNotifications();
    }
  }, [activeTab, token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const result = await updateProfile({
        name,
        email,
        phone,
        department,
        semester: Number(semester),
        password: password.trim() !== '' ? password : undefined
      });
      if (result.error) throw new Error(result.error);
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
    } catch (err: any) {
      setProfileError(err.message || 'Profile update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Student Portal Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side Navigation Pane */}
        <aside className="glass" style={{ padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          
          {/* User Meta header */}
          <div style={{ padding: '0.5rem 0.5rem 1rem 0.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '0.8rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🎓</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', wordBreak: 'break-all' }}>{user?.name}</div>
            <span className={`badge-status ${user?.verificationStatus === 'Verified' ? 'badge-verified' : user?.verificationStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`} style={{ marginTop: '0.5rem' }}>
              {user?.verificationStatus}
            </span>
          </div>

          <button onClick={() => setActiveTab('profile')} className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            👤 Profile Editor
          </button>
          <button onClick={() => setActiveTab('verification')} className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            🏫 ID Verification
          </button>
          <button onClick={() => setActiveTab('orders')} className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            📦 Purchase Orders
          </button>
          <button onClick={() => setActiveTab('wishlist')} className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            ♥ Saved Wishlist
          </button>
          <button onClick={() => setActiveTab('swaps')} className={`tab-btn ${activeTab === 'swaps' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            🔄 Exchange Swaps
          </button>
          <button onClick={() => setActiveTab('chat')} className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            💬 Chat Messenger
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%', borderRadius: '8px' }}>
            🔔 Notifications
          </button>

          <button onClick={signOut} className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
            Log Out
          </button>
        </aside>

        {/* Right Side Content Pane */}
        <main className="glass" style={{ padding: '2rem', borderRadius: '12px', minHeight: '500px' }}>
          
          {/* PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Personal Details</h2>
              {profileSuccess && <div className="glass badge-verified" style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px' }}>{profileSuccess}</div>}
              {profileError && <div className="glass badge-rejected" style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px' }}>{profileError}</div>}

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                <div className="form-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</label>
                    <input type="text" value={department} onChange={e => setDepartment(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                <div className="form-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Semester</label>
                    <select value={semester} onChange={e => setSemester(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Change Password (Optional)</label>
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ padding: '0.7rem 1.5rem', fontWeight: 700, alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* VERIFICATION DETAILS */}
          {activeTab === 'verification' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>College Student ID Verification</h2>
              
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--card-border)' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Verification Status:</strong>{' '}
                  <span className={`badge-status ${user?.verificationStatus === 'Verified' ? 'badge-verified' : user?.verificationStatus === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                    {user?.verificationStatus}
                  </span>
                </div>

                {user?.verificationStatus === 'Pending' && (
                  <div className="glass font-secondary" style={{ padding: '1rem', borderLeft: '3px solid #fbbf24', fontSize: '0.85rem', color: '#fbbf24' }}>
                    ℹ️ Your college ID is currently under review by our campus admins. Access to listing products, buying, and sending exchange requests will be enabled as soon as your ID verification is approved.
                  </div>
                )}

                {user?.verificationStatus === 'Rejected' && (
                  <div className="glass font-secondary" style={{ padding: '1rem', borderLeft: '3px solid #f87171', fontSize: '0.85rem', color: '#f87171' }}>
                    ⚠️ Your application was rejected. Reason: **{user.verification?.rejectReason || 'Document upload unclear. Please re-register or contact admin.'}**
                  </div>
                )}

                {user?.verificationStatus === 'Verified' && (
                  <div className="glass font-secondary" style={{ padding: '1rem', borderLeft: '3px solid #34d399', fontSize: '0.85rem', color: '#34d399' }}>
                    💚 Congratulations! Your campus profile is verified. You can now buy, sell, exchange, and donate student essentials.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                  <div><strong>College:</strong> {user?.verification?.collegeName || 'N/A'}</div>
                  <div><strong>Department:</strong> {user?.verification?.department || 'N/A'}</div>
                  <div><strong>Year of Study:</strong> {user?.verification?.yearOfStudy ? `${user.verification.yearOfStudy} Year` : 'N/A'}</div>
                  <div><strong>College Email:</strong> {user?.verification?.collegeEmail || 'N/A'}</div>
                </div>

                {user?.verification?.idCardUrl && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Submitted ID Card Document:</div>
                    <img src={user.verification.idCardUrl} alt="id_card" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--card-border)' }} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PURCHASE ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Purchase History</h2>
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}><div className="spinner"></div></div>
              ) : orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet. <Link to="/products" style={{ color: 'var(--accent-secondary)' }}>Explore items</Link></p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {orders.map((ord: any) => (
                    <div key={ord.id} className="glass" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID:</span>{' '}
                          <strong style={{ fontSize: '0.85rem' }}>#{ord.id}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>{' '}
                          <span style={{ fontWeight: 700, color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>{ord.status}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {ord.items.map((it: any) => (
                          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <div>{it.productName} (x{it.quantity})</div>
                            <div>₹{it.productPrice.toLocaleString('en-IN')}</div>
                          </div>
                        ))}
                      </div>

                      {ord.meetup && (
                        <div className="glass font-secondary" style={{ padding: '0.75rem', borderRadius: '8px', marginTop: '0.75rem', fontSize: '0.8rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                          📍 <strong>Campus Handover Meetup:</strong> {ord.meetup.option} - {ord.meetup.location} on **{ord.meetup.date}** at **{ord.meetup.time}**
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Total: ₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                        <Link to={`/order-tracking/${ord.id}`} className="btn btn-secondary btn-sm">
                          Track Shipment
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Saved Wishlist</h2>
              {wishlistLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}><div className="spinner"></div></div>
              ) : wishlist.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Your wishlist is currently empty.</p>
              ) : (
                <div className="products-grid">
                  {wishlist.map((item: any) => (
                    <div key={item.id} className="product-card glass" style={{ padding: '0.75rem' }}>
                      <div className="product-image-wrapper" style={{ height: '120px' }}>
                        <img src={item.product.imageUrl || 'https://via.placeholder.com/150'} alt={item.product.name} className="product-img" />
                      </div>
                      <div className="product-info" style={{ padding: '0.5rem 0 0 0' }}>
                        <h4 style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>{item.product.name}</h4>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                          {item.product.listingType === 'Donate' ? 'FREE 💚' : `₹${item.product.price.toLocaleString('en-IN')}`}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                          <Link to={`/product/${item.product.id}`} className="btn btn-primary btn-sm" style={{ flexGrow: 1, padding: '0.35rem', fontSize: '0.75rem', textAlign: 'center' }}>
                            View
                          </Link>
                          <button onClick={() => handleRemoveWishlist(item.productId)} className="btn btn-secondary btn-sm" style={{ color: '#f87171', padding: '0.35rem 0.6rem' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXCHANGE SWAP REQUESTS */}
          {activeTab === 'swaps' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Product Exchange (Swap) Center</h2>
              {swapLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}><div className="spinner"></div></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  
                  {/* Incoming Swap Requests */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.4rem', marginBottom: '1rem' }}>Inbound Exchange Proposals</h3>
                    {swapRequests.incoming.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No incoming swap requests received.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {swapRequests.incoming.map((req: any) => (
                          <div key={req.id} className="glass" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              <span>From: **{req.sender.name}** ({req.sender.phone || 'No phone'})</span>
                              <span className={`badge-status ${req.status === 'Accepted' ? 'badge-verified' : req.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>{req.status}</span>
                            </div>

                            <div className="swap-card-grid" style={{ margin: '0.5rem 0' }}>
                              <div className="swap-card-box">
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>THEIR OFFER</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{req.proposedProduct.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>₹{req.proposedProduct.price}</div>
                              </div>
                              <div style={{ fontSize: '1.25rem' }}>⇄</div>
                              <div className="swap-card-box">
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>YOUR LISTING</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{req.requestedProduct.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>₹{req.requestedProduct.price}</div>
                              </div>
                            </div>

                            {req.status === 'Pending' && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                                <button onClick={() => handleSwapResponse(req.id, 'Rejected')} className="btn btn-secondary btn-sm" style={{ color: '#f87171' }}>
                                  Reject Proposal
                                </button>
                                <button onClick={() => handleSwapResponse(req.id, 'Accepted')} className="btn btn-primary btn-sm" style={{ background: '#fbbf24', color: '#000' }}>
                                  Accept & Swap
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outgoing Swap Requests */}
                  <div>
                    <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.4rem', marginBottom: '1rem' }}>My Outbound Swap Proposals</h3>
                    {swapRequests.outgoing.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>You haven't proposed any swaps yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {swapRequests.outgoing.map((req: any) => (
                          <div key={req.id} className="glass" style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                              <span>To: **{req.receiver.name}**</span>
                              <span className={`badge-status ${req.status === 'Accepted' ? 'badge-verified' : req.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>{req.status}</span>
                            </div>

                            <div className="swap-card-grid" style={{ margin: '0.5rem 0' }}>
                              <div className="swap-card-box">
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>YOUR OFFER</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{req.proposedProduct.name}</div>
                              </div>
                              <div style={{ fontSize: '1.25rem' }}>⇄</div>
                              <div className="swap-card-box">
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>THEIR LISTING</div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{req.requestedProduct.name}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* CHAT MESSENGER SYSTEM */}
          {activeTab === 'chat' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>In-App Messenger</h2>
              
              <div className="chat-container">
                {/* Threads list */}
                <div className="chat-sidebar">
                  <div className="chat-sidebar-header">Conversations</div>
                  <div className="chat-threads-list">
                    {chatLoading ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center' }}>Loading chats...</div>
                    ) : chats.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center' }}>No chats found</div>
                    ) : (
                      chats.map((c) => {
                        const chatPartner = c.buyerId === user?.id ? c.seller : c.buyer;
                        const lastMsg = c.messages[0]?.text || 'No messages yet';

                        return (
                          <div
                            key={c.id}
                            onClick={() => setActiveChatId(c.id)}
                            className={`chat-thread-item ${activeChatId === c.id ? 'active' : ''}`}
                          >
                            <span className="chat-thread-name">{chatPartner?.name || 'Student'}</span>
                            <span className="chat-thread-product">🛍️ {c.product?.name || 'General Product'}</span>
                            <span className="chat-thread-preview">{lastMsg}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Active Chat Window */}
                <div className="chat-window">
                  {activeChatId ? (
                    <>
                      <div className="chat-window-header">
                        <div>
                          <strong style={{ fontSize: '1rem' }}>
                            {(() => {
                              const ac = chats.find(c => c.id === activeChatId);
                              return ac?.buyerId === user?.id ? ac?.seller?.name : ac?.buyer?.name;
                            })()}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            ({(() => {
                              const ac = chats.find(c => c.id === activeChatId);
                              return ac?.product?.name;
                            })()})
                          </span>
                        </div>
                      </div>

                      <div className="chat-messages-area">
                        {messages.map((msg) => {
                          const isSentByMe = msg.senderId === user?.id;
                          return (
                            <div key={msg.id} className={`chat-bubble ${isSentByMe ? 'sent' : 'received'}`}>
                              <div>{msg.text}</div>
                              <div className="chat-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} className="chat-input-area">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="chat-input"
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
                          Send
                        </button>
                      </form>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Select a conversation thread to start chatting.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ALERTS NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>System Notifications</h2>
                {notifications.some(n => !n.isRead) && (
                  <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
                    Mark All Read
                  </button>
                )}
              </div>

              {notifLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}><div className="spinner"></div></div>
              ) : notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You have no notifications yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="glass"
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '8px',
                        border: '1px solid var(--card-border)',
                        background: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(6, 182, 212, 0.04)',
                        position: 'relative'
                      }}
                    >
                      {!n.isRead && (
                        <span style={{ position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                      )}
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>{n.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'inline-block' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
