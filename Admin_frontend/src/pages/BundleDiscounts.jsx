import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const BundleDiscounts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    discount_type: "PERCENTAGE", // Default to valid enum
    discount_value: "",
    min_products: 1, // Matches model field 'min_products'
    valid_from: "",
    valid_to: "",
    isActive: true
  });

  // 1. Fetch Data
  const load = async () => {
    try {
      const res = await api.get("/admin/bundle-discounts");
      // Safe extract
      setItems(res.data.bundleDiscounts || res.data || []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load discounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 2. Handle Submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...formData,
        discount_value: Number(formData.discount_value),
        min_products: Number(formData.min_products || 1)
      };

      if (editingId) {
        await api.put(`/admin/bundle-discounts/${editingId}`, payload);
        alert("Discount Updated!");
      } else {
        await api.post("/admin/bundle-discounts", payload);
        alert("Discount Created!");
      }

      setIsModalOpen(false);
      resetForm();
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Operation failed");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount bundle?")) return;
    try {
      await api.delete(`/admin/bundle-discounts/${id}`);
      load();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  // Helper: Open Modal
  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      min_products: item.min_products || 1,
      valid_from: item.valid_from ? item.valid_from.split('T')[0] : "",
      valid_to: item.valid_to ? item.valid_to.split('T')[0] : "",
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      discount_type: "PERCENTAGE",
      discount_value: "",
      min_products: 1,
      valid_from: "",
      valid_to: "",
      isActive: true
    });
    setError("");
  };

  return (
    <PermissionGate routeName="BUNDLE_DISCOUNT_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Bundle Discounts</h1>
          <PermissionGate routeName="BUNDLE_DISCOUNT_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Create Bundle
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">{error}</div>}

        {/* TABLE LAYOUT */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Qty</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td className="p-4">Loading...</td></tr> : items.map((d) => (
                <tr key={d._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{d.name}</td>
                  <td className="p-4">
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">{d.discount_type}</span>
                  </td>
                  <td className="p-4 text-green-400 font-bold">
                    {d.discount_type === 'PERCENTAGE' ? `${d.discount_value}%` : `$${d.discount_value}`}
                  </td>
                  <td className="p-4">{d.min_products}</td>
                  <td className="p-4 text-xs">
                    {d.valid_from ? new Date(d.valid_from).toLocaleDateString() : 'Any'} - <br/>
                    {d.valid_to ? new Date(d.valid_to).toLocaleDateString() : 'Any'}
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs ${d.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {d.isActive ? "Active" : "Inactive"}
                     </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <PermissionGate routeName="BUNDLE_DISCOUNT_UPDATE">
                      <button 
                        onClick={() => openEditModal(d)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    </PermissionGate>
                    <PermissionGate routeName="BUNDLE_DISCOUNT_DELETE">
                      <button 
                        onClick={() => handleDelete(d._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? "Edit Bundle" : "New Bundle"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bundle Name</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Type</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.discount_type}
                      onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Value</label>
                    <input
                      type="number"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.discount_value}
                      onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Min Products required in cart</label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    value={formData.min_products}
                    onChange={e => setFormData({ ...formData, min_products: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Valid From</label>
                    <input
                      type="date"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.valid_from}
                      onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Valid To</label>
                    <input
                      type="date"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.valid_to}
                      onChange={e => setFormData({ ...formData, valid_to: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="isActive" className="text-slate-300 text-sm">Active</label>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded hover:bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-medium"
                  >
                    {editingId ? "Update Bundle" : "Create Bundle"}
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

export default BundleDiscounts;