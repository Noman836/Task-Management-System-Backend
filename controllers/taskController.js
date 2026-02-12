const TaskService = require('../services/taskService');
const ResponseHelper = require('../utils/responseHelper');

class TaskController {
  static async getAllTasks(req, res) {
    try {
      const tasks = await TaskService.getAllTasks();
      return ResponseHelper.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  static async createTask(req, res) {
    try {
      const taskData = req.body;
      const newTask = await TaskService.createTask(taskData);
      return ResponseHelper.created(res, newTask, 'Task created successfully');
    } catch (error) {
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const taskData = req.body;
      
      const updatedTask = await TaskService.updateTask(id, taskData);
      return ResponseHelper.success(res, updatedTask, 'Task updated successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ResponseHelper.notFound(res, error.message);
      }
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  static async toggleTaskCompletion(req, res) {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      
      const updatedTask = await TaskService.updateTask(id, { completed });
      return ResponseHelper.success(res, updatedTask, 'Task completion updated successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ResponseHelper.notFound(res, error.message);
      }
      return ResponseHelper.error(res, error.message, 500);
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      await TaskService.deleteTask(id);
      return ResponseHelper.success(res, null, 'Task deleted successfully');
    } catch (error) {
      if (error.message === 'Task not found') {
        return ResponseHelper.notFound(res, error.message);
      }
      return ResponseHelper.error(res, error.message, 500);
    }
  }
}

module.exports = TaskController;
