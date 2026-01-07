import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userAdminRoutes from "./routes/admin/user.routes.js"
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import publicProductRoutes from "./routes/public/product.public.routes.js";
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
import b2bRoutes from "./routes/admin/b2b.routes.js";

import leadRoutes from "./routes/admin/lead.routes.js"; // <--- Import
console.log("🔥 BACKEND BOOTED AT", new Date().toISOString());

dotenv.config();//for loading env variables
const app = express();//making instance of express
 //middlewares that run in between response and request
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://divyaveda.in",
      "https://www.divyaveda.in"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

app.use(express.json({ limit: "10mb" }));//data uploading limit
app.use(express.urlencoded({ extended: true }));//to parse the url

app.get("/health", (req, res) => { //for devops->Quick backend alive test
  res.json({
    status: "OK",
    time: new Date().toISOString()
  });
});
//declaration of routes:-
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin/users", userAdminRoutes);
app.use("/api/products", publicProductRoutes);
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
app.use("/api/admin/b2b", b2bRoutes);

// ... existing routes ...
app.use("/api/admin/leads", leadRoutes); // <--- Add this
app.get("/", (req, res) => { //server starts
  res.json({
    message: "Backend is running",
    status: "OK"
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});
const PORT = process.env.PORT || 8000;

mongoose //connect mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log("BREVO KEY LOADED:", !!process.env.BREVO_API_KEY);

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err);
  });
