import { SubCategory } from "../models/subcategory.master.js";
import { Category } from "../models/category.master.js";

export const createSubCategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({
        message: "Subcategory name and category_id are required"
      });
    }

    const category = await Category.findOne({
      _id: category_id,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        message: "Parent category not found or inactive"
      });
    }

    const existing = await SubCategory.findOne({
      name,
      category_id,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        message: "Subcategory already exists under this category"
      });
    }

    const subCategory = await SubCategory.create({
      name,
      description,
      category_id,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Subcategory created successfully",
      subCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isActive: true })
      .populate("category_id", "name")
      .sort({ created_at: -1 });

    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate("category_id", "name");

    if (!subCategory || !subCategory.isActive) {
      return res.status(404).json({
        message: "Subcategory not found"
      });
    }

    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { name, description, category_id } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (category_id !== undefined) {
      const category = await Category.findOne({
        _id: category_id,
        isActive: true
      });

      if (!category) {
        return res.status(404).json({
          message: "New parent category not found or inactive"
        });
      }

      updates.category_id = category_id;
    }

    updates.updated_by = req.user.id;

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        message: "Subcategory not found"
      });
    }

    res.json({
      message: "Subcategory updated successfully",
      subCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updated_by: req.user.id
      },
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        message: "Subcategory not found"
      });
    }

    res.json({
      message: "Subcategory deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
