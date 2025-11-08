import express from "express";
import {
  checkout,
  processPayment,
  getOrders,
  getOrderById
} from "../controller/order.controller.js";
import { authenticate, authorizeUser } from "../middleware/auth.js";
import { validateParams, validateQuery } from "../middleware/validator.js";
import {
  orderIdSchema,
  orderQuerySchema
} from "../validations/order.validation.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeUser);

router.post("/checkout", checkout);
router.post("/:id/pay", validateParams(orderIdSchema), processPayment);
router.get("/", validateQuery(orderQuerySchema), getOrders);
router.get("/:id", validateParams(orderIdSchema), getOrderById);

export default router;

