import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '650px', borderRadius: '16px', padding: '2.5rem 2rem', boxShadow: 'var(--glow-shadow)', textAlign: 'center' }}>
        
        {/* Animated Checkmark */}
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '3px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: '#10b981',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
        }}>
          ✓
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Thank you for shopping on CampusMart. Your order has been registered and notify emails (simulated) have been sent.
        </p>

        {/* Order Info Card */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.01)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
            <strong># {order.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order Date:</span>
            <strong>{new Date(order.createdAt).toLocaleString()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Delivery Location:</span>
            <strong style={{ textAlign: 'right', maxWidth: '300px' }}>
              {order.addressLine}, {order.city}, {order.state} - {order.zipCode}
            </strong>
          </div>
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Total Paid:</span>
            <strong style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem' }}>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to={`/order-tracking/${order.id}`} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
            Track Your Order
          </Link>
          <Link to="/products" className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
