import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    isActive: true
  });

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Fetch Data
  const loadData = async () => {
    try {
      const [subRes, catRes] = await Promise.all([
        api.get("/admin/subcategories"),
        api.get("/admin/categories")
      ]);
      
      setSubcategories(safeExtract(subRes, "subCategories") || safeExtract(subRes, "data"));
      setCategories(safeExtract(catRes, "categories") || safeExtract(catRes, "data"));
      setError("");
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/admin/subcategories/${editingId}`, formData);
        alert("Subcategory Updated!");
      } else {
        await api.post("/admin/subcategories", formData);
        alert("Subcategory Created!");
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || "Operation failed");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await api.delete(`/admin/subcategories/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete subcategory");
    }
  };

  // Helpers
  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description || "",
      category_id: item.category_id?._id || item.category_id || "",
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", category_id: "", isActive: true });
    setError("");
  };

  if (loading) return <div className="p-6 text-[var(--text-muted)]">Loading Configuration...</div>;

  return (
    <PermissionGate routeName="SUBCATEGORY_VIEW">
      <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Subcategories</h1>
          <PermissionGate routeName="SUBCATEGORY_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
            >
              + Add Subcategory
            </button>
          </PermissionGate>
        </div>

        {error && <div className="bg-red-500/10 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded border border-red-500/50 dark:border-red-900/50">{error}</div>}

        {/* DATA TABLE */}
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] overflow-hidden shadow-xl">
          <div className="table-wrapper overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)] min-w-[700px]">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] uppercase font-medium">
                <tr>
                  <th className="p-3 lg:p-4">Subcategory Name</th>
                  <th className="p-3 lg:p-4">Parent Category</th>
                  <th className="p-3 lg:p-4">Description</th>
                  <th className="p-3 lg:p-4">Status</th>
                  <th className="p-3 lg:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-[var(--text-muted)]">No subcategories found.</td></tr>
                ) : subcategories.map((item) => (
                  <tr key={item._id} className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition">
                    <td className="p-3 lg:p-4 font-medium text-[var(--text-primary)]">{item.name}</td>
                    <td className="p-3 lg:p-4">
                      <span className="bg-[var(--bg-tertiary)] text-blue-500 dark:text-blue-400 px-2 py-1 rounded text-xs border border-[var(--border-primary)]">
                          {item.category_id?.name || "No Parent"}
                      </span>
                    </td>
                    <td className="p-3 lg:p-4">{item.description || "-"}</td>
                    <td className="p-3 lg:p-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${item.isActive ? "bg-green-500/10 dark:bg-green-900/30 text-green-600 dark:text-green-300 border border-green-500/50 dark:border-green-900" : "bg-red-500/10 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-500/50 dark:border-red-900"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 lg:p-4 text-right space-x-3">
                      <PermissionGate routeName="SUBCATEGORY_UPDATE">
                        <button onClick={() => openEditModal(item)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">Edit</button>
                      </PermissionGate>
                      <PermissionGate routeName="SUBCATEGORY_DELETE">
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">Delete</button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-lg p-4 lg:p-6 shadow-2xl my-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                {editingId ? "Edit Subcategory" : "New Subcategory"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
                  <input
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Parent Category</label>
                  <select
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                  <textarea
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                    rows="3"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                  />
                  <label htmlFor="isActive" className="text-[var(--text-secondary)] text-sm cursor-pointer">Active</label>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-primary)]">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500"
                  >
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
};

export default Subcategories;
