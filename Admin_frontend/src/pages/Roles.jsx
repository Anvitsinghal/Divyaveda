import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

// Define the modules available in your system for the permission matrix
const MODULES = [
  "PRODUCT",
  "CATEGORY", 
  "SUBCATEGORY",
  "RAW_MATERIAL",
  "BUNDLE_DISCOUNT",
  "PRODUCT_BUNDLE_DISCOUNT",
  "RELATED_PRODUCT",
  "ROLE",
  "USER",
  "USER_ROLE",
  "LEAD"
];

const ACTIONS = ["VIEW", "CREATE", "UPDATE", "DELETE"];

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    role_name: "",
    description: "",
    permissions: [] // Stores array of strings e.g. "PRODUCT_VIEW"
  });

  const safeExtract = (res) => res.data?.roles || res.data || [];

  // 1. Load Roles
  const loadRoles = async () => {
    try {
      const res = await api.get("/admin/roles");
      setRoles(safeExtract(res));
      setError("");
    } catch (e) {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // 2. Handle Checkbox Toggle
  const togglePermission = (permString) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permString);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permString) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permString] };
      }
    });
  };

  // 3. Handle Select All for a Module
  const toggleModuleAll = (module) => {
    const allModulePerms = ACTIONS.map(action => `${module}_${action}`);
    const allSelected = allModulePerms.every(p => formData.permissions.includes(p));

    if (allSelected) {
      // Remove all
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !allModulePerms.includes(p))
      }));
    } else {
      // Add missing
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...allModulePerms])]
      }));
    }
  };

  // 4. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend expects 'screen_access' usually as array of objects or strings.
      // Adjusting payload to match common patterns.
      const payload = {
        role_name: formData.role_name,
        description: formData.description,
        screen_access: formData.permissions // Sending array of strings e.g. ["PRODUCT_VIEW"]
      };

      if (editingId) {
        await api.put(`/admin/roles/${editingId}`, payload);
        alert("Role Updated Successfully!");
      } else {
        await api.post("/admin/roles", payload);
        alert("Role Created Successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      loadRoles();
    } catch (e) {
      alert(e.response?.data?.message || "Operation failed");
    }
  };

  // 5. Delete Role
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role? Users assigned to this role might lose access.")) return;
    try {
      await api.delete(`/admin/roles/${id}`);
      loadRoles();
    } catch (e) {
      alert("Failed to delete role");
    }
  };

  // Helpers
  const openEditModal = (role) => {
    setEditingId(role._id);
    
    // Convert backend screen_access (likely objects) to simple string array
    // Check if screen_access is array of strings or objects
    let existingPerms = [];
    if (Array.isArray(role.screen_access)) {
      existingPerms = role.screen_access.map(item => 
        typeof item === 'string' ? item : item.screen_name
      );
    }

    setFormData({
      role_name: role.role_name,
      description: role.description || "",
      permissions: existingPerms
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ role_name: "", description: "", permissions: [] });
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Roles...</div>;

  return (
    <PermissionGate routeName="ROLE_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Role Management</h1>
          <PermissionGate routeName="ROLE_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Create Role
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* ROLES LIST */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{role.role_name}</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                    {role.screen_access?.length || 0} perms
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {role.description || "No description provided."}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-end gap-3">
                <PermissionGate routeName="ROLE_UPDATE">
                  <button 
                    onClick={() => openEditModal(role)} 
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Edit Permissions
                  </button>
                </PermissionGate>
                <PermissionGate routeName="ROLE_DELETE">
                  <button 
                    onClick={() => handleDelete(role._id)} 
                    className="text-sm text-red-400 hover:text-red-300 font-medium"
                  >
                    Delete
                  </button>
                </PermissionGate>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingId ? "Edit Role & Permissions" : "Create New Role"}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Role Name</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.role_name}
                      onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* PERMISSION MATRIX */}
                <div className="flex-1 overflow-y-auto border border-slate-800 rounded-lg p-4 bg-slate-950/50 mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Assign Permissions</h3>
                  
                  <div className="space-y-4">
                    {MODULES.map(module => (
                      <div key={module} className="bg-slate-900 p-3 rounded border border-slate-800">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                          <span className="font-bold text-slate-200">{module.replace("_", " ")}</span>
                          <button 
                            type="button" 
                            onClick={() => toggleModuleAll(module)}
                            className="text-xs text-blue-400 hover:underline"
                          >
                            Toggle All
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {ACTIONS.map(action => {
                            const permString = `${module}_${action}`;
                            const isChecked = formData.permissions.includes(permString);
                            return (
                              <label key={permString} className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer border ${isChecked ? "bg-blue-900/20 border-blue-500/50" : "border-transparent hover:bg-slate-800"}`}>
                                <input 
                                  type="checkbox" 
                                  className="rounded bg-slate-950 border-slate-700 text-blue-600"
                                  checked={isChecked}
                                  onChange={() => togglePermission(permString)}
                                />
                                <span className={isChecked ? "text-blue-300" : "text-slate-400"}>
                                  {action}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-500"
                  >
                    {editingId ? "Update Role" : "Create Role"}
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

export default Roles;