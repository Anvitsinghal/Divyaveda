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
    // STEP 1: Find the ID for the "Vendor" role
    // We use a regex to make it case-insensitive (matches "Vendor", "vendor", "VENDOR")
    const vendorRole = await Role.findOne({ role_name: { $regex: /^vendor$/i } });

    // Safety check: If the role doesn't exist yet, return empty list
    if (!vendorRole) {
      return res.json({ vendors: [] });
    }

    // STEP 2: The Actual Query
    // Find users where 'role_id' matches the Vendor Role ID
    const vendors = await User.find({ role_id: vendorRole._id })
      .select("-password")           // Don't send passwords
      .populate("role_id", "role_name") // Show the role name in the result
      .sort({ createdAt: -1 });

    // Return the list of users
    res.json({ vendors });
    
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
