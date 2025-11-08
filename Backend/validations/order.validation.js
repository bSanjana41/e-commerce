import Joi from "joi";

export const orderIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
    .messages({
      "string.hex": "Invalid order ID format",
      "string.length": "Order ID must be 24 characters"
    })
});

export const orderQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid("PENDING_PAYMENT", "PAID", "SHIPPED", "DELIVERED", "CANCELLED").optional()
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid("SHIPPED", "DELIVERED", "CANCELLED").required()
    .messages({
      "any.only": "Status must be one of: SHIPPED, DELIVERED, CANCELLED"
    })
});

