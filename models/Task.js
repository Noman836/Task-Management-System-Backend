const database = require('../config/database');

class Task {
  static async findAll() {
    try {
      const query = `
        SELECT * FROM tasks 
        ORDER BY 
          due_date ASC,
          CASE priority 
            WHEN 'High' THEN 1 
            WHEN 'Medium' THEN 2 
            WHEN 'Low' THEN 3 
          END
      `;
      
      const rows = await database.query(query);
      // Convert completed field to boolean for each task
      return rows.map(task => ({
        ...task,
        completed: Boolean(task.completed)
      }));
    } catch (error) {
      throw new Error('Failed to retrieve tasks');
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT * FROM tasks WHERE id = ?
      `;
      const row = await database.get(query, [id]);
      if (row) {
        // Convert completed field to boolean
        return {
          ...row,
          completed: Boolean(row.completed)
        };
      }
      return row;
    } catch (error) {
      throw new Error('Failed to retrieve task');
    }
  }

  static async create(taskData) {
    try {
      const { title, description, due_date, priority } = taskData;
      const query = `
        INSERT INTO tasks (title, description, due_date, priority, completed) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      console.log('Creating task with data:', { title, description, due_date, priority, completed: false });
      const result = await database.query(query, [title, description, due_date, priority, false]);
      console.log('Insert result:', result);
      return result.insertId;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task: ' + error.message);
    }
  }

  static async update(id, taskData) {
    try {
      const { title, description, due_date, priority, completed } = taskData;
      
      // Build dynamic SET clause based on provided fields
      const setClauses = [];
      const values = [];
      
      if (title !== undefined) {
        setClauses.push('title = ?');
        values.push(title);
      }
      if (description !== undefined) {
        setClauses.push('description = ?');
        values.push(description);
      }
      if (due_date !== undefined) {
        setClauses.push('due_date = ?');
        values.push(due_date);
      }
      if (priority !== undefined) {
        setClauses.push('priority = ?');
        values.push(priority);
      }
      if (completed !== undefined) {
        setClauses.push('completed = ?');
        values.push(Boolean(completed));
      }
      
      if (setClauses.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      setClauses.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const query = `
        UPDATE tasks 
        SET ${setClauses.join(', ')}
        WHERE id = ?
      `;
      
      const result = await database.query(query, values);
      return result.affectedRows;
    } catch (error) {
      throw new Error('Failed to update task');
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM tasks WHERE id = ?';
      const result = await database.query(query, [id]);
      return result.affectedRows;
    } catch (error) {
      throw new Error('Failed to delete task');
    }
  }

  static async validateTaskData(data, isUpdate = false) {
    const errors = [];
    
    // Title validation
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    } else if (data.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    // Due date validation
    if (!data.due_date) {
      errors.push('Due date is required');
    } else {
      const dueDate = new Date(data.due_date);
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      } else if (dueDate < new Date().setHours(0, 0, 0, 0)) {
        errors.push('Due date cannot be in the past');
      }
    }

    // Priority validation
    if (!data.priority || !['Low', 'Medium', 'High'].includes(data.priority)) {
      errors.push('Priority must be Low, Medium, or High');
    }

    // Description validation (optional)
    if (data.description && typeof data.description !== 'string') {
      errors.push('Description must be a string');
    } else if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    // Completed validation (for updates)
    if (isUpdate && data.completed !== undefined) {
      // Convert various types to boolean
      if (typeof data.completed === 'string') {
        data.completed = data.completed.toLowerCase() === 'true';
      } else if (typeof data.completed === 'number') {
        data.completed = data.completed === 1;
      } else {
        data.completed = Boolean(data.completed);
      }
      
      if (typeof data.completed !== 'boolean') {
        errors.push('Completed must be a boolean value');
      }
    }

    return errors;
  }
}

module.exports = Task;
