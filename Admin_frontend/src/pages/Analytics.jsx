import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [dau, setDau] = useState([]);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const safeExtract = (data, key) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data[key])) return data[key];
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  };

  // 1. Load Initial Dashboard Data
  const loadDashboardData = async () => {
    try {
      const [sessRes, dauRes] = await Promise.all([
        api.get("/admin/analytics/sessions"),
        api.get("/admin/analytics/daily-active-users")
      ]);
      setSessions(safeExtract(sessRes.data, "sessions"));
      setDau(safeExtract(dauRes.data, "daily_active_users"));
    } catch (e) {
      console.error("Dashboard load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 2. Handle User Search (Auto-Suggest)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      try {
        // NOTE: Ensure your backend has a search route or returns users at this endpoint
        // If this 404s, we need to create the backend route: router.get('/search', ...)
        const res = await api.get(`/admin/users/search?query=${searchQuery}`);
        setSearchResults(res.data.users || res.data || []);
        setShowSuggestions(true);
      } catch (e) {
        // Fallback: If no search API, user can still type exact ID
        console.warn("User search failed (API might be missing)");
      }
    }, 500); // 500ms delay to prevent spamming API

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 3. Load History for Selected User
  const loadHistory = async (userIdToFetch) => {
    if (!userIdToFetch) return;
    try {
      const res = await api.get(`/admin/analytics/login-history/${userIdToFetch}`);
      setHistory(safeExtract(res.data, "history"));
      setError("");
    } catch (e) {
      setHistory([]);
      setError("Could not load history for this user");
    }
  };

  // 4. Handle Selection from Dropdown
  const handleSelectUser = (user) => {
    setSelectedUserId(user._id);
    setSearchQuery(user.email || user.username); // Show name in box
    setShowSuggestions(false); // Hide dropdown
    loadHistory(user._id); // Auto-load history
  };

  // Helper to render user info safely
  const renderUserLabel = (userField) => {
    if (!userField) return "Guest";
    if (typeof userField === 'object') {
        return userField.username || userField.email || userField._id;
    }
    return userField;
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Analytics...</div>;

  return (
    <PermissionGate routeName="ANALYTICS_USER_VIEW">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* ACTIVE SESSIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="text-sm text-slate-400">Active sessions</div>
            <div className="text-3xl font-bold text-white">{sessions.length}</div>
            <div className="max-h-48 overflow-y-auto space-y-2 text-sm text-slate-300">
              {sessions.map((s, i) => (
                <div key={s._id || i} className="border border-slate-800 rounded-xl p-2 bg-slate-950/50">
                  <div className="font-mono text-xs text-blue-400">{s.ip_address}</div>
                  <div className="text-xs text-slate-500 truncate">User: {renderUserLabel(s.user_id)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DAILY ACTIVE USERS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="text-sm text-slate-400">Daily Active Users</div>
            <div className="text-3xl font-bold text-white">{dau.length}</div>
            <div className="max-h-48 overflow-y-auto space-y-2 text-sm text-slate-300">
               {dau.map((d, idx) => (
                <div key={idx} className="border border-slate-800 rounded-xl p-2 flex justify-between bg-slate-950/50">
                  <span>{d.date || d._id}</span>
                  <span className="font-bold text-white">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SEARCH & HISTORY (The New Part) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col relative">
            <div className="text-sm text-slate-400">User Login History</div>
            
            {/* SEARCH BAR */}
            <div className="relative">
              <input
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                placeholder="Type name or email..."
                value={searchQuery}
                onChange={e => {
                   setSearchQuery(e.target.value);
                   // If user clears input, clear ID but keep history visible if they want
                   if(e.target.value === "") setShowSuggestions(false);
                }}
                onFocus={() => { if(searchResults.length > 0) setShowSuggestions(true); }}
              />
              
              {/* DROPDOWN RESULTS */}
              {showSuggestions && searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-xl">
                  {searchResults.map((user) => (
                    <li 
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-200 border-b border-slate-700/50 last:border-0"
                    >
                      <div className="font-bold">{user.username || "No Name"}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* HISTORY LIST */}
            <div className="flex-1 overflow-y-auto space-y-2 text-sm text-slate-300 mt-2 min-h-[150px]">
              {history.length === 0 ? (
                <div className="text-center text-slate-600 py-4 text-xs">
                  {selectedUserId ? "No history found for this user" : "Select a user to view history"}
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={h._id || i} className="border border-slate-800 rounded-xl p-2 bg-slate-950/50">
                    <div className="text-green-400 text-xs">In: {new Date(h.login_time).toLocaleString()}</div>
                    <div className="text-slate-500 text-xs">
                      Out: {h.logout_time ? new Date(h.logout_time).toLocaleString() : "Active"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </PermissionGate>
  );
};

export default Analytics;