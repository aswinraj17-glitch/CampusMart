import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Donations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const loadDonations = async () => {
    setLoading(true);
    try {
      let query = `?listingType=Donate`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (collegeFilter) query += `&collegeName=${encodeURIComponent(collegeFilter)}`;
      
      const res = await fetch(`${API_BASE}/api/products${query}`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [searchQuery, collegeFilter]);

  return (
    <div className="products-page-container">
      <div className="products-header">
        <h1 className="page-title">Book Donation Box 💚</h1>
        <p className="page-subtitle">Free textbook donations listed by seniors to support juniors</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <input
          type="text"
          placeholder="Search books, study materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: '2 1 300px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-primary)'
          }}
        />

        <select
          value={collegeFilter}
          onChange={(e) => setCollegeFilter(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'var(--bg-main)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="">All Colleges</option>
          <option value="Anna University">Anna University</option>
          <option value="IIT Madras">IIT Madras</option>
          <option value="PSG Tech">PSG Tech</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner"></div>
          <p>Loading donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No Donated Materials Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>Check back later or register to list a donation!</p>
        </div>
      ) : (
        <div className="products-grid">
          {donations.map((prod) => (
            <div key={prod.id} className="product-card glass" style={{ borderColor: 'rgba(52, 211, 153, 0.2)' }}>
              <div className="product-image-wrapper">
                {prod.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.name} className="product-img" />
                ) : (
                  <span className="product-img-fallback">📚</span>
                )}
                <span className="product-badge" style={{ background: '#34d399', color: '#000' }}>DONATION</span>
              </div>
              <div className="product-info">
                <h3 className="product-name">{prod.name}</h3>
                <p className="product-desc" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {prod.description || 'No description provided.'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  📍 {prod.collegeName || 'General Campus'}
                </p>
                {prod.department && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>
                    🎓 {prod.department} {prod.semester ? `(Sem ${prod.semester})` : ''}
                  </p>
                )}
                <div className="product-footer" style={{ marginTop: '1rem' }}>
                  <span className="product-price" style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
                  <Link to={`/product/${prod.id}`} className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    Claim Free
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
