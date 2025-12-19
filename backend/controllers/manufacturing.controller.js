import mongoose from "mongoose";
import { ManufacturingLog } from "../models/manufacturingLog.master.js";
import { RawMaterial } from "../models/rawMaterial.master.js";
import { Product } from "../models/product.master.js";

/**
 * CREATE MANUFACTURING LOG
 * - consumes raw material
 * - increases product stock
 * - atomic transaction
 */
export const createManufacturingLog = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      product_id,
      material_id,
      quantity_used,
      manufactured_qty
    } = req.body;

    const rawMaterial = await RawMaterial.findById(material_id).session(session);
    if (!rawMaterial) {
      throw new Error("Raw material not found");
    }

    if (rawMaterial.current_quantity < quantity_used) {
      throw new Error("Insufficient raw material stock");
    }

    // subtract raw material
    rawMaterial.current_quantity -= quantity_used;
    await rawMaterial.save({ session });

    // add product stock
    const product = await Product.findById(product_id).session(session);
    if (!product) {
      throw new Error("Product not found");
    }

    product.stock += manufactured_qty;
    await product.save({ session });

    // log manufacturing
    const log = await ManufacturingLog.create(
      [
        {
          product_id,
          material_id,
          quantity_used,
          manufactured_qty,
          created_by: req.user.id
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Manufacturing entry created",
      log: log[0]
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET ALL MANUFACTURING LOGS
 */
export const getAllManufacturingLogs = async (req, res) => {
  try {
    const logs = await ManufacturingLog.find()
      .populate("product_id", "name")
      .populate("material_id", "name")
      .sort({ created_at: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET MANUFACTURING LOGS BY PRODUCT
 */
export const getLogsByProduct = async (req, res) => {
  try {
    const logs = await ManufacturingLog.find({
      product_id: req.params.productId
    })
      .populate("material_id", "name")
      .sort({ created_at: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
