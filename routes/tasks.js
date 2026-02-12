const express = require('express');
const TaskController = require('../controllers/taskController');
const { validateTask, validateTaskId, validateToggleCompletion } = require('../middleware/validation');

const router = express.Router();

// GET /tasks - Get all tasks
router.get('/', TaskController.getAllTasks);

// POST /tasks - Create new task
router.post('/', validateTask, TaskController.createTask);

// PUT /tasks/:id - Update task
router.put('/:id', validateTaskId, validateTask, TaskController.updateTask);

// PATCH /tasks/:id/toggle - Toggle task completion
router.patch('/:id/toggle', validateTaskId, validateToggleCompletion, TaskController.toggleTaskCompletion);

// DELETE /tasks/:id - Delete task
router.delete('/:id', validateTaskId, TaskController.deleteTask);

module.exports = router;
