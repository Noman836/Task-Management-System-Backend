const Task = require('../models/Task');
const ResponseHelper = require('../utils/responseHelper');

const validateTask = async (req, res, next) => {
  try {
    const errors = await Task.validateTaskData(req.body, req.method === 'PUT');
    
    if (errors.length > 0) {
      return ResponseHelper.validationError(res, errors);
    }
    
    next();
  } catch (error) {
    return ResponseHelper.error(res, 'Validation error', 500, [error.message]);
  }
};

const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return ResponseHelper.error(res, 'Valid task ID is required', 400);
  }
  
  next();
};

const validateToggleCompletion = (req, res, next) => {
  const { completed } = req.body;
  
  if (typeof completed !== 'boolean') {
    return ResponseHelper.error(res, 'Completed field must be a boolean', 400);
  }
  
  next();
};

module.exports = {
  validateTask,
  validateTaskId,
  validateToggleCompletion,
};
