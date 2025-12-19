import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// ===== ROUTES =====
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";

// public
import publicProductRoutes from "./routes/public/product.public.routes.js";

// admin routes
import categoryRoutes from "./routes/admin/category.routes.js";
import subcategoryRoutes from "./routes/admin/subcategory.routes.js";
import productRoutes from "./routes/admin/product.routes.js";
import relatedProductRoutes from "./routes/admin/relatedProduct.routes.js";

import bundleDiscountRoutes from "./routes/admin/bundleDiscount.routes.js";
import productBundleDiscountRoutes from "./routes/admin/productBundleDiscount.routes.js";

import vendorRoutes from "./routes/admin/vendor.routes.js";
import rawMaterialRoutes from "./routes/admin/rawMaterial.routes.js";
import vendorMaterialPurchaseRoutes from "./routes/admin/vendorMaterialPurchase.routes.js";
import manufacturingRoutes from "./routes/admin/manufacturing.routes.js";

import roleRoutes from "./routes/admin/role.routes.js";
import screenRoutes from "./routes/admin/screen.routes.js";
import userRoleMapRoutes from "./routes/admin/userRoleMap.routes.js";
import analyticsRoutes from "./routes/admin/analytics.routes.js";

// ===== CONFIG =====
dotenv.config();
const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString()
  });
});

// ===== AUTH & USER =====
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

// ===== PUBLIC APIs =====
app.use("/api/products", publicProductRoutes);

// ===== ADMIN APIs =====
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/subcategories", subcategoryRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/related-products", relatedProductRoutes);

app.use("/api/admin/bundle-discounts", bundleDiscountRoutes);
app.use("/api/admin/product-bundle-discounts", productBundleDiscountRoutes);

app.use("/api/admin/vendors", vendorRoutes);
app.use("/api/admin/raw-materials", rawMaterialRoutes);
app.use("/api/admin/vendor-purchases", vendorMaterialPurchaseRoutes);
app.use("/api/admin/manufacturing", manufacturingRoutes);

app.use("/api/admin/roles", roleRoutes);
app.use("/api/admin/screens", screenRoutes);
app.use("/api/admin/user-roles", userRoleMapRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

// ===== DATABASE + SERVER START =====
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
