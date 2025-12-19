import { Vendor } from "../models/vendor.master.js";


export const createVendor = async (req, res) => {
  try {
    const { name, contact_person, phone_number, email, address } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Vendor name is required"
      });
    }

    const existing = await Vendor.findOne({
      name,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Vendor already exists"
      });
    }

    const vendor = await Vendor.create({
      name,
      contact_person,
      phone_number,
      email,
      address,
      isActive: true,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Vendor created successfully",
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true })
      .sort({ created_at: -1 });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor || !vendor.isActive) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateVendor = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updated_by: req.user.id
    };

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.json({
      message: "Vendor updated successfully",
      vendor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deactivateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        message: "Vendor not found"
      });
    }

    res.json({
      message: "Vendor deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
