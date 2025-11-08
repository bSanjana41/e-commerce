import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must not exceed 50 characters"
    }),
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address"
    }),
  password: Joi.string().min(6).required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters"
    }),
  role: Joi.string().valid("USER", "ADMIN").optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address"
    }),
  password: Joi.string().required()
    .messages({
      "string.empty": "Password is required"
    })
});

