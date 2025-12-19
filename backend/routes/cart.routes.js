import express from "express";
import {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from "../controllers/cart.controller.js";

import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, addToCart);
router.get("/", isAuthenticated, getMyCart);
router.put("/:id", isAuthenticated, updateCartItem);
router.delete("/:id", isAuthenticated, removeCartItem);
router.delete("/", isAuthenticated, clearCart);

export default router;
