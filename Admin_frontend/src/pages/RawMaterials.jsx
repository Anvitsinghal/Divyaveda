import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    current_quantity: 0,
    isActive: true
  });

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  const loadData = async () => {
    try {
      const res = await api.get("/admin/raw-materials");
      setMaterials(safeExtract(res, "rawMaterials"));
      setError("");
    } catch {
      setError("Failed to load raw materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      } else {
        await api.post("/admin/raw-materials", payload);
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    await api.delete(`/admin/raw-materials/${id}`);
    loadData();
  };

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

  if (loading) {
    return <div className="p-6 text-[var(--text-muted)]">Loading inventory…</div>;
  }

  return (
    <PermissionGate routeName="RAW_MATERIAL_VIEW">
      <div className="space-y-6 w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">
            Raw Materials Inventory
          </h1>

          <PermissionGate routeName="RAW_MATERIAL_CREATE">
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium w-fit"
            >
              + Add Material
            </button>
          </PermissionGate>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-[var(--bg-muted)] text-left">
              <tr>
                <th className="p-4">Material</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-[var(--text-muted)]">
                    No materials found
                  </td>
                </tr>
              ) : (
                materials.map(m => (
                  <tr
                    key={m._id}
                    className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
                  >
                    <td className="p-4 font-medium whitespace-nowrap">
                      {m.name}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {m.unit}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          m.current_quantity < 10
                            ? "text-red-500 font-semibold"
                            : "text-[var(--text-secondary)]"
                        }
                      >
                        {m.current_quantity}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                          m.isActive
                            ? "bg-green-500/15 text-green-600"
                            : "bg-red-500/15 text-red-600"
                        }`}
                      >
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <PermissionGate routeName="RAW_MATERIAL_UPDATE">
                        <button
                          onClick={() => openEditModal(m)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </PermissionGate>

                      <PermissionGate routeName="RAW_MATERIAL_DELETE">
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="text-red-500 hover:underline"
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
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Material" : "New Material"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                  placeholder="Material name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    placeholder="Unit"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  />

                  <input
                    type="number"
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    placeholder="Stock"
                    value={formData.current_quantity}
                    onChange={e =>
                      setFormData({ ...formData, current_quantity: e.target.value })
                    }
                  />
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>

                <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-[var(--border-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white"
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
