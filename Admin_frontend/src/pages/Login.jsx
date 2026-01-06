import { useState } from "react";
import { useAdminAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // UI State
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Disable button
    
    try {
      await login(email, password);
      // Check if user was trying to go somewhere specific, otherwise go to Dashboard
      const redirectTo = location.state?.from?.pathname || "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
      setIsLoading(false); // Re-enable button on error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="bg-[var(--bg-card)] p-6 lg:p-8 rounded-2xl border border-[var(--border-primary)] shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-2">Admin Portal</h1>
          <p className="text-[var(--text-secondary)]">Sign in to manage your inventory</p>
        </div>

        {error && (
          <div className="bg-red-500/10 dark:bg-red-900/20 border border-red-500/50 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3 mb-6 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-lg p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-white transition duration-200
              ${isLoading 
                ? "bg-gray-400 dark:bg-gray-700 cursor-wait" 
                : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
              }`}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Secure System • Authorized Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;