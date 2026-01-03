import { Routes, Route, Link, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGate from "./components/PermissionGate";
import { useAdminAuth } from "./context/AuthContext";

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
  
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-slate-800">
          <div className="font-bold text-lg text-white tracking-wide">Admin Panel</div>
          <div className="text-xs text-slate-500 mt-1">{admin?.email}</div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm text-slate-300">
          <Link to="/admin" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Dashboard
          </Link>

          {/* CATALOG MANAGEMENT */}
          <div className="pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog</div>
          <PermissionGate routeName="CATEGORY_VIEW">
            <Link to="/admin/categories" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Categories</Link>
          </PermissionGate>
          <PermissionGate routeName="SUBCATEGORY_VIEW">
            <Link to="/admin/subcategories" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Subcategories</Link>
          </PermissionGate>
          <PermissionGate routeName="PRODUCT_VIEW">
            <Link to="/admin/products" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Products</Link>
          </PermissionGate>
          <PermissionGate routeName="RELATED_PRODUCT_VIEW">
            <Link to="/admin/related-products" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Related Products</Link>
          </PermissionGate>

          {/* INVENTORY & MANUFACTURING */}
          <div className="pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory</div>
          <PermissionGate routeName="RAW_MATERIAL_VIEW">
            <Link to="/admin/raw-materials" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Raw Materials</Link>
          </PermissionGate>
          <PermissionGate routeName="MANUFACTURING_VIEW">
            <Link to="/admin/manufacturing" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Manufacturing</Link>
          </PermissionGate>
          <PermissionGate routeName="VENDOR_VIEW">
            <Link to="/admin/vendors" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Vendors</Link>
          </PermissionGate>
          <PermissionGate routeName="VENDOR_PURCHASE_VIEW">
            <Link to="/admin/vendor-purchases" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Purchases</Link>
          </PermissionGate>

          {/* OFFERS */}
          <div className="pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Offers</div>
          <PermissionGate routeName="BUNDLE_DISCOUNT_VIEW">
            <Link to="/admin/bundle-discounts" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Bundle Discounts</Link>
          </PermissionGate>
          <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_VIEW">
            <Link to="/admin/product-discounts" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Product Discounts</Link>
          </PermissionGate>

          {/* SYSTEM */}
          <div className="pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</div>
          <PermissionGate routeName="ANALYTICS_USER_VIEW">
            <Link to="/admin/analytics" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Analytics</Link>
          </PermissionGate>
          <PermissionGate routeName="USER_ROLE_VIEW">
            <Link to="/admin/user-roles" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">User Roles</Link>
          </PermissionGate>
          <PermissionGate routeName="ROLE_VIEW">
            <Link to="/admin/roles" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Role Definitions</Link>
          </PermissionGate>
          <PermissionGate routeName="SCREEN_VIEW">
            <Link to="/admin/screens" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">Screen Config</Link>
          </PermissionGate>

          <PermissionGate routeName="LEAD_VIEW">
  <Link to="/admin/leads" className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
    Lead Management
  </Link>
</PermissionGate>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout} 
            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 overflow-y-auto h-screen bg-slate-950">
        {children}
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