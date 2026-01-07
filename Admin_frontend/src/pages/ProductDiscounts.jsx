import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const ProductDiscounts = () => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [activeMappings, setActiveMappings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  const loadInitialData = async () => {
    try {
      const [prodRes, disRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/admin/bundle-discounts")
      ]);
      setProducts(safeExtract(prodRes, "products"));
      setDiscounts(safeExtract(disRes, "bundleDiscounts"));
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadProductDiscounts = async (productId) => {
    if (!productId) {
      setActiveMappings([]);
      return;
    }
    try {
      const res = await api.get(
        `/admin/product-bundle-discounts/${productId}`
      );
      setActiveMappings(safeExtract(res, "discounts"));
    } catch {
      setActiveMappings([]);
    }
  };

  useEffect(() => {
    loadProductDiscounts(selectedProductId);
  }, [selectedProductId]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !selectedBundleId) return;

    try {
      await api.post("/admin/product-bundle-discounts", {
        product_id: selectedProductId,
        bundle_id: selectedBundleId
      });

      setIsModalOpen(false);
      setSelectedBundleId("");
      loadProductDiscounts(selectedProductId);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to apply discount");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove discount?")) return;
    try {
      await api.delete(`/admin/product-bundle-discounts/${id}`);
      loadProductDiscounts(selectedProductId);
    } catch {
      alert("Failed to remove");
    }
  };

  if (loading) {
    return <div className="p-6 text-[var(--text-muted)]">Loading…</div>;
  }

  return (
    <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_VIEW">
      <div className="space-y-6 w-full">

        <h1 className="text-2xl font-bold">
          Product Discounts
        </h1>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* PRODUCT SELECT */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Select Product
          </label>
          <select
            className="w-full sm:w-1/2 border border-[var(--border-primary)] rounded-lg px-4 py-2 bg-transparent"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Choose product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* ACTIVE BUNDLES */}
        {selectedProductId && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Active Bundles
              </h2>

              <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_CREATE">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white w-fit"
                >
                  + Add Bundle
                </button>
              </PermissionGate>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl overflow-x-auto">
              <table className="min-w-[600px] w-full text-sm">
                <thead className="bg-[var(--bg-muted)] text-left">
                  <tr>
                    <th className="p-4">Bundle</th>
                    <th className="p-4">Value</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMappings.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-[var(--text-muted)]">
                        No bundles applied
                      </td>
                    </tr>
                  ) : (
                    activeMappings.map((map) => (
                      <tr
                        key={map._id}
                        className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition"
                      >
                        <td className="p-4 font-medium whitespace-nowrap">
                          {map.bundle_id?.name || "Unknown"}
                        </td>
                        <td className="p-4 text-green-600 font-semibold whitespace-nowrap">
                          {map.bundle_id?.discount_value}
                          {map.bundle_id?.discount_type === "PERCENTAGE"
                            ? "%"
                            : "$"}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_DELETE">
                            <button
                              onClick={() => handleRemove(map._id)}
                              className="text-red-500 hover:underline"
                            >
                              Remove
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
        )}

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">
                Select Bundle
              </h3>

              <form onSubmit={handleApply} className="space-y-4">
                <select
                  className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                  value={selectedBundleId}
                  onChange={(e) => setSelectedBundleId(e.target.value)}
                  required
                >
                  <option value="">Choose bundle</option>
                  {discounts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.discount_value}
                      {d.discount_type === "PERCENTAGE" ? "%" : "$"})
                    </option>
                  ))}
                </select>

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
                    Apply
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

export default ProductDiscounts;
