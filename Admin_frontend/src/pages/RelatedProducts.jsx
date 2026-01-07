import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const RelatedProducts = () => {
  const [products, setProducts] = useState([]);
  const [relations, setRelations] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [targetProductId, setTargetProductId] = useState("");

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  const loadProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(safeExtract(res, "products"));
    } catch {
      setError("Unable to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadRelations = async (id) => {
    if (!id) return setRelations([]);
    try {
      const res = await api.get(`/admin/related-products/${id}`);
      setRelations(safeExtract(res, "relatedProducts"));
    } catch {
      setRelations([]);
    }
  };

  useEffect(() => {
    loadRelations(selectedProductId);
  }, [selectedProductId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/related-products", {
        product_id: selectedProductId,
        related_product_id: targetProductId,
      });
      setIsModalOpen(false);
      setTargetProductId("");
      loadRelations(selectedProductId);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to add relation");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this related product?")) return;
    await api.delete(`/admin/related-products/${id}`);
    loadRelations(selectedProductId);
  };

  if (loading) return <div className="p-6 text-[var(--text-muted)]">Loading…</div>;

  return (
    <PermissionGate routeName="RELATED_PRODUCT_VIEW">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Related Products</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
            <h2 className="font-semibold mb-3">Select Base Product</h2>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedProductId(p._id)}
                  className={`flex gap-3 items-center p-3 rounded-lg cursor-pointer border transition
                    ${
                      selectedProductId === p._id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-[var(--border-primary)] hover:bg-[var(--hover-bg)]"
                    }`}
                >
                  <div className="w-10 h-10 rounded bg-[var(--bg-muted)] overflow-hidden">
                    {p.main_image && (
                      <img src={p.main_image} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">₹{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedProductId ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] border border-dashed rounded-xl p-10">
                👈 Select a product
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4">
                  <div>
                    <h2 className="font-semibold">Related Items</h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Shown on product detail page
                    </p>
                  </div>
                  <PermissionGate routeName="RELATED_PRODUCT_CREATE">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
                    >
                      + Add
                    </button>
                  </PermissionGate>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {relations.length === 0 && (
                    <div className="col-span-full text-center text-[var(--text-muted)] border border-dashed rounded-xl py-10">
                      No related products
                    </div>
                  )}

                  {relations.map((rel) => {
                    const product = rel.related_product_id;
                    if (!product) return null;

                    return (
                      <div
                        key={rel._id}
                        className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-3 relative group"
                      >
                        <PermissionGate routeName="RELATED_PRODUCT_DELETE">
                          <button
                            onClick={() => handleDelete(rel._id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </PermissionGate>

                        <div className="aspect-square rounded-lg bg-[var(--bg-muted)] overflow-hidden mb-2">
                          {product.main_image && (
                            <img
                              src={product.main_image}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="text-sm font-medium line-clamp-1">
                          {product.name}
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-[var(--text-muted)]">
                            {product.category_id?.name || "—"}
                          </span>
                          <span className="font-semibold text-green-500">
                            ₹{product.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-md p-6">
              <h3 className="font-bold mb-4">Add Related Product</h3>

              <form onSubmit={handleAdd} className="space-y-4">
                <select
                  className="w-full p-2 rounded-lg border border-[var(--border-primary)] bg-transparent"
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products
                    .filter((p) => p._id !== selectedProductId)
                    .filter(
                      (p) =>
                        !relations.some(
                          (r) => r.related_product_id?._id === p._id
                        )
                    )
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                </select>

                <div className="flex gap-3">
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
                    Add
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

export default RelatedProducts;
