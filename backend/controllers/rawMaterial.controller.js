import { RawMaterial } from "../models/rawMaterial.master.js";

export const createRawMaterial = async (req, res) => {
  try {
    const { name, unit } = req.body;

    if (!name || !unit) {
      return res.status(400).json({
        message: "Material name and unit are required"
      });
    }

    const existing = await RawMaterial.findOne({
      name,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Raw material already exists"
      });
    }

    const material = await RawMaterial.create({
      name,
      unit,               // kg, litre, piece, etc
      current_quantity: 0,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Raw material created",
      material
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRawMaterials = async (req, res) => {
  try {
    const materials = await RawMaterial.find({ isActive: true })
      .sort({ created_at: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRawMaterial = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updated_by: req.user.id
    };

    const material = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!material) {
      return res.status(404).json({
        message: "Raw material not found"
      });
    }

    res.json({
      message: "Raw material updated",
      material
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRawMaterial = async (req, res) => {
  try {
    await RawMaterial.findByIdAndUpdate(req.params.id, {
      isActive: false,
      updated_by: req.user.id
    });

    res.json({
      message: "Raw material deactivated"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
