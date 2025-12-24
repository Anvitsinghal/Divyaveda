import { Product } from "../models/product.master.js";
import { Category } from "../models/category.master.js";
import { SubCategory } from "../models/subcategory.master.js";
// Import the helper we created to upload files
import { uploadToCloudinary } from "../middleware/fileUpload.js"; 

// 1. CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      subcategory_id,
      stock_quantity,
      volume,
      is_new_launch,
      isActive,
      advantages
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ message: "Name, price and category are required" });
    }

    // -- VALIDATE CATEGORY --
    const category = await Category.findOne({ _id: category_id, isActive: true });
    if (!category) {
      return res.status(404).json({ message: "Category not found or inactive" });
    }

    // -- VALIDATE SUBCATEGORY (If provided) --
    if (subcategory_id) {
      const subCategory = await SubCategory.findOne({ _id: subcategory_id, isActive: true });
      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found or inactive" });
      }
    }

    // -- HANDLE IMAGE UPLOADS --
    let mainImageUrl = "";
    let galleryUrls = [];

    // A. Main Image
    if (req.files && req.files.main_image && req.files.main_image[0]) {
      mainImageUrl = await uploadToCloudinary(req.files.main_image[0].path);
    }

    // B. Gallery Images
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.path);
        if (url) galleryUrls.push(url);
      }
    }

    // -- CREATE DATABASE ENTRY --
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category_id,
      subcategory_id: subcategory_id || null,
      stock_quantity: Number(stock_quantity || 0),
      volume,
      // FormData sends booleans as strings "true"/"false", so we parse them if needed
      is_new_launch: is_new_launch === "true", 
      isActive: isActive === "true",
      advantages: advantages || [], // Multer handles array fields automatically if sent correctly
      main_image: mainImageUrl,     // Save the Cloudinary URL
      images: galleryUrls,          // Save the array of Cloudinary URLs
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    // Removed { isActive: true } so Admin can see Inactive products too
    const products = await Product.find()
      .populate("category_id", "name")
      .populate("subcategory_id", "name")
      .sort({ created_at: -1 });

    res.json({ products }); // Wrap in object to match frontend expectation res.data.products
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
      .populate("subcategory_id", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, stock_quantity,
      category_id, subcategory_id, volume,
      is_new_launch, isActive, advantages,
      existing_main_image, existing_images // Frontend sends these to keep old images
    } = req.body;

    // -- HANDLE IMAGES --
    
    // 1. Main Image: Use new upload OR fallback to existing URL
    let mainImageUrl = existing_main_image || "";
    if (req.files && req.files.main_image && req.files.main_image[0]) {
      mainImageUrl = await uploadToCloudinary(req.files.main_image[0].path);
    }

    // 2. Gallery: Start with existing URLs (ensure it's an array)
    let galleryUrls = [];
    if (existing_images) {
      // If only 1 string is sent, express/multer might make it a string, not array. Force Array.
      galleryUrls = Array.isArray(existing_images) ? existing_images : [existing_images];
    }

    // 3. Add NEW Gallery uploads
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const url = await uploadToCloudinary(file.path);
        if (url) galleryUrls.push(url);
      }
    }

    // -- PREPARE UPDATES --
    const updates = {
      name,
      description,
      price: Number(price),
      stock_quantity: Number(stock_quantity),
      volume,
      category_id,
      subcategory_id: subcategory_id || null,
      is_new_launch: is_new_launch === "true",
      isActive: isActive === "true",
      advantages: advantages || [],
      main_image: mainImageUrl,
      images: galleryUrls,
      updated_by: req.user.id
    };

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 5. DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    // Hard Delete (Remove completely)
    const product = await Product.findByIdAndDelete(req.params.id);

    // OR Soft Delete (if you prefer):
    /*
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updated_by: req.user.id },
      { new: true }
    );
    */

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};