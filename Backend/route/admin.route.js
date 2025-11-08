import express from "express";
import {
  getAllOrders,
  updateOrderStatus
} from "../controller/admin.controller.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { validate, validateParams, validateQuery } from "../middleware/validator.js";
import {
  orderIdSchema,
  orderQuerySchema,
  updateOrderStatusSchema
} from "../validations/order.validation.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.get("/orders", validateQuery(orderQuerySchema), getAllOrders);
router.patch("/orders/:id/status", validateParams(orderIdSchema), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;

