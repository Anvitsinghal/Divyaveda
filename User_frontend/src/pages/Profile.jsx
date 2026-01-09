import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Profile = () => {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    username: "",
    phone_number: "",
    email: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        phone_number: user.phone_number || "",
        email: user.email || ""
      });
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.put("/auth/me", {
        username: form.username,
        phone_number: form.phone_number
      });
      setMessage("Profile updated");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeactivate = async () => {
    const password = prompt("Enter password to deactivate your account");
    if (!password) return;
    try {
      await api.delete("/auth/me", { data: { password } });
      logout();
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.message || "Deactivate failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              name="email"
              value={form.email}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Phone</label>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500">
              Save changes
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-500"
            >
              Deactivate account
            </button>
          </div>
        </form>
        {message && <div className="mt-4 text-green-400 text-sm">{message}</div>}
        {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
      </div>
    </div>
  );
};

export default Profile;





