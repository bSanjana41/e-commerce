import Order from "../model/order.schema.js";
import mongoose from "mongoose";

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query with optional status filter
    const query = {};
    if (status) {
      query.status = status;
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email")
        .populate("items.productId", "name description")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Validate status transitions
    if (order.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of a cancelled order"
      });
    }

    if (status === "SHIPPED" && order.status !== "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order must be PAID before it can be SHIPPED"
      });
    }

    if (status === "DELIVERED" && order.status !== "SHIPPED") {
      return res.status(400).json({
        success: false,
        message: "Order must be SHIPPED before it can be DELIVERED"
      });
    }

    // Update status
    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

