import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const RelatedProducts = () => {
  const [products, setProducts] = useState([]);
  const [relations, setRelations] = useState([]);
  
  // Selection State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [targetProductId, setTargetProductId] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Load All Products
  const loadProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(safeExtract(res, "products"));
    } catch (e) {
      setError("Unable to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Load Relations for Specific Product
  const loadRelations = async (id) => {
    if (!id) {
      setRelations([]);
      return;
    }
    try {
      // Endpoint: GET /admin/related-products/:productId
      const res = await api.get(`/admin/related-products/${id}`);
      setRelations(safeExtract(res, "relatedProducts")); 
    } catch {
      setRelations([]);
    }
  };

  // Auto-load when selection changes
  useEffect(() => {
    loadRelations(selectedProductId);
  }, [selectedProductId]);

  // 3. Handle Add Relation
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !targetProductId) return;

    try {
      await api.post("/admin/related-products", {
        product_id: selectedProductId,
        related_product_id: targetProductId
      });
      
      alert("Relation Added!");
      setIsModalOpen(false);
      setTargetProductId("");
      loadRelations(selectedProductId); // Refresh
    } catch (e) {
      alert(e.response?.data?.message || "Failed to add relation");
    }
  };

  // 4. Handle Delete Relation
  const handleDelete = async (relationId) => {
    if (!window.confirm("Remove this related product?")) return;
    try {
      await api.delete(`/admin/related-products/${relationId}`);
      loadRelations(selectedProductId); // Refresh
    } catch (e) {
      alert("Failed to remove relation");
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Inventory...</div>;

  return (
    <PermissionGate routeName="RELATED_PRODUCT_VIEW">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Manage Related Products</h1>
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: SELECT BASE PRODUCT */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 h-fit">
            <h2 className="text-lg font-semibold text-white mb-4">1. Select Base Product</h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm mb-2"
              />
              {products.map((p) => (
                <div 
                  key={p._id}
                  onClick={() => setSelectedProductId(p._id)}
                  className={`p-3 rounded-lg cursor-pointer border transition flex items-center gap-3
                    ${selectedProductId === p._id 
                      ? "bg-blue-900/30 border-blue-500" 
                      : "bg-slate-950 border-slate-800 hover:border-slate-600"}`}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                    {p.main_image && <img src={p.main_image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white line-clamp-1">{p.name}</div>
                    <div className="text-xs text-slate-500">${p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: MANAGE RELATIONS */}
          <div className="md:col-span-2 space-y-4">
            {selectedProductId ? (
              <>
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Related Items</h2>
                    <p className="text-xs text-slate-400">Products recommended alongside selected item</p>
                  </div>
                  <PermissionGate routeName="RELATED_PRODUCT_CREATE">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      + Add Related Item
                    </button>
                  </PermissionGate>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relations.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 py-10 bg-slate-900 rounded-xl border border-slate-800 border-dashed">
                      No related products assigned yet.
                    </div>
                  )}
                  
                  {relations.map((rel) => {
                    const product = rel.related_product_id; // The populated object
                    if (!product) return null; // Safety check

                    return (
                      <div key={rel._id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 relative group">
                        <PermissionGate routeName="RELATED_PRODUCT_DELETE">
                          <button 
                            onClick={() => handleDelete(rel._id)}
                            className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-lg z-10"
                            title="Remove Relation"
                          >
                            ×
                          </button>
                        </PermissionGate>
                        
                        <div className="aspect-square bg-slate-950 rounded-lg mb-3 overflow-hidden">
                          {product.main_image ? (
                             <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs">No Image</div>
                          )}
                        </div>
                        
                        <div className="font-medium text-white text-sm line-clamp-1">{product.name}</div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-slate-500">{product.category_id?.name || "No Category"}</span>
                          <span className="text-xs font-bold text-green-400">${product.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed p-10">
                <span className="text-4xl mb-2">👈</span>
                <p>Select a product from the left list to manage its relations.</p>
              </div>
            )}
          </div>

        </div>

        {/* MODAL: ADD RELATION */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Add Related Product</h3>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Choose Product to Link</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Product --</option>
                    {products
                      .filter(p => p._id !== selectedProductId) // Don't allow linking to itself
                      // Optional: Filter out products already linked
                      .filter(p => !relations.some(r => r.related_product_id?._id === p._id))
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} (${p.price})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium"
                  >
                    Add Link
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
