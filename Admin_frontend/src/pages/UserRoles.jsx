import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const UserRoles = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Load Data
  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/roles")
      ]);
      
      setUsers(safeExtract(usersRes, "users"));
      setRoles(safeExtract(rolesRes, "roles"));
    } catch (e) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Assignment (FIXED: Updates List Immediately)
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!targetUser) return;

    try {
      // Send Update
      const res = await api.post("/admin/users/assign", {
        user_id: targetUser._id,
        role_id: selectedRoleId
      });

      // Get the updated user object (POPULATED) from backend response
      const updatedUser = res.data.user;

      // UPDATE LOCAL STATE INSTANTLY (No need to reload page)
      setUsers(prevUsers => 
        prevUsers.map(u => (u._id === updatedUser._id ? updatedUser : u))
      );
      
      alert(`Role successfully updated to: ${updatedUser.role_id?.role_name || "Simple User"}`);
      setIsModalOpen(false);
      setTargetUser(null);
    } catch (e) {
      alert(e.response?.data?.message || "Assignment failed");
    }
  };

  // Helper: Open Modal
  const openModal = (user) => {
    setTargetUser(user);
    // Pre-select the role ID if it exists (handle populated object vs string ID)
    const currentId = user.role_id?._id || user.role_id || "";
    setSelectedRoleId(currentId);
    setIsModalOpen(true);
  };

  // Filter Users
 // Filter Users (Safe Version)
  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6 text-slate-400">Loading Users & Roles...</div>;

  return (
    <PermissionGate routeName="USER_ROLE_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">User Role Assignment</h1>
          <div className="text-sm text-slate-400">
            {users.length} Users Found
          </div>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* SEARCH BAR */}
        <input 
          type="text" 
          placeholder="Search users..." 
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* USERS TABLE */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-slate-500">No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-white">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    {/* DISPLAY ROLE LOGIC */}
                    {user.role_id && user.role_id.role_name ? (
                      <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded border border-blue-900/50 text-xs font-bold">
                        {user.role_id.role_name}
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 text-xs">
                        Simple User
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <PermissionGate routeName="USER_ROLE_ASSIGN">
                      <button 
                        onClick={() => openModal(user)}
                        className="text-blue-400 hover:text-blue-300 font-medium text-xs border border-blue-900/50 bg-blue-900/20 px-3 py-1.5 rounded hover:bg-blue-900/40 transition"
                      >
                        Edit Role
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL: ASSIGN ROLE */}
        {isModalOpen && targetUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-1">Assign Role</h2>
              <p className="text-slate-400 text-sm mb-4">
                User: <span className="text-white font-semibold">{targetUser.name}</span>
              </p>
              
              {/* SHOW CURRENT ROLE IN MODAL */}
              <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Currently Assigned:</span>
                <span className="text-blue-300 font-bold">
                  {targetUser.role_id?.role_name || "Simple User (No Role)"}
                </span>
              </div>

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">New Role</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    value={selectedRoleId}
                    onChange={e => setSelectedRoleId(e.target.value)}
                  >
                    <option value="">-- Remove Role (Set to Simple User) --</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.role_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800 mt-4">
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
                    Save Changes
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

export default UserRoles;
