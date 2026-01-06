import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGate from "./components/PermissionGate";
import { useAdminAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

// Page Imports
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Subcategories from "./pages/Subcategories";
import Products from "./pages/Products";
import RelatedProducts from "./pages/RelatedProducts";
import RawMaterials from "./pages/RawMaterials";
import Manufacturing from "./pages/Manufacturing";
import Vendors from "./pages/Vendors";
import VendorPurchases from "./pages/VendorPurchases";
import BundleDiscounts from "./pages/BundleDiscounts";
import ProductDiscounts from "./pages/ProductDiscounts";
import Roles from "./pages/Roles";
import Screens from "./pages/Screens";
import UserRoles from "./pages/UserRoles";
import Analytics from "./pages/Analytics";
import Leads from "./pages/Leads";
import "./App.css";

// Internal Layout Component (Sidebar + Content Shell)
const Shell = ({ children }) => {
  const { admin, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50
        w-64 min-w-[16rem] max-w-[16rem]
        bg-[var(--bg-sidebar)] border-r border-[var(--border-primary)]
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
          <div className="flex-1">
            <div className="font-bold text-lg text-[var(--text-primary)] tracking-wide">Admin Panel</div>
            <div className="text-xs text-[var(--text-muted)] mt-1 truncate">{admin?.email}</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm text-[var(--text-secondary)]">
          <Link 
            to="/admin" 
            onClick={() => setSidebarOpen(false)}
            className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Dashboard
          </Link>

          {/* CATALOG MANAGEMENT */}
          <div className="pt-4 pb-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Catalog</div>
          <PermissionGate routeName="CATEGORY_VIEW">
            <Link 
              to="/admin/categories" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Categories
            </Link>
          </PermissionGate>
          <PermissionGate routeName="SUBCATEGORY_VIEW">
            <Link 
              to="/admin/subcategories" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Subcategories
            </Link>
          </PermissionGate>
          <PermissionGate routeName="PRODUCT_VIEW">
            <Link 
              to="/admin/products" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Products
            </Link>
          </PermissionGate>
          <PermissionGate routeName="RELATED_PRODUCT_VIEW">
            <Link 
              to="/admin/related-products" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Related Products
            </Link>
          </PermissionGate>

          {/* INVENTORY & MANUFACTURING */}
          <div className="pt-4 pb-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Inventory</div>
          <PermissionGate routeName="RAW_MATERIAL_VIEW">
            <Link 
              to="/admin/raw-materials" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Raw Materials
            </Link>
          </PermissionGate>
          <PermissionGate routeName="MANUFACTURING_VIEW">
            <Link 
              to="/admin/manufacturing" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Manufacturing
            </Link>
          </PermissionGate>
          <PermissionGate routeName="VENDOR_VIEW">
            <Link 
              to="/admin/vendors" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Vendors
            </Link>
          </PermissionGate>
          <PermissionGate routeName="VENDOR_PURCHASE_VIEW">
            <Link 
              to="/admin/vendor-purchases" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Purchases
            </Link>
          </PermissionGate>

          {/* OFFERS */}
          <div className="pt-4 pb-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Offers</div>
          <PermissionGate routeName="BUNDLE_DISCOUNT_VIEW">
            <Link 
              to="/admin/bundle-discounts" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Bundle Discounts
            </Link>
          </PermissionGate>
          <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_VIEW">
            <Link 
              to="/admin/product-discounts" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Product Discounts
            </Link>
          </PermissionGate>

          {/* SYSTEM */}
          <div className="pt-4 pb-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">System</div>
          <PermissionGate routeName="ANALYTICS_USER_VIEW">
            <Link 
              to="/admin/analytics" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Analytics
            </Link>
          </PermissionGate>
          <PermissionGate routeName="USER_ROLE_VIEW">
            <Link 
              to="/admin/user-roles" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              User Roles
            </Link>
          </PermissionGate>
          <PermissionGate routeName="ROLE_VIEW">
            <Link 
              to="/admin/roles" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Role Definitions
            </Link>
          </PermissionGate>
          <PermissionGate routeName="SCREEN_VIEW">
            <Link 
              to="/admin/screens" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Screen Config
            </Link>
          </PermissionGate>

          <PermissionGate routeName="LEAD_VIEW">
            <Link 
              to="/admin/leads" 
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Lead Management
            </Link>
          </PermissionGate>
        </nav>

        <div className="p-4 border-t border-[var(--border-primary)] space-y-2">
          <button 
            onClick={toggleTheme}
            className="w-full text-left px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)] rounded-lg transition-colors flex items-center gap-2"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={logout} 
            className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-0 min-w-0 p-4 lg:p-6 overflow-y-auto h-screen bg-[var(--bg-primary)]">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors shadow-lg"
        >
          ☰
        </button>
        
        {/* Theme Toggle for Desktop (top right) */}
        <button
          onClick={toggleTheme}
          className="hidden lg:block fixed top-4 right-4 z-30 p-2 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--hover-bg)] transition-colors shadow-lg"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="mt-12 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register" element={<Register />} />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Shell><Dashboard /></Shell>} />
        
        {/* Catalog */}
        <Route path="/admin/categories" element={<Shell><Categories /></Shell>} />
        <Route path="/admin/subcategories" element={<Shell><Subcategories /></Shell>} />
        <Route path="/admin/products" element={<Shell><Products /></Shell>} />
        <Route path="/admin/related-products" element={<Shell><RelatedProducts /></Shell>} />
        
        {/* Inventory */}
        <Route path="/admin/raw-materials" element={<Shell><RawMaterials /></Shell>} />
        <Route path="/admin/vendors" element={<Shell><Vendors /></Shell>} />
        <Route path="/admin/vendor-purchases" element={<Shell><VendorPurchases /></Shell>} />
        <Route path="/admin/manufacturing" element={<Shell><Manufacturing /></Shell>} />

        {/* Discounts */}
        <Route path="/admin/bundle-discounts" element={<Shell><BundleDiscounts /></Shell>} />
        <Route path="/admin/product-discounts" element={<Shell><ProductDiscounts /></Shell>} />

        {/* Admin/System */}
        <Route path="/admin/roles" element={<Shell><Roles /></Shell>} />
        <Route path="/admin/screens" element={<Shell><Screens /></Shell>} />
        <Route path="/admin/user-roles" element={<Shell><UserRoles /></Shell>} />
        <Route path="/admin/analytics" element={<Shell><Analytics /></Shell>} />
        <Route path="/admin/leads" element={<Shell><Leads /></Shell>} />
      </Route>

      {/* CATCH ALL - Redirect to Admin Dashboard */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;