import { Routes, Route } from "react-router-dom";
import { ProductProvider } from "../context/ProductContext";
import { CartProvider } from "../context/CartContext";
import { Header } from "../components/Header";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Checkout from "../pages/Checkout";
import OrderConfirmation from "../pages/OrderConfirmation";
import OrderTracking from "../pages/OrderTracking";
import UserDashboard from "../pages/UserDashboard";
import SellerDashboard from "../pages/SellerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import Donations from "../pages/Donations";

export default function Router() {
  return (
    <ProductProvider>
      <CartProvider>
        <Header />
        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            <Route path="*" element={
              <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
                <h2>Page Not Found</h2>
                <p>Looks like you wandered off campus.</p>
              </div>
            } />
          </Routes>
        </main>
      </CartProvider>
    </ProductProvider>
  );
}
