import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const cartCount = Array.isArray(cart) ? cart.reduce((t, item) => t + item.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/70 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-white font-semibold tracking-tight">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm">EC</div>
          <Link to="/" className="text-lg">Ecommerce</Link>
        </div>
        <nav className="flex-1 flex items-center gap-6 text-sm text-slate-200">
          <Link to="/" className="hover:text-white">Products</Link>
          {user && <Link to="/cart" className="hover:text-white">Cart</Link>}
          {user && <Link to="/profile" className="hover:text-white">Profile</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-sm text-slate-300">Hi, {user.username || user.email}</div>
              <Link to="/cart" className="relative px-3 py-2 rounded-full bg-slate-800 text-slate-100">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-slate-200">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-500">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

