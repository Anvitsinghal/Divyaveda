import { UserAnalysis } from "../models/userAnalysis.master.js";
import { User } from "../models/user.master.js";

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await UserAnalysis.find()
      .populate("user_id", "username email phone_number")
      .sort({ created_at: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionsByUser = async (req, res) => {
  try {
    const sessions = await UserAnalysis.find({
      user_id: req.params.userId
    })
      .populate("user_id", "username email")
      .sort({ created_at: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await User.find({
      isActive: true
    }).select("username email phone_number last_login");

    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFrequentUsers = async (req, res) => {
  try {
    const frequentUsers = await UserAnalysis.aggregate([
      {
        $group: {
          _id: "$user_id",
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { sessionCount: -1 } },
      { $limit: 20 }
    ]);

    const userIds = frequentUsers.map(u => u._id);

    const users = await User.find({ _id: { $in: userIds } })
      .select("username email phone_number");

    res.json({
      users,
      stats: frequentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const sessions = await UserAnalysis.find()
      .populate("user_id", "username email phone_number")
      .sort({ created_at: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyActiveUsers = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyActiveUsers = await UserAnalysis.aggregate([
      {
        $match: {
          created_at: { $gte: today }
        }
      },
      {
        $group: {
          _id: "$user_id",
          sessionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          user_id: "$_id",
          username: "$user.username",
          email: "$user.email",
          sessionCount: 1
        }
      },
      { $sort: { sessionCount: -1 } }
    ]);

    res.json({
      date: today.toISOString(),
      totalActiveUsers: dailyActiveUsers.length,
      users: dailyActiveUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserLoginHistory = async (req, res) => {
  try {
    const sessions = await UserAnalysis.find({
      user_id: req.params.userId
    })
      .populate("user_id", "username email")
      .sort({ created_at: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};