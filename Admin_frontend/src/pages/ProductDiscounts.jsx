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
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  const loadProductDiscounts = async (productId) => {
    if (!productId) { setActiveMappings([]); return; }
    try {
      const res = await api.get(`/admin/product-bundle-discounts/${productId}`);
      setActiveMappings(safeExtract(res, "discounts"));
    } catch (e) {
      setActiveMappings([]);
    }
  };

  useEffect(() => { loadProductDiscounts(selectedProductId); }, [selectedProductId]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !selectedBundleId) return;

    try {
      // NOW SECURE: Backend accepts 'bundle_id' correctly
      await api.post("/admin/product-bundle-discounts", {
        product_id: selectedProductId,
        bundle_id: selectedBundleId 
      });
      
      alert("Discount Applied!");
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
    } catch (e) {
      alert("Failed to remove");
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading...</div>;

  return (
    <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_VIEW">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Product Discounts</h1>
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <label className="block text-sm text-slate-400 mb-2">Select Product</label>
          <select
            className="w-full md:w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProductId && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-200">Active Bundles</h2>
              <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_CREATE">
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
                  + Add Bundle
                </button>
              </PermissionGate>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-slate-200 uppercase">
                  <tr>
                    <th className="p-4">Bundle</th>
                    <th className="p-4">Value</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMappings.map((map) => (
                    <tr key={map._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 text-white">{map.bundle_id?.name || "Unknown"}</td>
                      <td className="p-4 text-green-400">
                        {map.bundle_id?.discount_value}
                        {map.bundle_id?.discount_type === 'PERCENTAGE' ? '%' : '$'}
                      </td>
                      <td className="p-4 text-right">
                        <PermissionGate routeName="PRODUCT_BUNDLE_DISCOUNT_DELETE">
                          <button onClick={() => handleRemove(map._id)} className="text-red-400 hover:text-red-300">Remove</button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                  {activeMappings.length === 0 && <tr><td colSpan="3" className="p-6 text-center">No bundles applied</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-white mb-4">Select Bundle</h3>
              <form onSubmit={handleApply} className="space-y-4">
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  value={selectedBundleId}
                  onChange={(e) => setSelectedBundleId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Bundle --</option>
                  {discounts.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.discount_value}{d.discount_type === 'PERCENTAGE' ? '%' : '$'})</option>
                  ))}
                </select>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Apply</button>
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
