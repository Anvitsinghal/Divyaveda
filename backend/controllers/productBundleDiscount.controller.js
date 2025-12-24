import { ProductBundleDiscount } from "../models/productBundleDiscount.master.js";
import { Product } from "../models/product.master.js";
import { BundleDiscount } from "../models/bundleDiscount.master.js";

export const applyDiscountToProduct = async (req, res) => {
  try {
    const { product_id, bundle_id } = req.body;

    if (!product_id || !bundle_id) {
      return res.status(400).json({
        message: "Product and bundle discount are required"
      });
    }

   
    const product = await Product.findOne({
      _id: product_id,
      isActive: true
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

   
    const discount = await BundleDiscount.findOne({
      _id: bundle_id,
      isActive: true
    });
    if (!discount) {
      return res.status(404).json({ message: "Bundle discount not found" });
    }

    const existing = await ProductBundleDiscount.findOne({
      product_id,
      bundle_id,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Discount already applied to product"
      });
    }

    const mapping = await ProductBundleDiscount.create({
      product_id,
      bundle_id,
      isActive: true,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Discount applied to product",
      mapping
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiscountsByProduct = async (req, res) => {
  try {
    const discounts = await ProductBundleDiscount.find({
      product_id: req.params.productId,
      isActive: true
    }).populate("bundle_id");

    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeDiscountFromProduct = async (req, res) => {
  try {
    const mapping = await ProductBundleDiscount.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!mapping) {
      return res.status(404).json({
        message: "Mapping not found"
      });
    }

    res.json({
      message: "Discount removed from product"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

