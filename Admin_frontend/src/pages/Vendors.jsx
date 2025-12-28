import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    address: "",
    isActive: true
  });

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Load Data
  const loadData = async () => {
    try {
      const res = await api.get("/admin/vendors");
      setVendors(safeExtract(res, "vendors")); // Adapt based on backend response key
      setError("");
    } catch (e) {
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/admin/vendors/${editingId}`, formData);
        alert("Vendor Updated Successfully!");
      } else {
        await api.post("/admin/vendors", formData);
        alert("Vendor Created Successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Operation failed");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;
    try {
      await api.delete(`/admin/vendors/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete vendor");
    }
  };

  // Helpers
  const openEditModal = (vendor) => {
    setEditingId(vendor._id);
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || "",
      phone_number: vendor.phone_number || "",
      email: vendor.email || "",
      address: vendor.address || "",
      isActive: vendor.isActive
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      name: "", contact_person: "", phone_number: "", 
      email: "", address: "", isActive: true 
    });
    setError("");
  };

  // Filter Logic
  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.phone_number && v.phone_number.includes(searchTerm))
  );

  if (loading) return <div className="p-6 text-slate-400">Loading Vendors...</div>;

  return (
    <PermissionGate routeName="VENDOR_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Vendor Management</h1>
          <PermissionGate routeName="VENDOR_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Add Vendor
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* SEARCH BAR */}
        <input 
          type="text" 
          placeholder="Search by vendor name or phone..." 
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* DATA TABLE */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Vendor Name</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Phone / Email</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-slate-500">No vendors found.</td></tr>
              ) : filteredVendors.map((v) => (
                <tr key={v._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{v.name}</td>
                  <td className="p-4">{v.contact_person || "-"}</td>
                  <td className="p-4">
                    <div className="text-white">{v.phone_number}</div>
                    <div className="text-xs text-slate-500">{v.email}</div>
                  </td>
                  <td className="p-4 max-w-xs truncate" title={v.address}>
                    {v.address || "-"}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${v.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {v.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <PermissionGate routeName="VENDOR_UPDATE">
                      <button onClick={() => openEditModal(v)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    </PermissionGate>
                    <PermissionGate routeName="VENDOR_DELETE">
                      <button onClick={() => handleDelete(v._id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? "Edit Vendor" : "New Vendor"}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Vendor Name</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Contact Person</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.contact_person}
                      onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Address</label>
                    <textarea
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      rows="3"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.phone_number}
                      onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="pt-8">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="rounded bg-slate-800 border-slate-600"
                      />
                      Active Vendor
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-3 pt-4 border-t border-slate-800">
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
                    {editingId ? "Update Vendor" : "Create Vendor"}
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

export default Vendors;
