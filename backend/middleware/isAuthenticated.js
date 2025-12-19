import jwt from "jsonwebtoken";
import { User } from "../models/user.master.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      isActive: true
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid or inactive user"
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      isSuperAdmin: user.email === process.env.SUPERADMIN_EMAIL
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};
