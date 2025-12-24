import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Screens = () => {
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    screen_name: "",
    description: "",
    routes: [] // Array of strings
  });
  
  // Helper for Route Input
  const [routeInput, setRouteInput] = useState("");

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Load Data
  const loadData = async () => {
    try {
      const res = await api.get("/admin/screens");
      setScreens(safeExtract(res, "screens"));
      setError("");
    } catch (e) {
      setError("Failed to load screens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Submit Handle (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure routes include the current input if not empty
      const finalRoutes = routeInput.trim() 
        ? [...formData.routes, routeInput.trim()] 
        : formData.routes;

      const payload = { ...formData, routes: finalRoutes };

      if (editingId) {
        await api.put(`/admin/screens/${editingId}`, payload);
        alert("Screen Updated Successfully!");
      } else {
        await api.post("/admin/screens", payload);
        alert("Screen Created Successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Operation failed");
    }
  };

  // 3. Delete Handle
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this screen definition?")) return;
    try {
      await api.delete(`/admin/screens/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete screen");
    }
  };

  // --- Route Helpers ---
  const addRoute = () => {
    if (routeInput.trim()) {
      setFormData({ ...formData, routes: [...formData.routes, routeInput.trim()] });
      setRouteInput("");
    }
  };

  const removeRoute = (index) => {
    setFormData({ 
      ...formData, 
      routes: formData.routes.filter((_, i) => i !== index) 
    });
  };

  // --- Modal Helpers ---
  const openEditModal = (screen) => {
    setEditingId(screen._id);
    setFormData({
      screen_name: screen.screen_name,
      description: screen.description || "",
      routes: Array.isArray(screen.routes) ? screen.routes : []
    });
    setRouteInput("");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ screen_name: "", description: "", routes: [] });
    setRouteInput("");
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Configuration...</div>;

  return (
    <PermissionGate routeName="SCREEN_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Screen / Module Config</h1>
          <PermissionGate routeName="SCREEN_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Add Screen
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* DATA TABLE */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Screen Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Registered Routes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {screens.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-slate-500">No screens defined.</td></tr>
              ) : screens.map((s) => (
                <tr key={s._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{s.screen_name}</td>
                  <td className="p-4">{s.description || "-"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(s.routes) && s.routes.map((r, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-blue-300 font-mono">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <PermissionGate routeName="SCREEN_UPDATE">
                      <button onClick={() => openEditModal(s)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    </PermissionGate>
                    <PermissionGate routeName="SCREEN_DELETE">
                      <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? "Edit Screen" : "Add New Screen"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Screen Name</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    placeholder="e.g. Product Management"
                    value={formData.screen_name}
                    onChange={e => setFormData({ ...formData, screen_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    placeholder="Short description of this module..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* DYNAMIC ROUTES INPUT */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Routes / Paths</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-sm"
                      placeholder="/admin/example"
                      value={routeInput}
                      onChange={e => setRouteInput(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addRoute(); } }}
                    />
                    <button type="button" onClick={addRoute} className="bg-slate-800 text-white px-3 rounded-lg hover:bg-slate-700">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.routes.map((route, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-blue-900/30 border border-blue-900 text-blue-300 px-2 py-1 rounded text-xs">
                        {route}
                        <button type="button" onClick={() => removeRoute(idx)} className="hover:text-white font-bold ml-1">×</button>
                      </span>
                    ))}
                  </div>
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
                    {editingId ? "Update Screen" : "Create Screen"}
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

export default Screens;