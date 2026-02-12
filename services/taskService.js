const Task = require('../models/Task');

class TaskService {
  static async getAllTasks() {
    try {
      const tasks = await Task.findAll();
      return tasks;
    } catch (error) {
      throw new Error('Failed to retrieve tasks');
    }
  }

  static async getTaskById(id) {
    try {
      const task = await Task.findById(id);
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    } catch (error) {
      throw error;
    }
  }

  static async createTask(taskData) {
    try {
      const taskId = await Task.create(taskData);
      const newTask = await Task.findById(taskId);
      return newTask;
    } catch (error) {
      throw new Error('Failed to create task');
    }
  }

  static async updateTask(id, taskData) {
    try {
      // Check if task exists
      const existingTask = await Task.findById(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      const changes = await Task.update(id, taskData);
      if (changes === 0) {
        throw new Error('No changes made to the task');
      }

      const updatedTask = await Task.findById(id);
      return updatedTask;
    } catch (error) {
      throw error;
    }
  }

  static async deleteTask(id) {
    try {
      // Check if task exists
      const existingTask = await Task.findById(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      const changes = await Task.delete(id);
      if (changes === 0) {
        throw new Error('Failed to delete task');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TaskService;
