import Joi from "joi";

export const addCartItemSchema = Joi.object({
  productId: Joi.string().hex().length(24).required()
    .messages({
      "string.hex": "Invalid product ID format",
      "string.length": "Product ID must be 24 characters"
    }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be at least 1"
    })
});

export const productIdParamSchema = Joi.object({
  productId: Joi.string().hex().length(24).required()
    .messages({
      "string.hex": "Invalid product ID format",
      "string.length": "Product ID must be 24 characters"
    })
});

