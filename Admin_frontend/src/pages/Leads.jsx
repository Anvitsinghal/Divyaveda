import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAdminAuth } from "../context/AuthContext";
import PermissionGate from "../components/PermissionGate";

const Leads = () => {
  const { admin } = useAdminAuth(); // Get current user info (Role/Name)
  const [leads, setLeads] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]); // For Manager dropdown
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    client_name: "", company_name: "", contact_number: "", 
    lead_type: "B2C", status: "NEW", assigned_to: "", comment: ""
  });

  const userRole = admin?.role || ""; // "Manager", "Staff", "Super Admin"

  // 1. Fetch Data
 const loadData = async () => {
    try {
      const res = await api.get("/admin/leads");
      setLeads(res.data);
      
      if (userRole === "Manager") {
        const userRes = await api.get("/admin/leads/staff"); 
        
        console.log("👉 STAFF API RESULT:", userRes.data); // <--- Add this log
        
        setStaffMembers(userRes.data || []); 
      }
    } catch (e) {
      console.error("Load Error:", e); // <--- See the error here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        // UPDATE Existing Lead
        await api.put(`/admin/leads/${editingLead._id}`, formData);
        alert("Lead Updated!");
      } else {
        // CREATE New Lead
        await api.post("/admin/leads", formData);
        alert("Lead Created!");
      }
      setIsModalOpen(false);
      setEditingLead(null);
      loadData();
    } catch (e) {
      alert(e.response?.data?.message || "Operation failed");
    }
  };

  // 3. Open Modal Helper
  const openModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        client_name: lead.client_name,
        company_name: lead.company_name || "",
        contact_number: lead.contact_number,
        lead_type: lead.lead_type,
        status: lead.status,
        assigned_to: lead.assigned_to?._id || "", // ID for dropdown
        comment: "" // Start empty for new comment
      });
    } else {
      setEditingLead(null);
      setFormData({
        client_name: "", company_name: "", contact_number: "", 
        lead_type: "B2C", status: "NEW", assigned_to: "", comment: ""
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Lead Management</h1>
          <p className="text-sm text-slate-400">
            Role: <span className="text-blue-400">{userRole}</span>
          </p>
        </div>
        
        {/* Only Manager & Staff can create leads */}
        <PermissionGate routeName="LEAD_CREATE">
          <button onClick={() => openModal()} className="bg-blue-600 px-4 py-2 rounded text-white text-sm hover:bg-blue-500">
            + New Lead
          </button>
        </PermissionGate>
      </div>

      {/* DATA TABLE */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Last Remark</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                <td className="p-4">
                  <div className="font-medium text-white">{lead.client_name}</div>
                  <div className="text-xs">{lead.contact_number}</div>
                  {lead.company_name && <div className="text-xs text-blue-400">{lead.company_name}</div>}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${lead.lead_type === 'B2B' ? 'bg-purple-900 text-purple-300' : 'bg-green-900 text-green-300'}`}>
                    {lead.lead_type}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded text-xs bg-slate-800 text-white border border-slate-700">
                    {lead.status}
                  </span>
                </td>
       <td className="p-4">
  {(() => {
    const assignee = lead.assigned_to;

    // 1. Unassigned
    if (!assignee) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-red-900/30 text-red-400 border border-red-900/50">
          Unassigned
        </span>
      );
    }

    // 2. Data is just an ID (Backend Populate Error fallback)
    if (typeof assignee === "string") {
      return <span className="text-xs text-slate-500">ID: {assignee.slice(0, 6)}...</span>;
    }

    // 3. Perfect Data (Object)
    return (
      <div>
        {assignee.name ? (
          // Case A: Name Exists -> Show Name (White) + Email (Small Blue)
          <>
            <div className="font-medium text-white">{assignee.name}</div>
            <div className="text-xs text-blue-400">{assignee.email}</div>
          </>
        ) : (
          // Case B: Only Email Exists -> Show Email (White)
          <div className="font-medium text-blue-300">{assignee.email}</div>
        )}
      </div>
    );
  })()}
</td>
                <td className="p-4 max-w-xs truncate">
                  {lead.remarks?.length > 0 ? lead.remarks[lead.remarks.length - 1].comment : "-"}
                </td>
                <td className="p-4 text-right">
                  {/* Admin cannot edit. Manager/Staff can. */}
                  <PermissionGate routeName="LEAD_UPDATE">
                    <button onClick={() => openModal(lead)} className="text-blue-400 hover:text-blue-300">
                      {userRole === "Manager" ? "Manage / Assign" : "Update Status"}
                    </button>
                  </PermissionGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingLead ? "Update Lead" : "Create New Lead"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Common Fields (Editable only if creating, or if Manager) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Client Name</label>
                  <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    required value={formData.client_name}
                    onChange={e => setFormData({...formData, client_name: e.target.value})}
                    disabled={editingLead && userRole !== "Manager"} 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    required value={formData.contact_number}
                    onChange={e => setFormData({...formData, contact_number: e.target.value})}
                    disabled={editingLead && userRole !== "Manager"}
                  />
                </div>
              </div>

              {/* B2B / B2C Select */}
              <div>
                 <label className="block text-sm text-slate-400 mb-1">Lead Type</label>
                 <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    value={formData.lead_type}
                    onChange={e => setFormData({...formData, lead_type: e.target.value})}
                    disabled={editingLead}
                 >
                    <option value="B2C">B2C (Individual)</option>
                    <option value="B2B">B2B (Company)</option>
                 </select>
              </div>

              {/* Company Name (Visible only if B2B) */}
              {formData.lead_type === "B2B" && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Company Name</label>
                  <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
              )}

            {/* MANAGER ONLY: Assign To */}
{userRole === "Manager" && (
  <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
    <label className="block text-sm text-yellow-400 mb-1 font-medium">Assign To Staff</label>
    <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
      value={formData.assigned_to}
      onChange={e => setFormData({...formData, assigned_to: e.target.value})}
    >
      <option value="">-- Select Staff --</option>
      
     {/* ... inside the select tag ... */}

{staffMembers.map(staff => (
  <option key={staff._id} value={staff._id}>
    {/* LOGIC: 
       1. If Name exists -> "Name"
       2. If Name missing -> "Email"
       3. If both missing -> "User (ID)"
    */}
    {staff.name 
      ? staff.name 
      : (staff.email || `User ${staff._id.slice(-4)}`)
    } 
  </option>
))}
      
    </select>
  </div>
)}

              {/* UPDATE FIELDS (Visible only when Editing) */}
              {editingLead && (
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Update Status</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="CLOSED_WON">Closed (Won)</option>
                      <option value="CLOSED_LOST">Closed (Lost)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Add Remark / Comment</label>
                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      rows="2"
                      placeholder="e.g. Called client, they asked to call back tomorrow..."
                      value={formData.comment}
                      onChange={e => setFormData({...formData, comment: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded font-medium">
                  {editingLead ? "Update Lead" : "Create Lead"}
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