import express from "express";
import {
  getCart,
  addCartItem,
  removeCartItem
} from "../controller/cart.controller.js";
import { authenticate, authorizeUser } from "../middleware/auth.js";
import { validate, validateParams } from "../middleware/validator.js";
import {
  addCartItemSchema,
  productIdParamSchema
} from "../validations/cart.validation.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeUser);

router.get("/", getCart);
router.post("/items", validate(addCartItemSchema), addCartItem);
router.delete("/items/:productId", validateParams(productIdParamSchema), removeCartItem);

export default router;

