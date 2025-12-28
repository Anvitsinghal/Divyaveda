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

  if (loading) return <div className="p-6 text-slate-400">Loading Configuration...</div>;

  return (
    <PermissionGate routeName="SUBCATEGORY_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Subcategories</h1>
          <PermissionGate routeName="SUBCATEGORY_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Add Subcategory
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* DATA TABLE */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Subcategory Name</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500">No subcategories found.</td></tr>
              ) : subcategories.map((item) => (
                <tr key={item._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{item.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 text-blue-300 px-2 py-1 rounded text-xs">
                        {item.category_id?.name || "No Parent"}
                    </span>
                  </td>
                  <td className="p-4">{item.description || "-"}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${item.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <PermissionGate routeName="SUBCATEGORY_UPDATE">
                      <button onClick={() => openEditModal(item)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    </PermissionGate>
                    <PermissionGate routeName="SUBCATEGORY_DELETE">
                      <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? "Edit Subcategory" : "New Subcategory"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Parent Category</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
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
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
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
                    className="rounded bg-slate-800 border-slate-600"
                  />
                  <label htmlFor="isActive" className="text-slate-300 text-sm cursor-pointer">Active</label>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
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
