import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { products, categories, loading } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Recommendations and Donations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    // 1. Fetch semester recommendations if logged in and has department/semester info
    const fetchRecommendations = async () => {
      if (!user?.department || !user?.semester) return;
      try {
        const res = await fetch(
          `${API_BASE}/api/products?department=${encodeURIComponent(user.department)}&semester=${user.semester}&limit=4`
        );
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    };

    // 2. Fetch recent donations
    const fetchDonations = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?listingType=Donate&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setDonations(data.products || []);
        }
      } catch (err) {
        console.error('Error fetching donations:', err);
      }
    };

    fetchRecommendations();
    fetchDonations();
  }, [user, API_BASE]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Featured listings (limit to first 4)
  const featuredProducts = products.filter(p => p.listingType !== 'Donate').slice(0, 4);
  // Recently added listings (next 4)
  const recentProducts = products.filter(p => p.listingType !== 'Donate').slice(4, 8);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section glass" style={{ padding: '3.5rem 2rem', marginBottom: '2.5rem' }}>
        <div className="hero-content">
          <h1 className="hero-title">
            The Campus Marketplace <br />
            <span className="gradient-text">Made Smart & Sleek</span>
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: '1.5rem' }}>
            Buy, sell, exchange, or donate textbook essentials, calculators, laptops, and student essentials.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            <input
              type="text"
              placeholder="Search textbooks, calculators, laptops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
              Search
            </button>
          </form>

          <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-large">
              Explore Catalog
            </Link>
            <Link to="/donations" className="btn btn-secondary btn-large" style={{ borderColor: '#34d399', color: '#34d399' }}>
              💚 Donations
            </Link>
            {user ? (
              <Link to="/seller-dashboard" className="btn btn-secondary btn-large">
                Sell / Swap / Donate
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-large">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Semester Recommendations (Customized for student) */}
      {user?.department && user?.semester && recommendations.length > 0 && (
        <section className="recommendations-section" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Recommended for {user.department} (Sem {user.semester})
            </h2>
            <Link to={`/products?department=${encodeURIComponent(user.department)}&semester=${user.semester}`} style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              View All
            </Link>
          </div>
          <div className="products-grid">
            {recommendations.map((prod) => (
              <div key={prod.id} className="product-card glass">
                <div className="product-image-wrapper">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="product-img" />
                  ) : (
                    <span className="product-img-fallback">📚</span>
                  )}
                  <span className="product-badge" style={{ background: '#3b82f6', color: '#fff' }}>Sem {prod.semester}</span>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {prod.collegeName || 'General Campus'}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">
                      {prod.listingType === 'Donate' ? 'FREE 💚' : prod.listingType === 'Exchange' ? 'SWAP 🔄' : `₹${prod.price.toLocaleString('en-IN')}`}
                    </span>
                    <Link to={`/product/${prod.id}`} className="btn btn-secondary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Categories Showcase */}
      <section className="categories-section" style={{ marginBottom: '3rem' }}>
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {categories.map((cat) => {
            let emoji = '📦';
            if (cat.name.toLowerCase().includes('electron')) emoji = '💻';
            else if (cat.name.toLowerCase().includes('book')) emoji = '📚';
            else if (cat.name.toLowerCase().includes('cloth')) emoji = '👕';
            else if (cat.name.toLowerCase().includes('sport')) emoji = '⚽';
            else if (cat.name.toLowerCase().includes('station')) emoji = '✏️';

            return (
              <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="category-card glass">
                <div className="category-emoji">{emoji}</div>
                <h3>{cat.name}</h3>
                <span className="category-meta">Browse Listings</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section" style={{ marginBottom: '3rem' }}>
        <h2 className="section-title">Featured Listings</h2>
        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="product-card glass">
                <div className="product-image-wrapper">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="product-img" />
                  ) : (
                    <span className="product-img-fallback">📦</span>
                  )}
                  <span className="product-badge" style={{ background: prod.listingType === 'Exchange' ? '#fbbf24' : 'var(--accent-primary)', color: '#000' }}>
                    {prod.listingType === 'Exchange' ? 'SWAP' : prod.listingType === 'SellOrExchange' ? 'SELL/SWAP' : prod.condition}
                  </span>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {prod.collegeName || 'General Campus'}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">
                      {prod.listingType === 'Exchange' ? 'SWAP 🔄' : `₹${prod.price.toLocaleString('en-IN')}`}
                    </span>
                    <Link to={`/product/${prod.id}`} className="btn btn-secondary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Donations Center shortcuts */}
      {donations.length > 0 && (
        <section className="donations-center-section" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Recent Book Donations 💚
            </h2>
            <Link to="/donations" style={{ color: '#34d399', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              Browse Donations Box
            </Link>
          </div>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {prod.collegeName || 'General Campus'}
                  </p>
                  <div className="product-footer">
                    <span className="product-price" style={{ color: '#34d399' }}>FREE</span>
                    <Link to={`/product/${prod.id}`} className="btn btn-secondary btn-sm" style={{ border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                      Claim Free
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Products */}
      {recentProducts.length > 0 && (
        <section className="recent-section" style={{ marginBottom: '3rem' }}>
          <h2 className="section-title">Recently Added</h2>
          <div className="products-grid">
            {recentProducts.map((prod) => (
              <div key={prod.id} className="product-card glass">
                <div className="product-image-wrapper">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="product-img" />
                  ) : (
                    <span className="product-img-fallback">📦</span>
                  )}
                  <span className="product-badge">{prod.condition}</span>
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {prod.collegeName || 'General Campus'}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">₹{prod.price.toLocaleString('en-IN')}</span>
                    <Link to={`/product/${prod.id}`} className="btn btn-secondary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action Footer Panel */}
      <section className="cta-banner glass">
        <h2>Got stuff you don't need?</h2>
        <p>Turn your old textbooks and unused electronics into quick cash today.</p>
        <button
          onClick={() => {
            if (!user) {
              navigate('/login');
            } else {
              navigate('/seller-dashboard');
            }
          }}
          className="btn btn-primary"
        >
          List a Product
        </button>
      </section>
    </div>
  );
}
