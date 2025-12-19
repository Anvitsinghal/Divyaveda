import { RelatedProduct } from "../models/relatedProduct.master.js";
import { Product } from "../models/product.master.js";

export const addRelatedProduct = async (req, res) => {
  try {
    const { product_id, related_product_id } = req.body;

    if (!product_id || !related_product_id) {
      return res.status(400).json({
        message: "Both product_id and related_product_id are required"
      });
    }

    if (product_id === related_product_id) {
      return res.status(400).json({
        message: "Product cannot be related to itself"
      });
    }

    const product = await Product.findOne({ _id: product_id, isActive: true });
    const relatedProduct = await Product.findOne({
      _id: related_product_id,
      isActive: true
    });

    if (!product || !relatedProduct) {
      return res.status(404).json({
        message: "One or both products not found"
      });
    }

    const existing = await RelatedProduct.findOne({
      product_id,
      related_product_id,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Related product already added"
      });
    }

    const relation = await RelatedProduct.create({
      product_id,
      related_product_id,
      isActive: true,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Related product added",
      relation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const relations = await RelatedProduct.find({
      product_id: req.params.productId,
      isActive: true
    }).populate("related_product_id");

    res.json(relations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeRelatedProduct = async (req, res) => {
  try {
    const relation = await RelatedProduct.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!relation) {
      return res.status(404).json({
        message: "Relation not found"
      });
    }

    res.json({
      message: "Related product removed"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
