import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Manufacturing = () => {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    product_id: "",
    material_id: "",
    quantity_used: "",     // FIXED: Matches Mongoose model
    manufactured_qty: ""   // FIXED: Matches Mongoose model
  });

  // Safe Data Extraction
  const safeExtract = (res, key) => res.data[key] || res.data || [];

  const load = async () => {
    try {
      const [logRes, prodRes, matRes] = await Promise.all([
        api.get("/admin/manufacturing"),
        api.get("/admin/products"),
        api.get("/admin/raw-materials")
      ]);

      setLogs(safeExtract(logRes, "logs")); // Adjust based on backend response structure
      setProducts(safeExtract(prodRes, "products"));
      setMaterials(safeExtract(matRes, "rawMaterials"));
      setError("");
    } catch (e) {
      setError("Unable to load manufacturing data");
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
      await api.post("/admin/manufacturing", {
        ...form,
        quantity_used: Number(form.quantity_used),
        manufactured_qty: Number(form.manufactured_qty)
      });
      
      // Reset Form
      setForm({
        product_id: "",
        material_id: "",
        quantity_used: "",
        manufactured_qty: ""
      });
      alert("Production Logged Successfully!");
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to log production");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this log? This should reverse stock changes.")) return;
    try {
      await api.delete(`/admin/manufacturing/${id}`);
      load();
    } catch (e) {
      alert("Failed to delete log");
    }
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Manufacturing Data...</div>;

  return (
    <PermissionGate routeName="MANUFACTURING_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Manufacturing Logs</h1>
          <div className="text-sm text-slate-400">Total Records: {logs.length}</div>
        </div>
        
        {error && <div className="text-red-400 bg-red-900/20 p-3 rounded border border-red-900/50">{error}</div>}
        
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* LEFT: LOG LIST */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {logs.length === 0 && <div className="text-slate-500 text-center py-4">No production logs found.</div>}
            {logs.map((log) => (
              <div key={log._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-start">
                <div>
                  <div className="text-white font-semibold text-lg">
                    {log.product_id?.name || "Unknown Product"}
                  </div>
                  <div className="text-green-400 font-mono text-sm">
                    Produced: +{log.manufactured_qty} units
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Used: {log.quantity_used} units of {log.material_id?.name || "Material"}
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    {new Date(log.created_at || log.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <PermissionGate routeName="MANUFACTURING_DELETE">
                  <button 
                    onClick={() => handleDelete(log._id)}
                    className="text-red-500 hover:text-red-400 text-sm px-2 py-1 rounded hover:bg-red-900/20 transition"
                  >
                    Revert
                  </button>
                </PermissionGate>
              </div>
            ))}
          </div>

          {/* RIGHT: CREATE FORM */}
          <PermissionGate routeName="MANUFACTURING_CREATE">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
              <h2 className="text-xl font-bold text-white mb-4">Log New Batch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Product Select */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Finished Product</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    required
                  >
                    <option value="">Select Product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Current Stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Material Select */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Raw Material Used</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    value={form.material_id}
                    onChange={(e) => setForm({ ...form, material_id: e.target.value })}
                    required
                  >
                    <option value="">Select Material...</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} (Available: {m.current_quantity} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantities */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Material Consumed</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Qty Used"
                      value={form.quantity_used}
                      onChange={(e) => setForm({ ...form, quantity_used: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Produced Count</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      placeholder="Qty Made"
                      value={form.manufactured_qty}
                      onChange={(e) => setForm({ ...form, manufactured_qty: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/20 transition mt-4"
                >
                  Record Production Log
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  *This will automatically update stock levels.
                </p>
              </form>
            </div>
          </PermissionGate>

        </div>
      </div>
    </PermissionGate>
  );
};

export default Manufacturing;