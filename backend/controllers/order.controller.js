import mongoose from "mongoose";
import { Order } from "../models/order.master.js";
import { Cart } from "../models/cart.master.js";
import { Product } from "../models/product.master.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    const cartItems = await Cart.find({ user_id: userId })
      .populate("product_id")
      .session(session);

    if (cartItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (item.product_id.stock_quantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${item.product_id.name}`
        });
      }

      const itemTotal = item.product_id.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: item.product_id._id,
        name: item.product_id.name,
        price: item.product_id.price,
        quantity: item.quantity
      });
    }

    const order = await Order.create(
      [
        {
          user_id: userId,
          items: orderItems,
          total_amount: totalAmount,
          status: "PLACED",
          created_by: userId
        }
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: "Order created successfully",
      order: order[0]
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .sort({ created_at: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "PLACED",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
