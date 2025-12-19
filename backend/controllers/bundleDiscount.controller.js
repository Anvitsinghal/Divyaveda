import { BundleDiscount } from "../models/bundleDiscount.master.js";

export const createBundleDiscount = async (req, res) => {
  try {
    const { name, discount_type, discount_value, min_quantity } = req.body;

    if (!name || !discount_type || !discount_value) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const discount = await BundleDiscount.create({
      name,
      discount_type, 
      discount_value,
      min_quantity,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Bundle discount created",
      discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBundleDiscounts = async (req, res) => {
  try {
    const discounts = await BundleDiscount.find({ isActive: true })
      .sort({ created_at: -1 });

    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBundleDiscount = async (req, res) => {
  try {
    const discount = await BundleDiscount.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({
        message: "Bundle discount not found"
      });
    }

    res.json({
      message: "Bundle discount updated",
      discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBundleDiscount = async (req, res) => {
  try {
    await BundleDiscount.findByIdAndUpdate(req.params.id, {
      isActive: false,
      updated_by: req.user.id
    });

    res.json({
      message: "Bundle discount deactivated"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
