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
    } else {
      const trimmedTitle = data.title.trim();
      if (trimmedTitle.length < 3) {
        errors.push('Title must be at least 3 characters long');
      } else if (trimmedTitle.length > 255) {
        errors.push('Title must be less than 255 characters');
      }
      // Check for invalid characters (allow letters, numbers, spaces, and basic punctuation)
if (!/^[a-zA-Z0-9\s\-_.,!?()[\]{}:;'"\/\\@#$%&*+=<>~`]+$/.test(trimmedTitle)) {
        errors.push('Title contains invalid characters');
      }
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
      } else if (dueDate > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
        errors.push('Due date cannot be more than 1 year in the future');
      }
    }

    // Priority validation
    if (!data.priority || typeof data.priority !== 'string') {
      errors.push('Priority is required and must be a string');
    } else {
      const validPriorities = ['Low', 'Medium', 'High'];
      if (!validPriorities.includes(data.priority)) {
        errors.push('Priority must be Low, Medium, or High');
      }
    }

    // Description validation (optional)
    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else {
        const trimmedDescription = data.description.trim();
        if (trimmedDescription.length > 0 && trimmedDescription.length < 5) {
          errors.push('Description must be at least 5 characters long if provided');
        } else if (trimmedDescription.length > 1000) {
          errors.push('Description must be less than 1000 characters');
        }
        // Check for potentially malicious content
        if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(trimmedDescription)) {
          errors.push('Description contains invalid content');
        }
      }
    }

    // Completed validation (for updates)
    if (isUpdate && data.completed !== undefined) {
      // Convert various types to boolean
      if (typeof data.completed === 'string') {
        const lowerCompleted = data.completed.toLowerCase().trim();
        if (lowerCompleted === 'true' || lowerCompleted === '1') {
          data.completed = true;
        } else if (lowerCompleted === 'false' || lowerCompleted === '0') {
          data.completed = false;
        } else {
          errors.push('Completed must be true, false, 1, or 0');
        }
      } else if (typeof data.completed === 'number') {
        if (data.completed === 1) {
          data.completed = true;
        } else if (data.completed === 0) {
          data.completed = false;
        } else {
          errors.push('Completed must be 1 or 0 when provided as a number');
        }
      } else {
        data.completed = Boolean(data.completed);
      }
      
      if (typeof data.completed !== 'boolean') {
        errors.push('Completed must be a boolean value');
      }
    }

    // Additional validation for create operations
    if (!isUpdate) {
      // Ensure no extra fields are being sent
      const allowedFields = ['title', 'description', 'due_date', 'priority'];
      const extraFields = Object.keys(data).filter(field => !allowedFields.includes(field));
      if (extraFields.length > 0) {
        errors.push(`Invalid fields provided: ${extraFields.join(', ')}`);
      }
    }

    // General data validation
    if (typeof data !== 'object' || data === null) {
      errors.push('Task data must be a valid object');
    }

    return errors;
  }
}

module.exports = Task;
