import "./config/envConfig.js";
import express from "express";
import connectServer from "./server.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { startOrderTimeoutService } from "./services/orderTimeout.js";

import authRoutes from "./route/auth.route.js";
import productRoutes from "./route/product.route.js";
import cartRoutes from "./route/cart.route.js";
import orderRoutes from "./route/order.route.js";
import adminRoutes from "./route/admin.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "E-Commerce API is running",
    version: "1.0.0"
  });
});

const apiRoutes = express.Router();
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/products", productRoutes);
apiRoutes.use("/cart", cartRoutes);
apiRoutes.use("/orders", orderRoutes);
apiRoutes.use("/admin", adminRoutes);

app.use("/api", apiRoutes);

app.use(notFound);
app.use(errorHandler);

startOrderTimeoutService();

export default app;
connectServer();
