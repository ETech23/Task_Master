const Task = require('../models/Task');

// Get all tasks for a user with optional filtering
exports.getTasks = async (req, res) => {
  const { priority, deadline } = req.query;
  const query = { userId: req.userId };
  if (priority) query.priority = priority;
  if (deadline) query.deadline = { $lte: new Date(deadline) };

  try {
    const tasks = await Task.find(query);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

// Add a new task
exports.addTask = async (req, res) => {
  const { title, description, deadline, priority } = req.body;

  try {
    const task = new Task({ userId: req.userId, title, description, deadline, priority });
    await task.save();
    res.status(201).json({ message: 'Task added successfully', task });
  } catch (error) {
    res.status(500).json({ error: 'Error adding task' });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, deadline, priority } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title, description, deadline, priority },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ error: 'Error updating task' });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
};
