import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGate from "./components/PermissionGate";
import { useAdminAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import B2B from "./pages/B2B";

import "./App.css";

/* =========================
   SHELL LAYOUT
========================= */
const Shell = ({ children }) => {
  const { admin, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass =
    "block px-3 py-2 rounded-lg transition-all duration-200 " +
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] " +
    "hover:bg-[var(--hover-bg)]";

  const sectionTitle =
    "pt-4 pb-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider";

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-64
          bg-[var(--bg-sidebar)]
          border-r border-[var(--border-primary)]
          transform transition-transform duration-300
          flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-4 border-b border-[var(--border-primary)] shrink-0">
          <div className="font-bold text-lg tracking-wide">Admin Panel</div>
          <div className="text-xs text-[var(--text-muted)] truncate mt-1">
            {admin?.email}
          </div>
        </div>

        {/* ✅ SCROLLABLE NAV */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
          <Link to="/admin" onClick={() => setSidebarOpen(false)} className={linkClass}>
            Dashboard
          </Link>

          <div className={sectionTitle}>Catalog</div>
          <PermissionGate routeName="CATEGORY_VIEW">
            <Link to="/admin/categories" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Categories
            </Link>
          </PermissionGate>
          <PermissionGate routeName="SUBCATEGORY_VIEW">
            <Link to="/admin/subcategories" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Subcategories
            </Link>
          </PermissionGate>
          <PermissionGate routeName="PRODUCT_VIEW">
            <Link to="/admin/products" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Products
            </Link>
          </PermissionGate>
          <PermissionGate routeName="RELATED_PRODUCT_VIEW">
            <Link to="/admin/related-products" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Related Products
            </Link>
          </PermissionGate>

          <div className={sectionTitle}>Inventory</div>
          <PermissionGate routeName="RAW_MATERIAL_VIEW">
            <Link to="/admin/raw-materials" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Raw Materials
            </Link>
          </PermissionGate>
          <PermissionGate routeName="MANUFACTURING_VIEW">
            <Link to="/admin/manufacturing" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Manufacturing
            </Link>
          </PermissionGate>
          <PermissionGate routeName="VENDOR_VIEW">
            <Link to="/admin/vendors" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Vendors
            </Link>
          </PermissionGate>
          <PermissionGate routeName="VENDOR_PURCHASE_VIEW">
            <Link to="/admin/vendor-purchases" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Purchases
            </Link>
          </PermissionGate>

          <div className={sectionTitle}>Offers</div>
          <PermissionGate routeName="BUNDLE_DISCOUNT_VIEW">
            <Link to="/admin/bundle-discounts" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Bundle Discounts
            </Link>
          </PermissionGate>
          <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_VIEW">
            <Link to="/admin/product-discounts" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Product Discounts
            </Link>
          </PermissionGate>

          <div className={sectionTitle}>System</div>
          <PermissionGate routeName="ANALYTICS_USER_VIEW">
            <Link to="/admin/analytics" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Analytics
            </Link>
          </PermissionGate>
          <PermissionGate routeName="USER_ROLE_VIEW">
            <Link to="/admin/user-roles" onClick={() => setSidebarOpen(false)} className={linkClass}>
              User Roles
            </Link>
          </PermissionGate>
          <PermissionGate routeName="ROLE_VIEW">
            <Link to="/admin/roles" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Role Definitions
            </Link>
          </PermissionGate>
          <PermissionGate routeName="SCREEN_VIEW">
            <Link to="/admin/screens" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Screen Config
            </Link>
          </PermissionGate>
          <PermissionGate routeName="LEAD_VIEW">
            <Link to="/admin/leads" onClick={() => setSidebarOpen(false)} className={linkClass}>
              Lead Management
            </Link>
          </PermissionGate>

          <Link to="/admin/b2b" onClick={() => setSidebarOpen(false)} className={linkClass}>
            B2B
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto h-screen">
        {/* TOP HEADER */}
        <div className="sticky top-0 z-20 mb-4">
          <div className="flex items-center justify-between bg-[var(--bg-card)]
            border border-[var(--border-primary)]
            rounded-xl px-4 py-3 shadow-sm backdrop-blur">
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-[var(--hover-bg)]"
              >
                ☰
              </button>
              <div>
                <div className="text-sm font-semibold">Admin Panel</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {admin?.email}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="px-3 py-2 rounded-lg border border-[var(--border-primary)]
                hover:bg-[var(--hover-bg)] transition"
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>

              <button
                onClick={logout}
                className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500
                hover:bg-red-500 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};

/* =========================
   ROUTES
========================= */
function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Shell><Dashboard /></Shell>} />
        <Route path="/admin/b2b" element={<Shell><B2B /></Shell>} />
        <Route path="/admin/categories" element={<Shell><Categories /></Shell>} />
        <Route path="/admin/subcategories" element={<Shell><Subcategories /></Shell>} />
        <Route path="/admin/products" element={<Shell><Products /></Shell>} />
        <Route path="/admin/related-products" element={<Shell><RelatedProducts /></Shell>} />
        <Route path="/admin/raw-materials" element={<Shell><RawMaterials /></Shell>} />
        <Route path="/admin/vendors" element={<Shell><Vendors /></Shell>} />
        <Route path="/admin/vendor-purchases" element={<Shell><VendorPurchases /></Shell>} />
        <Route path="/admin/manufacturing" element={<Shell><Manufacturing /></Shell>} />
        <Route path="/admin/bundle-discounts" element={<Shell><BundleDiscounts /></Shell>} />
        <Route path="/admin/product-discounts" element={<Shell><ProductDiscounts /></Shell>} />
        <Route path="/admin/roles" element={<Shell><Roles /></Shell>} />
        <Route path="/admin/screens" element={<Shell><Screens /></Shell>} />
        <Route path="/admin/user-roles" element={<Shell><UserRoles /></Shell>} />
        <Route path="/admin/analytics" element={<Shell><Analytics /></Shell>} />
        <Route path="/admin/leads" element={<Shell><Leads /></Shell>} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
