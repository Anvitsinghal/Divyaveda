import { VendorMaterialPurchase } from "../models/vendorMaterialPurchase.master.js";
import { RawMaterial } from "../models/rawMaterial.master.js";

/* ================= CREATE VENDOR MATERIAL PURCHASE ================= */
export const createVendorMaterialPurchase = async (req, res) => {
  try {
    const {
      vendor_id,
      material_id,
      quantity,
      bill_no,
      payment_status,
      bill_image
    } = req.body;

    const material = await RawMaterial.findById(material_id);
    if (!material) {
      return res.status(404).json({ message: "Raw material not found" });
    }

    material.current_quantity += Number(quantity);
    await material.save();

    const purchase = await VendorMaterialPurchase.create({
      vendor_id,
      material_id,
      quantity,
      bill_no,
      bill_image,
      payment_status,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Vendor material purchase recorded",
      purchase
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL PURCHASES ================= */
export const getAllVendorMaterialPurchases = async (req, res) => {
  try {
    const purchases = await VendorMaterialPurchase.find()
      .populate("vendor_id", "name")
      .populate("material_id", "name")
      .sort({ created_at: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET PURCHASES BY VENDOR ================= */
export const getPurchasesByVendor = async (req, res) => {
  try {
    const purchases = await VendorMaterialPurchase.find({
      vendor_id: req.params.vendorId
    })
      .populate("material_id", "name")
      .sort({ created_at: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
