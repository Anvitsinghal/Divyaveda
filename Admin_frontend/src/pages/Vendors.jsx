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

  if (loading) return <div className="p-6 text-[var(--text-muted)]">Loading Vendors...</div>;

  return (
    <PermissionGate routeName="VENDOR_VIEW">
      <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)]">Vendor Management</h1>
          <PermissionGate routeName="VENDOR_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Add Vendor
            </button>
          </PermissionGate>
        </div>

        {error && <div className="bg-red-500/10 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded border border-red-500/50 dark:border-red-900/50">{error}</div>}

        {/* SEARCH BAR */}
        <input 
          type="text" 
          placeholder="Search by vendor name or phone..." 
          className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-lg px-4 py-2 text-[var(--text-primary)] outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* DATA TABLE */}
        <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-primary)] overflow-hidden shadow-xl">
          <div className="table-wrapper overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)] min-w-[900px]">
              <thead className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] uppercase font-medium">
                <tr>
                  <th className="p-3 lg:p-4">Vendor Name</th>
                  <th className="p-3 lg:p-4">Contact Person</th>
                  <th className="p-3 lg:p-4">Phone / Email</th>
                  <th className="p-3 lg:p-4">Address</th>
                  <th className="p-3 lg:p-4">Status</th>
                  <th className="p-3 lg:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr><td colSpan="6" className="p-6 text-center text-[var(--text-muted)]">No vendors found.</td></tr>
                ) : filteredVendors.map((v) => (
                  <tr key={v._id} className="border-t border-[var(--border-primary)] hover:bg-[var(--hover-bg)] transition">
                    <td className="p-3 lg:p-4 font-medium text-[var(--text-primary)]">{v.name}</td>
                    <td className="p-3 lg:p-4">{v.contact_person || "-"}</td>
                    <td className="p-3 lg:p-4">
                      <div className="text-[var(--text-primary)]">{v.phone_number}</div>
                      <div className="text-xs text-[var(--text-muted)]">{v.email}</div>
                    </td>
                    <td className="p-3 lg:p-4 max-w-xs truncate" title={v.address}>
                      {v.address || "-"}
                    </td>
                    <td className="p-3 lg:p-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${v.isActive ? "bg-green-500/10 dark:bg-green-900/30 text-green-600 dark:text-green-300 border border-green-500/50 dark:border-green-900" : "bg-red-500/10 dark:bg-red-900/30 text-red-600 dark:text-red-300 border border-red-500/50 dark:border-red-900"}`}>
                        {v.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 lg:p-4 text-right space-x-3">
                      <PermissionGate routeName="VENDOR_UPDATE">
                        <button onClick={() => openEditModal(v)} className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300">Edit</button>
                      </PermissionGate>
                      <PermissionGate routeName="VENDOR_DELETE">
                        <button onClick={() => handleDelete(v._id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">Delete</button>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl w-full max-w-2xl p-4 lg:p-6 shadow-2xl my-4">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                {editingId ? "Edit Vendor" : "New Vendor"}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Vendor Name</label>
                    <input
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Contact Person</label>
                    <input
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                      value={formData.contact_person}
                      onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Address</label>
                    <textarea
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                      rows="3"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone Number</label>
                    <input
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                      value={formData.phone_number}
                      onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-2 text-[var(--text-primary)]"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="pt-8">
                    <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="rounded bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                      />
                      Active Vendor
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition"
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
