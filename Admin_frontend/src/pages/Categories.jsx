import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  
  // State for Editing
  const [editingId, setEditingId] = useState(null); 
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });

  // 1. Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/admin/categories");
      // Safety check for array
      setCategories(res.data || []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Handle Form Submit (Create OR Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        // UPDATE Logic
        await api.put(`/admin/categories/${editingId}`, formData);
        alert("Category Updated!");
      } else {
        // CREATE Logic
        await api.post("/admin/categories", formData);
        alert("Category Created!");
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchCategories(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  // Helper to open modal for editing
  const openEditModal = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", isActive: true });
    setError("");
  };

  return (
    <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Category Management</h1>
        
        <PermissionGate routeName="CATEGORY_CREATE">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-blue-500/20 transition w-full sm:w-auto"
          >
            + Add Category
          </button>
        </PermissionGate>
      </div>

      {error && <div className="bg-red-500/10 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded border border-red-500/50 dark:border-red-900/50">{error}</div>}

      {/* DATA TABLE */}
      <PermissionGate routeName="CATEGORY_VIEW">
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] overflow-hidden shadow-xl">
          <div className="table-wrapper overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)] min-w-[600px]">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] uppercase font-medium">
                <tr>
                  <th className="p-3 lg:p-4">Name</th>
                  <th className="p-3 lg:p-4">Description</th>
                  <th className="p-3 lg:p-4">Status</th>
                  <th className="p-3 lg:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="p-6 text-center text-[var(--text-muted)]">Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-[var(--text-muted)]">No categories found</td></tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition duration-150">
                      <td className="p-3 lg:p-4 font-medium text-[var(--text-primary)]">{cat.name}</td>
                      <td className="p-3 lg:p-4 max-w-xs truncate">{cat.description || "-"}</td>
                      <td className="p-3 lg:p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${cat.isActive ? 'bg-green-500/10 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-500/50 dark:border-green-900' : 'bg-red-500/10 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-500/50 dark:border-red-900'}`}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 lg:p-4 text-right space-x-3">
                        {/* EDIT BUTTON */}
                        <PermissionGate routeName="CATEGORY_UPDATE">
                          <button 
                            onClick={() => openEditModal(cat)}
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition"
                          >
                            Edit
                          </button>
                        </PermissionGate>

                        {/* DELETE BUTTON */}
                        <PermissionGate routeName="CATEGORY_DELETE">
                          <button 
                            onClick={() => handleDelete(cat._id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-medium transition ml-2"
                          >
                            Delete
                          </button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PermissionGate>

      {/* MODAL (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-4 lg:p-6 shadow-2xl my-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2.5 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-600 outline-none transition"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Electronics"
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
                <textarea
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2.5 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-600 outline-none transition"
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Category details..."
                />
              </div>

              <div className="flex items-center gap-2 bg-[var(--bg-input)] p-2 rounded border border-[var(--border-primary)]">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded bg-[var(--bg-secondary)] border-[var(--border-primary)] text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="isActive" className="text-[var(--text-secondary)] text-sm cursor-pointer select-none">
                  Active (Visible to customers)
                </label>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border-primary)]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition shadow-lg shadow-blue-900/20"
                >
                  {editingId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;