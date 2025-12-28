import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

// Charts
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [dau, setDau] = useState([]);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserLabel, setSelectedUserLabel] = useState("");

  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------------- SAFE DATA EXTRACT ----------------
  const safeExtract = (data, key) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data[key])) return data[key];
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  };

  // ---------------- LOAD DASHBOARD ----------------
  const loadDashboardData = async () => {
    try {
      const sessRes = await api.get("/admin/analytics/sessions");
      const dauRes = await api.get("/admin/analytics/daily-active-users");

      // ---- Sessions (unchanged)
      const sessionData =
        sessRes.data.sessions ||
        sessRes.data.data ||
        sessRes.data ||
        [];

      setSessions(Array.isArray(sessionData) ? sessionData : []);

      // ---- DAU (🔥 ONLY FIX HERE 🔥)
      const rawDau =
        dauRes.data.daily_active_users ||
        dauRes.data.dailyActiveUsers ||
        dauRes.data.dau ||
        dauRes.data.data ||
        dauRes.data ||
        null;

      // BACKEND RETURNS OBJECT → WRAP INTO ARRAY
      const dauArray = Array.isArray(rawDau)
        ? rawDau
        : rawDau
          ? [rawDau]
          : [];

      setDau(dauArray);

    } catch (e) {
      console.error("Dashboard load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ---------------- USER SEARCH ----------------
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await api.get(
          `/admin/users/search?query=${searchQuery}`
        );
        setSearchResults(res.data.users || res.data || []);
        setShowSuggestions(true);
      } catch {
        console.warn("Search API missing");
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // ---------------- LOAD HISTORY (UNCHANGED) ----------------
  const loadHistory = async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(
        `/admin/analytics/login-history/${userId}`
      );
      setHistory(safeExtract(res.data, "history"));
      setError("");
    } catch {
      setHistory([]);
      setError("Could not load history");
    }
  };

  // ---------------- HELPERS ----------------
  const renderUserLabel = (user) => {
    if (!user) return "Guest";
    if (typeof user === "object") {
      return user.username || user.email || user._id;
    }
    return user;
  };

  const handleSelectUser = (user) => {
    setSelectedUserId(user._id);
    setSelectedUserLabel(user.username || user.email);
    setSearchQuery(user.email || user.username);
    setShowSuggestions(false);
    loadHistory(user._id);
  };

  const clearSelection = () => {
    setSelectedUserId("");
    setSelectedUserLabel("");
    setSearchQuery("");
    setHistory([]);
  };

  // ---------------- CHART DATA ----------------

  // 🔥 FIXED DAU MAPPING (uses totalActiveUsers)
  const dauChartData = dau.map(d => ({
    date: new Date(d.date).toLocaleDateString(),
    count: d.totalActiveUsers
  }));

  const sessionChartData = Object.values(
    sessions.reduce((acc, s) => {
      const label = renderUserLabel(s.user_id);
      acc[label] = acc[label] || {
        label,
        count: 0,
        userId: typeof s.user_id === "object" ? s.user_id._id : null
      };
      acc[label].count += 1;
      return acc;
    }, {})
  );

  if (loading) {
    return <div className="p-6 text-slate-400">Loading Analytics...</div>;
  }

  return (
    <PermissionGate routeName="ANALYTICS_USER_VIEW">
      <div className="space-y-6">

        <h1 className="text-2xl font-bold text-white">
          Analytics Dashboard
        </h1>

        {selectedUserLabel && (
          <div className="flex items-center justify-between bg-slate-900 border border-blue-500/30 rounded-xl px-4 py-2 text-sm">
            <span className="text-blue-400">
              Viewing analytics for: <b>{selectedUserLabel}</b>
            </span>
            <button
              onClick={clearSelection}
              className="text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          </div>
        )}

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">

          {/* ACTIVE SESSIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="text-sm text-slate-400">
              Active Sessions (click bar)
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sessionChartData}
                  onClick={(data) => {
                    if (!data?.activePayload?.[0]) return;
                    const payload = data.activePayload[0].payload;
                    if (payload.userId) {
                      setSelectedUserId(payload.userId);
                      setSelectedUserLabel(payload.label);
                      loadHistory(payload.userId);
                    }
                  }}
                >
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="label" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#38bdf8"
                    cursor="pointer"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DAILY ACTIVE USERS (FIXED) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="text-sm text-slate-400">
              Daily Active Users
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dauChartData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* USER LOGIN HISTORY (UNCHANGED) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col relative">
            <div className="text-sm text-slate-400">
              User Login History
            </div>

            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length && setShowSuggestions(true)}
            />

            {showSuggestions && searchResults.length > 0 && (
              <ul className="absolute top-20 z-10 w-full bg-slate-800 border border-slate-700 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map(user => (
                  <li
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-sm"
                  >
                    <b>{user.username || "No Name"}</b>
                    <div className="text-xs text-slate-400">
                      {user.email}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {history.length === 0 ? (
                <div className="text-slate-600 text-center mt-6">
                  Select a user to view history
                </div>
              ) : (
                history.map((h, i) => (
                  <div
                    key={i}
                    className="border border-slate-800 rounded-lg p-2"
                  >
                    <div className="text-green-400">
                      Login: {new Date(h.login_time).toLocaleString()}
                    </div>
                    <div className="text-slate-500">
                      Logout: {h.logout_time
                        ? new Date(h.logout_time).toLocaleString()
                        : "Active"}
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
