import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const navigate = useNavigate();
  
  // --- STATE (Matches Backend Schema) ---
  const [formData, setFormData] = useState({
    username: "",       // Was "name"
    email: "",
    password: "",
    phone_number: ""    // Was "phone"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Sending Data:", formData); // Debug log
      await api.post("/auth/register", formData);
      
      alert("Registration Successful! Please Login.");
      navigate("/login");
    } catch (err) {
      console.error("Register Error:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] p-6 lg:p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">Create Account</h1>
          <p className="text-[var(--text-secondary)] text-sm">Quick Register (Testing Mode)</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 dark:bg-red-900/20 border border-red-500/50 dark:border-red-900/50 rounded text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 uppercase font-bold">Full Name / Username</label>
            <input 
              type="text" 
              name="username"  // Matched to State
              placeholder="John Doe"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 uppercase font-bold">Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="john@example.com"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 uppercase font-bold">Phone Number</label>
            <input 
              type="tel" 
              name="phone_number" // Matched to State
              placeholder="9876543210"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={formData.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 uppercase font-bold">Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] text-[var(--text-primary)] p-3 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg shadow-blue-900/30
              ${loading ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 hover:scale-[1.02]"}`
            }
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>

        </form>

        {/* Footer Link */}
        <p className="text-[var(--text-muted)] text-center text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;