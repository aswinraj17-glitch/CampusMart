import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, loading } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!token) {
      navigate('/login?redirect=checkout');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h1 className="page-title">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="empty-cart glass">
          <div className="empty-icon">🛍️</div>
          <h2>Your cart is empty</h2>
          <p>Explore the hot deals and items available on campus.</p>
          <Link to="/products" className="btn btn-primary btn-large">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items-section glass">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-img-placeholder">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.description || 'No description provided.'}</p>
                </div>
                
                <div className="item-price">
                  ₹{Number(item.product.price).toLocaleString('en-IN')}
                </div>
                
                <div className="item-quantity-control">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-val">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="remove-btn"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button onClick={clearCart} className="btn-clear-cart">
              Clear All Items
            </button>
          </div>
          
          <div className="cart-summary glass">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Campus Delivery</span>
              <span className="delivery-free">FREE</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total-row">
              <span>Total</span>
              <span className="total-price">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            
            <button onClick={handleCheckout} className="btn btn-primary btn-checkout">
              Proceed to Checkout
            </button>
            <div className="checkout-note">
              🔒 Safe & Secure Campus Pickup
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
