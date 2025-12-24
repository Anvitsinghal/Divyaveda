import { User } from "../../models/user.master.js"; // Ensure path to User model is correct
import { Role } from "../../models/role.master.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search for users where Username OR Email matches the query (Case-Insensitive)
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    })
    .select("_id username email") // ONLY return these fields (Security best practice)
    .limit(10); // Limit results to prevent crashing the UI

    res.status(200).json({ users });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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