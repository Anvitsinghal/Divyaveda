import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAdminAuth } from "../context/AuthContext";
import PermissionGate from "../components/PermissionGate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Leads = () => {
  const { admin } = useAdminAuth();

  // --- 1. ROBUST ROLE CHECK ---
  // This ensures "Super Admin" is detected regardless of how it's stored
  let userRole = admin?.role || "";
  if (admin?.isSuperAdmin === true) {
    userRole = "Super Admin";
  }

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- EDIT STATE ---
  const [staffMembers, setStaffMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    lead_status: "", 
    assigned_to: "", 
    remarks: "" 
  });

  // Filters
  const [source, setSource] = useState("DAILY_LEAD");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [assigned, setAssigned] = useState("");
  const [search, setSearch] = useState("");

  // ---------------- FETCH LEADS ----------------
  const loadLeads = async () => {
    setLoading(true);
    try {
      const q = source ? `?source=${source}` : "";
      const res = await api.get(`/admin/leads${q}`);
      setLeads(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH STAFF ----------------
  const loadStaff = async () => {
    // Load staff if user is Manager, Admin or Super Admin
    if (["Manager", "Admin", "Super Admin"].includes(userRole)) {
      try {
        const res = await api.get("/admin/leads/staff");
        setStaffMembers(res.data || []);
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    loadLeads();
    loadStaff();
  }, [source]);

  // ---------------- FILTER LOGIC ----------------
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (platform && l.platform !== platform) return false;
      if (status && l.lead_status !== status) return false;
      if (assigned === "assigned" && !l.assigned_to) return false;
      if (assigned === "unassigned" && l.assigned_to) return false;

      if (search) {
        const s = search.toLowerCase();
        if (
          !l.full_name?.toLowerCase().includes(s) &&
          !l.phone?.includes(s) &&
          !l.email?.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [leads, platform, status, assigned, search]);

  // ---------------- PDF EXPORT ----------------
  const exportPDF = () => {
    const doc = new jsPDF("l");
    doc.text("Leads Report", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [[
        "Date", "Name", "Phone", "Email", "Platform", 
        "Campaign", "Business", "Role", "Status", "Assigned", "Source"
      ]],
      body: filteredLeads.map((l) => [
        l.created_date,
        l.full_name,
        l.phone,
        l.email || "-",
        l.platform,
        l.campaign_name || "-",
        l.business_type || "-",
        l.role || "-",
        l.lead_status,
        // PDF Fix: Show Name OR Email OR Unassigned
        l.assigned_to ? (l.assigned_to.name || l.assigned_to.email) : "Unassigned",
        l.source
      ])
    });

    doc.save("leads.pdf");
  };

  // ---------------- EDIT HANDLERS ----------------
  const openModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      lead_status: lead.lead_status || "NEW",
      assigned_to: lead.assigned_to?._id || "", 
      remarks: "" 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        lead_status: formData.lead_status,
        assigned_to: formData.assigned_to,
        comment: formData.remarks 
      };

      await api.put(`/admin/leads/${editingLead._id}`, payload);
      alert("Lead Updated Successfully!");
      
      setIsModalOpen(false);
      setEditingLead(null);
      loadLeads(); // Refresh data to show updates
    } catch (e) {
      alert("Update Failed: " + (e.response?.data?.message || e.message));
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Lead Management</h1>

        <div className="flex gap-2">
          <button
            onClick={loadLeads}
            className="bg-slate-700 px-4 py-2 rounded text-white hover:bg-slate-600 transition-colors"
          >
            🔄 Refresh
          </button>

          {/* PDF BUTTON: Now visible if Role is correct OR if isSuperAdmin is true */}
          {(userRole === "Super Admin" || userRole === "Admin" || userRole === "Manager") && (
            <button
              onClick={exportPDF}
              className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-500 transition-colors"
            >
              📄 Export PDF
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900 p-4 rounded border border-slate-800">
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="bg-slate-800 text-white p-2 rounded border border-slate-700 outline-none"
        >
          <option value="DAILY_LEAD">Daily</option>
          <option value="HISTORICAL">Historical</option>
          <option value="">All</option>
        </select>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-slate-800 text-white p-2 rounded border border-slate-700 outline-none"
        >
          <option value="">Platform</option>
          <option value="fb">Facebook</option>
          <option value="ig">Instagram</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-800 text-white p-2 rounded border border-slate-700 outline-none"
        >
          <option value="">Status</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="INTERESTED">Interested</option>
          <option value="FOLLOW_UP">Follow Up</option>
          <option value="CLOSED_WON">Closed (Won)</option>
          <option value="CLOSED_LOST">Closed (Lost)</option>
          <option value="CREATED">Created</option>
          <option value="complete">Complete</option>
        </select>

        <select
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
          className="bg-slate-800 text-white p-2 rounded border border-slate-700 outline-none"
        >
          <option value="">Assignment</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <input
          placeholder="Search name / phone / email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 text-white p-2 rounded border border-slate-700 outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 rounded border border-slate-800 overflow-x-auto shadow-xl">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">Platform</th>
                <th className="p-3">Campaign</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr key={l._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-3 whitespace-nowrap">{l.created_date}</td>
                  <td className="p-3 text-white font-medium">{l.full_name}</td>
                  <td className="p-3">{l.phone}</td>
                  <td className="p-3 max-w-[150px] truncate">{l.email || "-"}</td>
                  <td className="p-3 uppercase">{l.platform}</td>
                  <td className="p-3 max-w-[150px] truncate">{l.campaign_name || "-"}</td>
                  <td className="p-3">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                        l.lead_status === 'NEW' ? 'text-blue-400 bg-blue-400/10' :
                        l.lead_status === 'CLOSED_WON' ? 'text-green-400 bg-green-400/10' :
                        'text-slate-400 bg-slate-800'
                     }`}>
                       {l.lead_status}
                     </span>
                  </td>
                  <td className="p-3">
                    {l.assigned_to ? (
                       <span className="text-white">
                         {l.assigned_to.name ? l.assigned_to.name : l.assigned_to.email}
                       </span>
                    ) : (
                       <span className="text-red-400 text-xs opacity-50">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <PermissionGate routeName="LEAD_UPDATE">
                      <button 
                        onClick={() => openModal(l)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && editingLead && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">
              Update Lead: <span className="text-blue-400">{editingLead.full_name}</span>
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Lead Status</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  value={formData.lead_status}
                  onChange={e => setFormData({...formData, lead_status: e.target.value})}
                >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="CLOSED_WON">Closed (Won)</option>
                    <option value="CLOSED_LOST">Closed (Lost)</option>
                    <option value="CREATED">Created</option>
                    <option value="complete">Complete</option>
                </select>
              </div>

              {/* ASSIGNMENT DROPDOWN */}
              {(userRole === "Manager" || userRole === "Admin" || userRole === "Super Admin") && (
                <div>
                   <label className="block text-xs text-blue-400 mb-1 font-bold uppercase">Assign To</label>
                   <select 
                      className="w-full bg-slate-900 border border-blue-900/50 rounded p-2 text-white focus:border-blue-500 outline-none"
                      value={formData.assigned_to}
                      onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                   >
                      <option value="">-- Unassigned --</option>
                      {staffMembers.map(staff => (
                        <option key={staff._id} value={staff._id}>
                            {staff.name ? staff.name : staff.email}
                            {staff.role_id?.role_name ? ` (${staff.role_id.role_name})` : ""}
                        </option>
                      ))}
                   </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Add Remark</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  rows="3"
                  placeholder="Type a new remark here..."
                  value={formData.remarks}
                  onChange={e => setFormData({...formData, remarks: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 font-medium shadow-lg shadow-blue-900/20"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leads;