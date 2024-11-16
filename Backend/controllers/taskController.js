const Task = require("../models/Task");

// Get all tasks for a user with optional filtering
exports.getTasks = async (req, res) => {
  const { search, priority, dueDate } = req.query;
  const query = { userId: req.userId }; // Filter tasks by the authenticated user

  // Search filter: Match tasks with a title or description containing the search term
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } }, // Case-insensitive regex for title
      { description: { $regex: search, $options: "i" } }, // Case-insensitive regex for description
    ];
  }

  // Priority filter: Match tasks with the specified priority
  if (priority) {
    query.priority = priority;
  }

  // Due date filter: Match tasks due on the specified date
  if (dueDate) {
    query.deadline = { $eq: new Date(dueDate) };
  }

  try {
    // Fetch tasks from the database with the constructed query
    const tasks = await Task.find(query);
    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Error fetching tasks" });
  }
};

// Add a new task
exports.addTask = async (req, res) => {
  const { title, description, deadline, priority } = req.body;

  try {
    const task = new Task({
      userId: req.userId,
      title,
      description,
      deadline,
      priority,
    });

    await task.save();
    res.status(201).json({ message: "Task added successfully", task });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Error adding task" });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, priority } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId }, // Match task by ID and user
      { title, description, deadline, priority }, // Update fields
      { new: true } // Return the updated document
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Error updating task" });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId }); // Match task by ID and user

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Error deleting task" });
  }
};
