import express from "express";
import { register, login, logout, getMe, updateMe, deleteMe,verifyOtpAndRegister ,sendOtp} 
from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();
router.post("/send-otp", sendOtp);
router.post("/verify-otp-register", verifyOtpAndRegister);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

router.get("/me", isAuthenticated, getMe);
router.put("/me", isAuthenticated, updateMe);
router.delete("/me", isAuthenticated, deleteMe);

export default router;
