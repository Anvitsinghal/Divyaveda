import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.master.js";
import { UserAnalysis } from "../models/userAnalysis.master.js";
import { Order } from "../models/order.master.js";
import { Payment } from "../models/payment.master.js";
import { Cart } from "../models/cart.master.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, phone_number } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isActive) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      phone_number,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email});
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    if (!user.isActive){
        return res.status(404).json({ message: "Account has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    
    user.last_login = new Date();
    await user.save();

    await UserAnalysis.create({
      user_id: user._id,
      session_id: new Date().getTime().toString(),
      ip_address: req.ip,
      user_agent: req.headers["user-agent"]
    });

    res.json({
      message: "Login successful",
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateMe = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    
    await UserAnalysis.findOneAndUpdate(
      { user_id: req.user.id, logout_time: null },
      { logout_time: new Date() }
    );

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteMe = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required to delete account"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user || user.isActive === false) {
      return res.status(404).json({
        message: "User not found or already deactivated"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    
    user.isActive = false;
    user.updated_by = user._id.toString();
    await user.save();

    
    await UserAnalysis.findOneAndUpdate(
      { user_id: user._id, logout_time: null },
      { logout_time: new Date() }
    );

    res.json({
      message: "Account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await User.findById(userId).select("-password");

    const sessions = await UserAnalysis.find({ user_id: userId })
      .sort({ created_at: -1 });

    const orders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 });

    const payments = await Payment.find({
      order_id: { $in: orders.map(o => o._id) }
    });

    const cart = await Cart.find({ user_id: userId })
      .populate("product_id");

    res.json({
      profile,
      sessions,
      orders,
      payments,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


