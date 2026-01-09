import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAdminAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Leads = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();

  let userRole = admin?.role || "";
  if (admin?.isSuperAdmin === true) {
    userRole = "Super Admin";
  }

  // --- LOCAL THEME STATE (Default to Dark) ---
  const [isDark, setIsDark] = useState(true);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [summary, setSummary] = useState({ total: 0, converted: 0, pending: 0 });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    platform: "",
    segment: "",
    client_profile: "",
    lead_status: "",
    interest_level: "",
    req_time: "",
    assigned: "", 
    search: "",
    from_date: "",
    to_date: "",
  });

  // --- EDIT FORM STATE ---
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    location: "",
    segment: "",
    company: "",
    interest_level: "",
    remarks: "", 
    req_time: "",
    call_outcome: "",
    lead_status: "",
    last_followed_up: "",
    next_follow_up: "",
    assigned_to: "",
    converted_by: "",
    converted: false,
    client_profile: ""
  });

  const isManagerOrAbove = ["Manager", "Admin", "Super Admin"].includes(userRole);

  const loadStaff = async () => {
    try {
      const res = await api.get("/admin/leads/staff");
      setStaffMembers(res.data || []);
    } catch (e) {
      console.error("Failed to load staff", e);
    }
  };

  const loadLeads = async (pageOverride = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pageOverride);
      params.set("limit", limit);

      // --- MAPPING FIXES ---
      if (filters.search) params.set("search", filters.search);
      if (filters.platform) params.set("platform", filters.platform);
      if (filters.segment) params.set("segment", filters.segment);
      if (filters.client_profile) params.set("client_profile", filters.client_profile);
      if (filters.lead_status) params.set("lead_status", filters.lead_status);
      if (filters.interest_level) params.set("interest_level", filters.interest_level);
      if (filters.req_time) params.set("req_time", filters.req_time);

      if (filters.assigned) {
          params.set("assigned", filters.assigned); 
          if (filters.assigned === "assigned") params.set("is_assigned", "true");
          if (filters.assigned === "unassigned") params.set("is_assigned", "false");
      }

      if (filters.from_date) {
          params.set("from_date", filters.from_date);
          params.set("startDate", filters.from_date);
          params.set("date_from", filters.from_date); 
          params.set("created_date_gte", filters.from_date);
      }
      if (filters.to_date) {
          params.set("to_date", filters.to_date);
          params.set("endDate", filters.to_date);
          params.set("date_to", filters.to_date);
          params.set("created_date_lte", filters.to_date);
      }

      const res = await api.get(`/admin/leads?${params.toString()}`);
      const { data = [], total = 0, convertedCount = 0, pendingCount = 0, totalPages: tp = 1, page: p = 1 } = res.data || {};
      
      setLeads(data);
      setSummary({ total, converted: convertedCount, pending: pendingCount });
      setTotalPages(tp);
      setPage(p);
    } catch (e) {
      console.error("Load Leads Error:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setTimeout(() => {
        loadLeads(1);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]); 

  useEffect(() => {
    loadLeads(1);
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.platform, 
    filters.segment, 
    filters.client_profile, 
    filters.lead_status, 
    filters.interest_level, 
    filters.req_time,
    filters.assigned, 
    filters.from_date, 
    filters.to_date
  ]);

  const openModal = (lead) => {
    setEditingLead(lead);
    setFormData({
      full_name: lead.full_name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      location: lead.location || "",
      segment: lead.segment || "",
      company: lead.company || "",
      interest_level: lead.interest_level || "",
      remarks: "", 
      req_time: lead.req_time || "",
      call_outcome: lead.call_outcome || "",
      lead_status: lead.lead_status || "CREATED",
      last_followed_up: lead.last_followed_up ? lead.last_followed_up.substring(0, 10) : "",
      next_follow_up: lead.next_follow_up ? lead.next_follow_up.substring(0, 10) : "",
      assigned_to: lead.assigned_to?._id || "",
      converted_by: lead.converted_by?._id || "",
      converted: lead.converted || false,
      client_profile: lead.client_profile || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        last_followed_up: formData.last_followed_up || null,
        next_follow_up: formData.next_follow_up || null,
      };

      await api.put(`/admin/leads/${editingLead._id}`, payload);
      setIsModalOpen(false);
      setEditingLead(null);
      loadLeads(page);
    } catch (e) {
      alert("Update Failed: " + (e.response?.data?.message || e.message));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if(key !== "search") setPage(1);
  };

  const nextPage = () => { if (page < totalPages) loadLeads(page + 1); };
  const prevPage = () => { if (page > 1) loadLeads(page - 1); };
  
  const syncSheet = async () => {
    try {
      const res = await api.post("/admin/leads/sync-sheet");
      alert(res.data.message || "Sheet synced");
      await loadLeads();
    } catch (e) {
      alert("Sync failed: " + (e.response?.data?.message || e.message));
    }
  };

  const exportPDF = async () => {
    try {
        const doc = new jsPDF("l"); 
        doc.text("Full Leads Report", 14, 15);
        
        const params = new URLSearchParams();
        params.set("limit", 10000); 
        
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });
        if (filters.from_date) {
            params.set("startDate", filters.from_date);
            params.set("date_from", filters.from_date);
        }
        if (filters.to_date) {
            params.set("endDate", filters.to_date);
            params.set("date_to", filters.to_date);
        }

        const res = await api.get(`/admin/leads?${params.toString()}`);
        const allLeads = res.data?.data || [];

        autoTable(doc, {
            startY: 20,
            head: [["Date", "Name", "Phone", "Email", "Platform", "Segment", "Status", "Assigned"]],
            body: allLeads.map(l => [
                l.created_date,
                l.full_name,
                l.phone,
                l.email || "-",
                l.platform || "-",
                l.segment || "-",
                l.lead_status,
                l.assigned_to?.name || "Unassigned"
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 163, 74] } 
        });
        
        doc.save("divyaveda_leads_export.pdf");
    } catch (e) {
        console.error("Export failed", e);
        alert("Failed to export PDF");
    }
  };

  const getLatestRemark = (remarks) => {
    if (Array.isArray(remarks) && remarks.length > 0) {
        const last = remarks[remarks.length - 1];
        return typeof last === 'object' ? last.text : last;
    }
    return typeof remarks === 'string' ? remarks : "-";
  };

  // --- DYNAMIC STYLES BASED ON LOCAL TOGGLE ---
  const containerClass = isDark 
    ? "min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200"
    : "min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200";

  const cardClass = isDark 
    ? "bg-slate-900 border border-slate-800" 
    : "bg-white border border-gray-200";

  const inputClass = isDark 
    ? "w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors"
    : "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-colors";

  const labelClass = isDark 
    ? "block mb-1 text-xs font-semibold text-slate-400 uppercase"
    : "block mb-1 text-xs font-semibold text-gray-600 uppercase";

  const tableHeaderClass = isDark
    ? "text-xs text-slate-200 uppercase bg-slate-950 border-b border-slate-800"
    : "text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200";
    
  const tableRowClass = isDark
    ? "bg-slate-900 hover:bg-slate-800 border-slate-800"
    : "bg-white hover:bg-gray-50 border-gray-200";

  return (
    <div className={containerClass}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-4">
            <div>
                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Lead Management</h1>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>Manage and track your potential clients</p>
            </div>
            
            {/* --- LOCAL THEME TOGGLE BUTTON --- */}
            <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full border shadow-sm transition-all ${isDark ? "bg-slate-800 border-slate-700 text-yellow-400" : "bg-white border-gray-300 text-slate-600"}`}
                title="Toggle Theme"
            >
                {isDark ? "☀️" : "🌙"}
            </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => loadLeads(page)} className={`${isDark ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"} border px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2`}>
            🔄 <span className="hidden sm:inline">Refresh</span>
          </button>
          {admin?.isSuperAdmin === true && (
            <>
                <button onClick={syncSheet} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                    📥 <span className="hidden sm:inline">Sync Sheet</span>
                </button>
                <button onClick={exportPDF} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2">
                    📄 <span className="hidden sm:inline">Export PDF</span>
                </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardClass} rounded-xl p-5 shadow-sm flex flex-col items-center sm:items-start`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-gray-500"}`}>Total Leads</div>
          <div className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{summary.total}</div>
        </div>
        <div className={`${cardClass} rounded-xl p-5 shadow-sm flex flex-col items-center sm:items-start border-l-4 border-l-green-500`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-gray-500"}`}>Converted</div>
          <div className={`text-3xl font-bold mt-1 ${isDark ? "text-green-400" : "text-green-600"}`}>{summary.converted}</div>
        </div>
        <div className={`${cardClass} rounded-xl p-5 shadow-sm flex flex-col items-center sm:items-start border-l-4 border-l-yellow-400`}>
          <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-gray-500"}`}>Pending</div>
          <div className={`text-3xl font-bold mt-1 ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>{summary.pending}</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className={`${cardClass} p-4 rounded-xl shadow-sm transition-colors`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Search */}
            <input 
              placeholder="Search name/phone/email..." 
              value={filters.search} 
              onChange={(e) => handleFilterChange("search", e.target.value)} 
              className={`${inputClass} sm:col-span-2 md:col-span-1`} 
            />
            
            <select value={filters.platform} onChange={(e) => handleFilterChange("platform", e.target.value)} className={inputClass}>
                <option value="">All Platforms</option>
                <option value="fb">Facebook</option>
                <option value="ig">Instagram</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="others">Others</option>
            </select>
            
            <select value={filters.segment} onChange={(e) => handleFilterChange("segment", e.target.value)} className={inputClass}>
                <option value="">All Segments</option>
                <option value="pcd">PCD</option>
                <option value="tp">Third Party</option>
                <option value="others">Others</option>
            </select>
            
            <select value={filters.client_profile} onChange={(e) => handleFilterChange("client_profile", e.target.value)} className={inputClass}>
                <option value="">All Profiles</option>
                <option value="distributor">Distributor</option>
                <option value="pcd aspirant">PCD Aspirant</option>
                <option value="brand owner">Brand Owner</option>
                <option value="retailer">Retailer</option>
                <option value="medical store">Medical Store</option>
                <option value="doctor">Doctor</option>
                <option value="clinic">Clinic</option>
                <option value="others">Others</option>
            </select>

            <select value={filters.lead_status} onChange={(e) => handleFilterChange("lead_status", e.target.value)} className={inputClass}>
                <option value="">All Statuses</option>
                <option value="CREATED">Created</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="FOLLOW_UP">Follow Up</option>
                <option value="CLOSED_WON">Closed (Won)</option>
                <option value="CLOSED_LOST">Closed (Lost)</option>
            </select>

            <select value={filters.interest_level} onChange={(e) => handleFilterChange("interest_level", e.target.value)} className={inputClass}>
                <option value="">Interest Level</option>
                <option value="ni">Not Interested</option>
                <option value="mi">Marginal Interest</option>
                <option value="i">Interested</option>
                <option value="hi">Highly Interested</option>
            </select>

            <select value={filters.req_time} onChange={(e) => handleFilterChange("req_time", e.target.value)} className={inputClass}>
                <option value="">Req Time</option>
                <option value="imm">Immediate</option>
                <option value="1mon">1 Month</option>
                <option value="3mon">3 Months</option>
                <option value="future">Future</option>
            </select>

            <select value={filters.assigned} onChange={(e) => handleFilterChange("assigned", e.target.value)} className={inputClass}>
                <option value="">Assignment</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
            </select>

            <div className="flex flex-col">
                <label className={`text-[10px] uppercase mb-1 ${isDark ? "text-slate-500" : "text-gray-400"}`}>From</label>
                <input type="date" value={filters.from_date} onChange={(e) => handleFilterChange("from_date", e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-col">
                <label className={`text-[10px] uppercase mb-1 ${isDark ? "text-slate-500" : "text-gray-400"}`}>To</label>
                <input type="date" value={filters.to_date} onChange={(e) => handleFilterChange("to_date", e.target.value)} className={inputClass} />
            </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className={`${cardClass} rounded-xl overflow-hidden shadow-lg transition-colors`}>
        <div className="overflow-x-auto">
            {loading ? (
            <div className={`p-10 text-center animate-pulse ${isDark ? "text-slate-400" : "text-gray-500"}`}>Loading data...</div>
            ) : (
            <table className={`w-full text-sm text-left ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                <thead className={tableHeaderClass}>
                <tr>
                    <th className="px-4 py-3 whitespace-nowrap">S.No</th>
                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 whitespace-nowrap">Phone</th>
                    <th className="px-4 py-3 whitespace-nowrap">Segment</th>
                    <th className="px-4 py-3 whitespace-nowrap">Company</th>
                    <th className="px-4 py-3 whitespace-nowrap">Interest</th>
                    <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">Latest Remark</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 whitespace-nowrap">Next Follow Up</th>
                    <th className="px-4 py-3 whitespace-nowrap">Assigned</th>
                    <th className="px-4 py-3 whitespace-nowrap">Converted</th>
                    <th className={`px-4 py-3 whitespace-nowrap sticky right-0 z-10 shadow-l ${isDark ? "bg-slate-950" : "bg-gray-100"}`}>Action</th>
                </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-200"}`}>
                {leads.map((l, index) => (
                    <tr key={l._id} className={`${tableRowClass} group transition-colors`}>
                    <td className="px-4 py-3">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.created_date || "-"}</td>
                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>{l.full_name || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.phone || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.segment || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.company || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${l.interest_level === 'hi' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800') : 
                            l.interest_level === 'i' ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800') : 
                            (isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600')}`}>
                            {l.interest_level || "-"}
                        </span>
                    </td>
                    <td className={`px-4 py-3 text-xs truncate max-w-[200px] ${isDark ? "text-slate-500" : "text-gray-500"}`} title={getLatestRemark(l.remarks)}>
                        {getLatestRemark(l.remarks)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                            ${l.lead_status === 'CLOSED_WON' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') : 
                            l.lead_status === 'CLOSED_LOST' ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700') : 
                            (isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600')}`}>
                            {l.lead_status}
                        </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{l.next_follow_up ? new Date(l.next_follow_up).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        {l.assigned_to ? (
                             <div className="flex items-center gap-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                                    {(l.assigned_to.name?.[0] || "U").toUpperCase()}
                                </div>
                                <span>{l.assigned_to.name || "User"}</span>
                             </div>
                        ) : <span className={`text-xs italic ${isDark ? "text-slate-600" : "text-gray-400"}`}>Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        {l.converted ? <span className={`font-bold text-xs ${isDark ? "text-green-400" : "text-green-600"}`}>✔ Yes</span> : <span className={`text-xs ${isDark ? "text-slate-600" : "text-gray-400"}`}>No</span>}
                    </td>
                    
                    {/* Sticky Action Column */}
                    <td className={`px-4 py-3 whitespace-nowrap sticky right-0 border-l transition-colors z-10 ${isDark ? "bg-slate-900 group-hover:bg-slate-800 border-slate-800" : "bg-white group-hover:bg-gray-50 border-gray-100"}`}>
                        <div className="flex flex-col gap-1">
                        <button onClick={() => openModal(l)} className={`font-semibold text-xs uppercase tracking-wide text-left ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}>
                            Edit
                        </button>
                        
                        {l.converted && (
                            <button 
                            onClick={() => navigate(`/admin/b2b?lead=${l._id}`)} 
                            className={`font-semibold text-xs uppercase tracking-wide text-left ${isDark ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-800"}`}
                            >
                            
                            </button>
                        )}
                        </div>
                    </td>

                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Page <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{page}</span> of <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={prevPage} disabled={page === 1} 
            className={`px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDark ? "text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}>
            Previous
          </button>
          <button onClick={nextPage} disabled={page >= totalPages} 
            className={`px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDark ? "text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700" : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"}`}>
            Next
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && editingLead && (
        <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${isDark ? "bg-black/80" : "bg-gray-900/60"}`}>
          <div className={`rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"}`}>
            {/* Modal Header */}
            <div className={`flex justify-between items-center px-6 py-4 border-b sticky top-0 z-10 ${isDark ? "border-slate-800 bg-slate-900" : "border-gray-200 bg-white"}`}>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Edit Lead Details</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* SECTION 1: CONTACT INFO */}
              <div>
                <h3 className={`text-sm font-bold uppercase mb-3 border-b pb-1 ${isDark ? "text-blue-400 border-slate-800" : "text-blue-600 border-gray-100"}`}>Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Full Name</label>
                        <input className={inputClass}
                            value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input className={inputClass}
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input className={inputClass}
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Company</label>
                        <input className={inputClass}
                            value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Location</label>
                        <input className={inputClass}
                            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                </div>
              </div>

              {/* SECTION 2: LEAD DETAILS */}
              <div>
                <h3 className={`text-sm font-bold uppercase mb-3 border-b pb-1 ${isDark ? "text-blue-400 border-slate-800" : "text-blue-600 border-gray-100"}`}>Lead Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Segment</label>
                        <select className={inputClass}
                            value={formData.segment} onChange={e => setFormData({...formData, segment: e.target.value})}>
                             <option value="">Select</option>
                             <option value="pcd">PCD</option>
                             <option value="tp">Third Party</option>
                             <option value="both">Both</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Interest Level</label>
                        <select className={inputClass}
                            value={formData.interest_level} onChange={e => setFormData({...formData, interest_level: e.target.value})}>
                            <option value="">Select</option>
                            <option value="ni">Not Interested</option>
                            <option value="mi">Marginal Interest</option>
                            <option value="i">Interested</option>
                            <option value="hi">Highly Interested</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Client Profile</label>
                        <select className={inputClass}
                            value={formData.client_profile} onChange={e => setFormData({...formData, client_profile: e.target.value})}>
                            <option value="">Select</option>
                            <option value="distributor">Distributor</option>
                            <option value="pcd aspirant">PCD Aspirant</option>
                            <option value="brand owner">Brand Owner</option>
                            <option value="retailer">Retailer</option>
                            <option value="medical store">Medical Store</option>
                            <option value="doctor">Doctor</option>
                            <option value="clinic">Clinic</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Req Time</label>
                        <select className={inputClass}
                            value={formData.req_time} onChange={e => setFormData({...formData, req_time: e.target.value})}>
                            <option value="">Select</option>
                            <option value="imm">Immediate</option>
                            <option value="1mon">1 Month</option>
                            <option value="future">Future</option>
                        </select>
                    </div>
                </div>
              </div>

              {/* SECTION 3: STATUS & ASSIGNMENT */}
              <div>
                <h3 className={`text-sm font-bold uppercase mb-3 border-b pb-1 ${isDark ? "text-blue-400 border-slate-800" : "text-blue-600 border-gray-100"}`}>Status & Action</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Lead Status</label>
                        <select className={inputClass}
                            value={formData.lead_status} onChange={e => setFormData({...formData, lead_status: e.target.value})}>
                            <option value="CREATED">Created</option>
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="INTERESTED">Interested</option>
                            <option value="FOLLOW_UP">Follow Up</option>
                            <option value="CLOSED_WON">Closed (Won)</option>
                            <option value="CLOSED_LOST">Closed (Lost)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Call Outcome</label>
                       <select
  value={formData.call_outcome}
  onChange={(e) =>
    setFormData({ ...formData, call_outcome: e.target.value })
  }
  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
>
  <option value="">Select</option>
  <option value="connected">Connected</option>
  <option value="not_connected">Not Connected</option>
</select>

                    </div>
                    <div>
                        <label className={labelClass}>Assign To</label>
                        <select className={inputClass}
                             disabled={!isManagerOrAbove}
                             value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                            <option value="">-- Unassigned --</option>
                            {staffMembers.map(s => (
                                <option key={s._id} value={s._id}>{s.name || s.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Last Follow Up</label>
                        <input type="date" className={inputClass}
                            value={formData.last_followed_up} onChange={e => setFormData({...formData, last_followed_up: e.target.value})} />
                    </div>
                    <div>
                        <label className={labelClass}>Next Follow Up</label>
                        <input type="date" className={inputClass}
                            value={formData.next_follow_up} onChange={e => setFormData({...formData, next_follow_up: e.target.value})} />
                    </div>
                </div>
              </div>

              {/* SECTION 4: CONVERSION */}
              <div>
                <h3 className={`text-sm font-bold uppercase mb-3 border-b pb-1 ${isDark ? "text-green-400 border-slate-800" : "text-green-600 border-gray-100"}`}>Conversion Details</h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border ${isDark ? "bg-green-900/10 border-green-900/30" : "bg-green-50 border-green-100"}`}>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="converted" className={`w-5 h-5 rounded focus:ring-green-500 ${isDark ? "text-green-600 border-slate-600 bg-slate-800" : "text-green-600 border-gray-300"}`}
                            checked={formData.converted} onChange={e => setFormData({...formData, converted: e.target.checked})} />
                        <label htmlFor="converted" className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Mark as Converted</label>
                    </div>
                    <div>
                        <label className={labelClass}>Converted By</label>
                        <select className={inputClass}
                             value={formData.converted_by} onChange={e => setFormData({...formData, converted_by: e.target.value})}>
                            <option value="">-- Select --</option>
                            {staffMembers.map(s => (
                                <option key={s._id} value={s._id}>{s.name || s.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
              </div>

              {/* REMARKS */}
              <div>
                 <label className={labelClass}>Add New Remark</label>
                 <textarea className={inputClass}
                    rows="3" placeholder="Type notes here..."
                    value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
              </div>

              {/* ACTION BUTTONS */}
              <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-2.5 border rounded-lg font-medium transition-colors ${isDark ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors">Save Changes</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;