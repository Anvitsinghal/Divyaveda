import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";
import api from "../api/axios";

const Dashboard = () => {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    categories: 0,
    activeBundles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel data fetching for dashboard speed
        const [prodRes, catRes, bundleRes] = await Promise.all([
            api.get("/admin/products"),
            api.get("/admin/categories"),
            api.get("/admin/bundle-discounts")
        ]);

        // Handle various response structures ( { data: [...] } vs [...] )
        const products = prodRes.data.products || prodRes.data || [];
        const categories = catRes.data || [];
        const bundles = bundleRes.data.bundleDiscounts || bundleRes.data || [];

        setStats({
            products: products.length,
            lowStock: products.filter(p => (p.stock_quantity || 0) < 10).length,
            categories: categories.length,
            activeBundles: bundles.filter(b => b.isActive).length
        });
      } catch (e) {
        console.error("Dashboard stats failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Overview for <span className="text-blue-500 dark:text-blue-400">{admin?.email}</span>
          </p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm">
           Role: <span className="text-[var(--text-primary)] font-semibold">{admin?.isSuperAdmin ? "Super Admin" : "Staff"}</span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Card 1: Total Products */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 lg:p-6 relative overflow-hidden group hover:border-[var(--border-hover)] transition">
            <div className="absolute right-0 top-0 p-4 lg:p-6 opacity-10 group-hover:opacity-20 transition">
                <span className="text-4xl lg:text-6xl font-bold text-blue-500">P</span>
            </div>
            <div className="text-[var(--text-secondary)] text-sm font-medium">Total Products</div>
            <div className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mt-2">
                {loading ? "..." : stats.products}
            </div>
            <Link to="/admin/products" className="text-blue-500 dark:text-blue-400 text-sm mt-4 inline-block hover:underline">
                View Inventory &rarr;
            </Link>
        </div>

        {/* Card 2: Low Stock Alert */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 lg:p-6 relative overflow-hidden group hover:border-[var(--border-hover)] transition">
            <div className="absolute right-0 top-0 p-4 lg:p-6 opacity-10 group-hover:opacity-20 transition">
                <span className="text-4xl lg:text-6xl font-bold text-red-500">!</span>
            </div>
            <div className="text-[var(--text-secondary)] text-sm font-medium">Low Stock Items</div>
            <div className={`text-3xl lg:text-4xl font-bold mt-2 ${stats.lowStock > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                {loading ? "..." : stats.lowStock}
            </div>
            <div className="text-[var(--text-muted)] text-xs mt-4">
                Items with &lt; 10 qty
            </div>
        </div>

        {/* Card 3: Categories */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 lg:p-6 hover:border-[var(--border-hover)] transition">
            <div className="text-[var(--text-secondary)] text-sm font-medium">Active Categories</div>
            <div className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mt-2">
                {loading ? "..." : stats.categories}
            </div>
            <Link to="/admin/categories" className="text-blue-500 dark:text-blue-400 text-sm mt-4 inline-block hover:underline">
                Manage Categories &rarr;
            </Link>
        </div>

        {/* Card 4: Bundles */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-4 lg:p-6 hover:border-[var(--border-hover)] transition">
            <div className="text-[var(--text-secondary)] text-sm font-medium">Active Bundles</div>
            <div className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mt-2">
                {loading ? "..." : stats.activeBundles}
            </div>
            <Link to="/admin/bundle-discounts" className="text-blue-500 dark:text-blue-400 text-sm mt-4 inline-block hover:underline">
                View Promos &rarr;
            </Link>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
             <Link to="/admin/products" className="p-3 lg:p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] rounded-xl text-center transition">
                 <span className="block text-blue-500 dark:text-blue-400 font-bold mb-1 text-sm lg:text-base">+ New Product</span>
                 <span className="text-xs text-[var(--text-muted)]">Add to inventory</span>
             </Link>
             <Link to="/admin/categories" className="p-3 lg:p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] rounded-xl text-center transition">
                 <span className="block text-purple-500 dark:text-purple-400 font-bold mb-1 text-sm lg:text-base">+ Category</span>
                 <span className="text-xs text-[var(--text-muted)]">Organize items</span>
             </Link>
             <Link to="/admin/analytics" className="p-3 lg:p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] rounded-xl text-center transition">
                 <span className="block text-green-500 dark:text-green-400 font-bold mb-1 text-sm lg:text-base">Analytics</span>
                 <span className="text-xs text-[var(--text-muted)]">Check traffic</span>
             </Link>
             <Link to="/admin/user-roles" className="p-3 lg:p-4 bg-[var(--bg-card)] border border-[var(--border-primary)] hover:bg-[var(--hover-bg)] rounded-xl text-center transition">
                 <span className="block text-orange-500 dark:text-orange-400 font-bold mb-1 text-sm lg:text-base">Users</span>
                 <span className="text-xs text-[var(--text-muted)]">Manage access</span>
             </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;