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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Category Management</h1>
        
        <PermissionGate routeName="CATEGORY_CREATE">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-blue-500/20 transition"
          >
            + Add Category
          </button>
        </PermissionGate>
      </div>

      {error && <div className="bg-red-900/20 text-red-400 p-3 rounded border border-red-900/50">{error}</div>}

      {/* DATA TABLE */}
      <PermissionGate routeName="CATEGORY_VIEW">
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-6 text-center text-slate-500">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-slate-500">No categories found</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="border-t border-slate-800 hover:bg-slate-800/50 transition duration-150">
                    <td className="p-4 font-medium text-white">{cat.name}</td>
                    <td className="p-4 max-w-xs truncate">{cat.description || "-"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${cat.isActive ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      {/* EDIT BUTTON */}
                      <PermissionGate routeName="CATEGORY_UPDATE">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="text-blue-400 hover:text-blue-300 font-medium transition"
                        >
                          Edit
                        </button>
                      </PermissionGate>

                      {/* DELETE BUTTON */}
                      <PermissionGate routeName="CATEGORY_DELETE">
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="text-red-400 hover:text-red-300 font-medium transition ml-2"
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
      </PermissionGate>

      {/* MODAL (Create & Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Electronics"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Category details..."
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="isActive" className="text-slate-300 text-sm cursor-pointer select-none">
                  Active (Visible to customers)
                </label>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
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