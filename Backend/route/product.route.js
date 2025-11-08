import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts
} from "../controller/product.controller.js";
import { authenticate, authorizeAdmin } from "../middleware/auth.js";
import { validate, validateParams, validateQuery } from "../middleware/validator.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productQuerySchema
} from "../validations/product.validation.js";

const router = express.Router();

router.get("/", validateQuery(productQuerySchema), getProducts);
router.post("/", authenticate, authorizeAdmin, validate(createProductSchema), createProduct);
router.put("/:id", authenticate, authorizeAdmin, validateParams(productIdSchema), validate(updateProductSchema), updateProduct);
router.delete("/:id", authenticate, authorizeAdmin, validateParams(productIdSchema), deleteProduct);

export default router;

