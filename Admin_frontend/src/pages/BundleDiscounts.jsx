import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const BundleDiscounts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    discount_type: "PERCENTAGE",
    discount_value: "",
    min_products: 1,
    valid_from: "",
    valid_to: "",
    isActive: true
  });

  const load = async () => {
    try {
      const res = await api.get("/admin/bundle-discounts");
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
      } else {
        await api.post("/admin/bundle-discounts", payload);
      }

      setIsModalOpen(false);
      resetForm();
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount bundle?")) return;
    await api.delete(`/admin/bundle-discounts/${id}`);
    load();
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      min_products: item.min_products || 1,
      valid_from: item.valid_from ? item.valid_from.split("T")[0] : "",
      valid_to: item.valid_to ? item.valid_to.split("T")[0] : "",
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
      <div className="space-y-6 w-full">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Bundle Discounts</h1>

          <PermissionGate routeName="BUNDLE_DISCOUNT_CREATE">
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium w-fit"
            >
              + Create Bundle
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
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-[var(--bg-muted)] text-left">
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-[var(--text-muted)]">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-[var(--text-muted)]">
                    No bundles found
                  </td>
                </tr>
              ) : (
                items.map(d => (
                  <tr
                    key={d._id}
                    className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
                  >
                    <td className="p-4 font-medium whitespace-nowrap">
                      {d.name}
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-2 py-1 rounded text-xs bg-[var(--hover-bg)]">
                        {d.discount_type}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-green-600 whitespace-nowrap">
                      {d.discount_type === "PERCENTAGE"
                        ? `${d.discount_value}%`
                        : `$${d.discount_value}`}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {d.min_products}
                    </td>

                    <td className="p-4 text-xs whitespace-nowrap">
                      {d.valid_from
                        ? new Date(d.valid_from).toLocaleDateString()
                        : "Any"}
                      {" "}–{" "}
                      {d.valid_to
                        ? new Date(d.valid_to).toLocaleDateString()
                        : "Any"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          d.isActive
                            ? "bg-green-500/15 text-green-600"
                            : "bg-red-500/15 text-red-600"
                        }`}
                      >
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <PermissionGate routeName="BUNDLE_DISCOUNT_UPDATE">
                        <button
                          onClick={() => openEditModal(d)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </PermissionGate>

                      <PermissionGate routeName="BUNDLE_DISCOUNT_DELETE">
                        <button
                          onClick={() => handleDelete(d._id)}
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
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Bundle" : "New Bundle"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                  placeholder="Bundle name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={formData.discount_type}
                    onChange={e =>
                      setFormData({ ...formData, discount_type: e.target.value })
                    }
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount</option>
                  </select>

                  <input
                    type="number"
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    placeholder="Discount value"
                    value={formData.discount_value}
                    onChange={e =>
                      setFormData({ ...formData, discount_value: e.target.value })
                    }
                    required
                  />
                </div>

                <input
                  type="number"
                  className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                  placeholder="Minimum products"
                  value={formData.min_products}
                  onChange={e =>
                    setFormData({ ...formData, min_products: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={formData.valid_from}
                    onChange={e =>
                      setFormData({ ...formData, valid_from: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={formData.valid_to}
                    onChange={e =>
                      setFormData({ ...formData, valid_to: e.target.value })
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

