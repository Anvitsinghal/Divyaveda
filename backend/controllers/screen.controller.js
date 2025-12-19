import { Screen } from "../models/screen.master.js";

export const createScreen = async (req, res) => {
  try {
    const { screen_name, description, routes } = req.body;

    if (!screen_name || !routes || !Array.isArray(routes)) {
      return res.status(400).json({
        message: "screen_name and routes array are required"
      });
    }

    const existing = await Screen.findOne({ screen_name });
    if (existing) {
      return res.status(400).json({
        message: "Screen already exists"
      });
    }

    const screen = await Screen.create({
      screen_name,
      description,
      routes,
      created_by: req.user.id
    });

    res.status(201).json({
      message: "Screen created successfully",
      screen
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllScreens = async (req, res) => {
  try {
    const screens = await Screen.find();
    res.json(screens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id);

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found"
      });
    }

    res.json(screen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateScreen = async (req, res) => {
  try {
    const { screen_name, description, routes } = req.body;

    const updates = {};
    if (screen_name !== undefined) updates.screen_name = screen_name;
    if (description !== undefined) updates.description = description;
    if (routes !== undefined) updates.routes = routes;

    updates.updated_by = req.user.id;

    const screen = await Screen.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found"
      });
    }

    res.json({
      message: "Screen updated successfully",
      screen
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updated_by: req.user.id },
      { new: true }
    );

    if (!screen) {
      return res.status(404).json({
        message: "Screen not found"
      });
    }

    res.json({
      message: "Screen deactivated successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
