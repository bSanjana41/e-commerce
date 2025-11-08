import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required()
    .messages({
      "string.empty": "Product name is required"
    }),
  price: Joi.number().positive().required()
    .messages({
      "number.base": "Price must be a number",
      "number.positive": "Price must be positive"
    }),
  description: Joi.string().trim().min(1).required()
    .messages({
      "string.empty": "Product description is required"
    }),
  availableStock: Joi.number().integer().min(0).required()
    .messages({
      "number.base": "Stock must be a number",
      "number.min": "Stock cannot be negative"
    })
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  price: Joi.number().positive().optional(),
  description: Joi.string().trim().min(1).optional(),
  availableStock: Joi.number().integer().min(0).optional()
});

export const productIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
    .messages({
      "string.hex": "Invalid product ID format",
      "string.length": "Product ID must be 24 characters"
    })
});

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("name", "price", "createdAt").default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  name: Joi.string().trim().optional()
});

