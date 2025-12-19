import { Product } from "../models/product.master.js";
import { Category } from "../models/category.master.js";
import { SubCategory } from "../models/subcategory.master.js";

/* ================= GET ALL PRODUCTS (PUBLIC) ================= */
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      search
    } = req.query;

    const query = { isActive: true };

    if (category) query.category_id = category;
    if (subcategory) query.subcategory_id = subcategory;

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("category_id", "name")
      .populate("subcategory_id", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ created_at: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PRODUCT BY ID (PUBLIC) ================= */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate("category_id", "name")
      .populate("subcategory_id", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
