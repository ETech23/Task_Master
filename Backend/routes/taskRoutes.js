const express = require('express');
const { getTasks, addTask, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, addTask);
router.put('/:id', authenticateToken, updateTask);
router.delete('/:id', authenticateToken, deleteTask);

module.exports = router;
