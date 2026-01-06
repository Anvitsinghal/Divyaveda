import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg", // Default unit
    current_quantity: 0,
    isActive: true
  });

  // Safe Data Extraction
  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Fetch Data
  const loadData = async () => {
    try {
      const res = await api.get("/admin/raw-materials");
      setMaterials(safeExtract(res, "rawMaterials"));
      setError("");
    } catch (e) {
      setError("Failed to load raw materials");
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
      const payload = {
        ...formData,
        current_quantity: Number(formData.current_quantity)
      };

      if (editingId) {
        await api.put(`/admin/raw-materials/${editingId}`, payload);
        alert("Material Updated Successfully!");
      } else {
        await api.post("/admin/raw-materials", payload);
        alert("Material Created Successfully!");
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
    if (!window.confirm("Delete this material? This might affect manufacturing logs.")) return;
    try {
      await api.delete(`/admin/raw-materials/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete material");
    }
  };

  // Helpers
  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      unit: item.unit,
      current_quantity: item.current_quantity || 0,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", unit: "kg", current_quantity: 0, isActive: true });
    setError("");
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Inventory...</div>;

 return (
  <PermissionGate routeName="RAW_MATERIAL_VIEW">
    <div className="space-y-6 w-full overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">
          Raw Materials Inventory
        </h1>

        <PermissionGate routeName="RAW_MATERIAL_CREATE">
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium w-fit"
          >
            + Add Material
          </button>
        </PermissionGate>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded">
          {error}
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl overflow-x-auto">
        <table className="min-w-[800px] w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
            <tr>
              <th className="p-4">Material Name</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="p-6 text-center text-slate-500"
                >
                  No materials found.
                </td>
              </tr>
            ) : (
              materials.map(m => (
                <tr
                  key={m._id}
                  className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <td className="p-4 font-medium text-white whitespace-nowrap">
                    {m.name}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {m.unit}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        m.current_quantity < 10
                          ? "text-red-400 font-bold"
                          : "text-slate-300"
                      }
                    >
                      {m.current_quantity}
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded ${
                        m.isActive
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}
                    >
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap space-x-3">
                    <PermissionGate routeName="RAW_MATERIAL_UPDATE">
                      <button
                        onClick={() => openEditModal(m)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    </PermissionGate>

                    <PermissionGate routeName="RAW_MATERIAL_DELETE">
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-red-400 hover:text-red-300"
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
            
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? "Edit Material" : "New Material"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Name
                </label>
                <input
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Unit
                  </label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    value={formData.unit}
                    onChange={e =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    value={formData.current_quantity}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        current_quantity: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked
                    })
                  }
                  className="rounded bg-slate-800 border-slate-600"
                />
                <span className="text-slate-300 text-sm">
                  Active
                </span>
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

export default RawMaterials;
