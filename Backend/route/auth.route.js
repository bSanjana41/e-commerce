import express from "express";
import { register, login } from "../controller/auth.controller.js";
import { validate } from "../middleware/validator.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;

