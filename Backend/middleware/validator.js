import Joi from "joi";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }
    
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Invalid parameters",
        errors
      });
    }
    
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join("."),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors
      });
    }
    
    next();
  };
};

