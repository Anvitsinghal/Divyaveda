import { User } from "../../models/user.master.js";
import { Role } from "../../models/role.master.js";

// ✅ Helper to escape regex safely
const escapeRegex = (text = "") => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    // Guard: empty or very small query
    if (!query || query.trim().length < 2) {
      return res.json({ users: [] });
    }

    // 🔐 CRITICAL FIX
    const safeQuery = escapeRegex(query.trim());

    const users = await User.find({
      $or: [
        { username: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } }
      ]
    })
      .select("_id username email")
      .limit(10);

    res.status(200).json({ users });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ users: [] }); // never crash UI
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // FILTER: Get users where isSuperAdmin is NOT true
    const users = await User.find({ isSuperAdmin: { $ne: true } })
      .select("-password") 
      .populate("role_id", "role_name");

    res.json({ users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ... keep assignRole as it is ...
export const assignRole = async (req, res) => {
    // ... (same as before)
    try {
        const { user_id, role_id } = req.body;
        if (!user_id) return res.status(400).json({ message: "User ID is required" });
    
        if (role_id) {
          const roleExists = await Role.findById(role_id);
          if (!roleExists) return res.status(404).json({ message: "Role not found" });
        }
    
        const user = await User.findByIdAndUpdate(
          user_id,
          { role_id: role_id || null }, 
          { new: true }
        ).select("-password").populate("role_id", "role_name");
    
        if (!user) return res.status(404).json({ message: "User not found" });
    
        res.json({ message: "Role assigned successfully", user });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
};