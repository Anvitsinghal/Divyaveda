import mongoose from "mongoose";
import { ManufacturingLog } from "../models/manufacturingLog.master.js";
import { RawMaterial } from "../models/rawMaterial.master.js";
import { Product } from "../models/product.master.js";

export const createManufacturingLog = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      product_id,
      material_id,
      material_used_quantity,
      manufactured_quantity
    } = req.body;

    if (
      !product_id ||
      !material_id ||
      material_used_quantity <= 0 ||
      manufactured_quantity <= 0
    ) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid manufacturing data"
      });
    }

    // validate product
    const product = await Product.findOne({
      _id: product_id,
      isActive: true
    }).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // validate raw material
    const material = await RawMaterial.findOne({
      _id: material_id,
      isActive: true
    }).session(session);

    if (!material) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Raw material not found"
      });
    }

    // check sufficient raw material
    if (material.current_quantity < material_used_quantity) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient raw material stock"
      });
    }

    // consume raw material
    material.current_quantity -= material_used_quantity;
    material.updated_by = req.user.id;
    await material.save({ session });

    // increase product stock
    product.stock_quantity += manufactured_quantity;
    product.updated_by = req.user.id;
    await product.save({ session });

    // create manufacturing log
    const log = await ManufacturingLog.create(
      [
        {
          product_id,
          material_id,
          material_used_quantity,
          manufactured_quantity,
          created_by: req.user.id
        }
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: "Manufacturing recorded successfully",
      log: log[0]
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


export const getManufacturingLogs = async (req, res) => {
  try {
    const logs = await ManufacturingLog.find()
      .populate("product_id", "name")
      .populate("material_id", "name unit")
      .sort({ created_at: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
