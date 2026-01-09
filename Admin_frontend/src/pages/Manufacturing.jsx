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
    quantity_used: "",
    manufactured_qty: ""
  });

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  const load = async () => {
    try {
      const [logRes, prodRes, matRes] = await Promise.all([
        api.get("/admin/manufacturing"),
        api.get("/admin/products"),
        api.get("/admin/raw-materials")
      ]);

      setLogs(safeExtract(logRes, "logs"));
      setProducts(safeExtract(prodRes, "products"));
      setMaterials(safeExtract(matRes, "rawMaterials"));
      setError("");
    } catch {
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

      setForm({
        product_id: "",
        material_id: "",
        quantity_used: "",
        manufactured_qty: ""
      });

      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to log production");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log?")) return;
    await api.delete(`/admin/manufacturing/${id}`);
    load();
  };

  if (loading) {
    return <div className="p-6 text-[var(--text-muted)]">Loading manufacturing data…</div>;
  }

  return (
    <PermissionGate routeName="MANUFACTURING_VIEW">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold">
            Manufacturing Logs
          </h1>
          <div className="text-sm text-[var(--text-muted)]">
            Total Records: {logs.length}
          </div>
        </div>

        {error && (
          <div className="text-red-500 bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: LOGS */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {logs.length === 0 && (
              <div className="text-[var(--text-muted)] text-center py-6">
                No production logs found.
              </div>
            )}

            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-4 flex justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-lg truncate">
                    {log.product_id?.name || "Unknown Product"}
                  </div>

                  <div className="text-green-600 font-mono text-sm">
                    Produced: +{log.manufactured_qty}
                  </div>

                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    Used {log.quantity_used} of {log.material_id?.name || "Material"}
                  </div>

                  <div className="text-xs text-[var(--text-muted)] mt-2">
                    {new Date(log.created_at || log.createdAt).toLocaleString()}
                  </div>
                </div>

                <PermissionGate routeName="MANUFACTURING_DELETE">
                  <button
                    onClick={() => handleDelete(log._id)}
                    className="text-red-500 text-sm px-2 py-1 rounded hover:bg-red-500/10 h-fit"
                  >
                    Revert
                  </button>
                </PermissionGate>
              </div>
            ))}
          </div>

          {/* RIGHT: FORM */}
          <PermissionGate routeName="MANUFACTURING_CREATE">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">
                Log New Batch
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">
                    Finished Product
                  </label>
                  <select
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (Stock: {p.stock_quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">
                    Raw Material Used
                  </label>
                  <select
                    className="w-full border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={form.material_id}
                    onChange={(e) => setForm({ ...form, material_id: e.target.value })}
                    required
                  >
                    <option value="">Select material</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} (Available: {m.current_quantity} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="0"
                    placeholder="Material consumed"
                    className="border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={form.quantity_used}
                    onChange={(e) => setForm({ ...form, quantity_used: e.target.value })}
                    required
                  />

                  <input
                    type="number"
                    min="1"
                    placeholder="Produced count"
                    className="border border-[var(--border-primary)] rounded-lg px-3 py-2 bg-transparent"
                    value={form.manufactured_qty}
                    onChange={(e) => setForm({ ...form, manufactured_qty: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition"
                >
                  Record Production
                </button>

                <p className="text-xs text-[var(--text-muted)] text-center">
                  * Stock levels update automatically
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

