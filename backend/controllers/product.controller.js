import { Product } from "../models/product.master.js";
import { Category } from "../models/category.master.js";
import { SubCategory } from "../models/subcategory.master.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      subcategory_id,
      images,
      main_image,
      stock_quantity,
      volume,
      advantages
    } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({
        message: "Name, price and category are required"
      });
    }

    const category = await Category.findOne({
      _id: category_id,
      isActive: true
    });
    if (!category) {
      return res.status(404).json({
        message: "Category not found or inactive"
      });
    }

    if (subcategory_id) {
      const subCategory = await SubCategory.findOne({
        _id: subcategory_id,
        isActive: true
      });
      if (!subCategory) {
        return res.status(404).json({
          message: "Subcategory not found or inactive"
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category_id,
      subcategory_id,
      images,
      main_image,
      stock_quantity,
      volume,
      advantages,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category_id", "name")
      .populate("subcategory_id", "name")
      .sort({ created_at: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
      .populate("subcategory_id", "name");

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    updates.updated_by = req.user.id;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
