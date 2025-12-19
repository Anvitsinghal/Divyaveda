import { Cart } from "../models/cart.master.js";
import { Product } from "../models/product.master.js";

export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || quantity <= 0) {
      return res.status(400).json({
        message: "Product and valid quantity are required"
      });
    }

    const product = await Product.findOne({
      _id: product_id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const existingItem = await Cart.findOne({
      user_id: req.user.id,
      product_id
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.json({
        message: "Cart updated",
        cartItem: existingItem
      });
    }

    const cartItem = await Cart.create({
      user_id: req.user.id,
      product_id,
      quantity
    });

    res.status(201).json({
      message: "Product added to cart",
      cartItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCart = async (req, res) => {
  try {
    const cart = await Cart.find({ user_id: req.user.id })
      .populate("product_id");

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero"
      });
    }

    const cartItem = await Cart.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user.id
      },
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.json({
      message: "Cart item updated",
      cartItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.json({
      message: "Item removed from cart"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user_id: req.user.id });

    res.json({
      message: "Cart cleared"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
