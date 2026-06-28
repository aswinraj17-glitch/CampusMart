import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { cartCount } = useCart();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="main-header glass">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-emoji">🎓</span>
          <span className="logo-text">Campus<span className="logo-highlight">Mart</span></span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>Products</Link>
          <Link to="/donations" className={`nav-link ${isActive('/donations') ? 'active' : ''}`}>Donations</Link>
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''} cart-link`}>
            Cart{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          
          {user ? (
            <>
              <Link to="/seller-dashboard" className={`nav-link ${isActive('/seller-dashboard') ? 'active' : ''}`}>
                Seller Portal
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}>
                  Admin Panel
                </Link>
              )}
              <Link to="/user-dashboard" className={`nav-link ${isActive('/user-dashboard') ? 'active' : ''}`}>
                My Dashboard
              </Link>
              <button 
                onClick={handleSignOut} 
                className="nav-link" 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#f87171' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};
