import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";
import { useAdminAuth } from "../context/AuthContext";

const B2B = () => {
  const { admin } = useAdminAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- FILTERS STATE (Mirroring Leads.jsx for consistency) ---
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    order_status: "",
    platform: "",
    segment: "",
    client_profile: "",
    from_date: "",
    to_date: "",
  });

  const [formData, setFormData] = useState({
    lead_id: "", 
    order_date: "",
    order_details: "",
    total_order_value: "",
    amount_received: "",
    last_receipt_date: "",
    order_status: "OPEN",
    additional_remarks: "",
  });

  // ===============================
  // LOAD DATA (Functional Server-side Filtering)
  // ===============================
  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Map all current filters to query parameters
      if (filters.search) params.set("search", filters.search);
      if (filters.order_status) params.set("order_status", filters.order_status);
      if (filters.platform) params.set("platform", filters.platform);
      if (filters.segment) params.set("segment", filters.segment);
      if (filters.client_profile) params.set("client_profile", filters.client_profile);
      if (filters.from_date) params.set("from_date", filters.from_date);
      if (filters.to_date) params.set("to_date", filters.to_date);

      // Priority: Specific Lead filter from URL
      const leadId = searchParams.get("lead");
      if (leadId) params.set("lead_id", leadId);

      const res = await api.get(`/admin/b2b?${params.toString()}`);
      let data = res.data?.data || [];
      
      // Local fallback filter if backend doesn't handle lead_id param yet
      if (leadId) {
        data = data.filter((r) => r.lead_id?._id === leadId || r.lead_id === leadId);
      }

      setRecords(data);
    } catch (err) {
      console.error("B2B Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger loadData when filters or URL params change
  useEffect(() => {
    const timer = setTimeout(() => {
        loadData();
    }, 400); 
    return () => clearTimeout(timer);
  }, [filters, searchParams]);

  // ===============================
  // PERMISSION HELPERS
  // ===============================
  const userRole = admin?.role || "";
  const isSuperAdmin = admin?.isSuperAdmin === true;
  const isManagerOrAbove = isSuperAdmin || ["Manager", "Admin", "Super Admin"].includes(userRole);
  const currentUserId = admin?._id || admin?.id;

  const canEditRecord = (rec) => {
    if (isManagerOrAbove) return true;
    if (!currentUserId) return false;
    const uId = String(currentUserId);
    const assignedToId = rec.lead_id?.assigned_to?._id || rec.lead_id?.assigned_to;
    if (assignedToId && String(assignedToId) === uId) return true;
    const convertedById = rec.converted_by?._id || rec.converted_by;
    if (convertedById && String(convertedById) === uId) return true;
    return false;
  };

  // ===============================
  // HANDLERS
  // ===============================
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({
      lead_id: searchParams.get("lead") || "", // Pre-fill if lead context exists
      order_date: new Date().toISOString().substring(0, 10),
      order_details: "",
      total_order_value: "",
      amount_received: "",
      last_receipt_date: "",
      order_status: "OPEN",
      additional_remarks: "",
    });
    setIsModalOpen(true);
  };

  const openEdit = (rec) => {
    setEditing(rec);
    setFormData({
      lead_id: rec.lead_id?._id || rec.lead_id || "",
      order_date: rec.order_date ? rec.order_date.substring(0, 10) : "",
      order_details: rec.order_details || "",
      total_order_value: rec.total_order_value || "",
      amount_received: rec.amount_received || "",
      last_receipt_date: rec.last_receipt_date ? rec.last_receipt_date.substring(0, 10) : "",
      order_status: rec.order_status || "OPEN",
      additional_remarks: rec.additional_remarks || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        total_order_value: Number(formData.total_order_value || 0),
        amount_received: Number(formData.amount_received || 0),
      };

      if (editing) {
        await api.put(`/admin/b2b/${editing._id}`, payload);
      } else {
        await api.post("/admin/b2b", payload);
      }

      setIsModalOpen(false);
      setEditing(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const clearFilters = () => {
    setFilters({ search: "", order_status: "", platform: "", segment: "", client_profile: "", from_date: "", to_date: "" });
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">B2B Orders</h1>
        <div className="flex gap-2">
            {searchParams.get("lead") && (
              <button onClick={clearFilters} className="bg-slate-700 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-600">
                Show All Orders
              </button>
            )}
            <PermissionGate routeName="B2B_CREATE">
                <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-500 shadow-md">
                  + Add New Order
                </button>
            </PermissionGate>
        </div>
      </div>

      {/* --- FILTER BAR (Functional Grid) --- */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input 
            placeholder="Search client/mobile..."
            className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white outline-none focus:border-blue-500"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <select 
            className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white outline-none focus:border-blue-500"
            value={filters.order_status}
            onChange={(e) => handleFilterChange("order_status", e.target.value)}
          >
              <option value="">Order Status</option>
              <option value="OPEN">OPEN</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="CLOSED">CLOSED</option>
          </select>
          <select 
            className="bg-slate-950 border border-slate-700 p-2 rounded text-sm text-white outline-none focus:border-blue-500"
            value={filters.platform}
            onChange={(e) => handleFilterChange("platform", e.target.value)}
          >
              <option value="">All Platforms</option>
              <option value="fb">Facebook</option>
              <option value="ig">Instagram</option>
              <option value="inbound">Inbound</option>
          </select>
          <div className="flex gap-2">
            <input 
              type="date"
              className="w-1/2 bg-slate-950 border border-slate-700 p-2 rounded text-[10px] text-white outline-none"
              value={filters.from_date}
              onChange={(e) => handleFilterChange("from_date", e.target.value)}
            />
            <input 
              type="date"
              className="w-1/2 bg-slate-950 border border-slate-700 p-2 rounded text-[10px] text-white outline-none"
              value={filters.to_date}
              onChange={(e) => handleFilterChange("to_date", e.target.value)}
            />
          </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-100">
              <tr>
                <th className="p-3 text-left">Sr</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Mobile</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Order Date</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left text-green-400">Received</th>
                <th className="p-3 text-left text-yellow-300">Pending</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">{r.sr_no}</td>
                  <td className="p-3 text-white font-medium">{r.client_name}</td>
                  <td className="p-3">{r.mobile}</td>
                  <td className="p-3">{r.company || "-"}</td>
                  <td className="p-3">{r.order_date ? new Date(r.order_date).toLocaleDateString() : "-"}</td>
                  <td className="p-3 font-semibold">{r.total_order_value || 0}</td>
                  <td className="p-3 text-green-400 font-semibold">{r.amount_received || 0}</td>
                  <td className="p-3 text-yellow-300 font-semibold">{r.amount_pending || 0}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.order_status === 'CLOSED' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                        {r.order_status}
                    </span>
                  </td>
                  <td className="p-3">
                    {canEditRecord(r) && (
                      <PermissionGate routeName="B2B_UPDATE">
                        <button onClick={() => openEdit(r)} className="text-blue-400 hover:text-blue-300 font-medium">Edit</button>
                      </PermissionGate>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan="10" className="p-10 text-center text-slate-500">No matching orders found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editing ? `Edit B2B Record` : "Create New B2B Entry"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Lead ID (Reference)</label>
                  <input
                    required
                    placeholder="Enter associated Lead ID"
                    value={formData.lead_id}
                    onChange={(e) => setFormData(p => ({ ...p, lead_id: e.target.value }))}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white mt-1 outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1">Order Date</label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData(p => ({ ...p, order_date: e.target.value }))}
                    className="bg-slate-950 p-2 rounded border border-slate-700 text-white outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1">Status</label>
                  <select
                    value={formData.order_status}
                    onChange={(e) => setFormData(p => ({ ...p, order_status: e.target.value }))}
                    className="bg-slate-950 p-2 rounded border border-slate-700 text-white outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Order Details</label>
                <textarea
                  rows="2"
                  placeholder="Items, quantities, etc."
                  value={formData.order_details}
                  onChange={(e) => setFormData(p => ({ ...p, order_details: e.target.value }))}
                  className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Total Value</label>
                  <input
                    type="number"
                    value={formData.total_order_value}
                    onChange={(e) => setFormData(p => ({ ...p, total_order_value: e.target.value }))}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Amount Received</label>
                  <input
                    type="number"
                    value={formData.amount_received}
                    onChange={(e) => setFormData(p => ({ ...p, amount_received: e.target.value }))}
                    className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-800 rounded font-bold hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 rounded text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                    {editing ? "Save Changes" : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2B;