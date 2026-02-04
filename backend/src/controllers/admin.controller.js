import User from "../models/user.model.js";
import Todo from "../models/todo.model.js";

export const getAdminTodos = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const usersWithTodos = await Promise.all(
      users.map(async (user) => {
        const todos = await Todo.find({ user: user._id });
        return {
          ...user.toObject(),
          todos,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithTodos,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin data",
    });
  }
};
