import Order from "../model/order.schema.js";
import Cart from "../model/cart.schema.js";
import Product from "../model/product.schema.js";
import Payment from "../model/payment.schema.js";
import mongoose from "mongoose";
import { jobQueue } from "../services/jobQueue.js";
import User from "../model/user.schema.js";

export const checkout = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const userId = req.user.userId;

    // Get user's cart with product details
    const cart = await Cart.findOne({ userId }).populate("items.productId").session(session);
    
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const orderItems = [];
    let total = 0; // using simpler variable name

    // Check stock and calculate total
    for (const cartItem of cart.items) {
      const product = cartItem.productId;
      const qty = cartItem.quantity;

      // Check if we have enough stock
      if (product.availableStock < qty) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.availableStock}, Requested: ${qty}`
        });
      }

      const itemTotal = product.price * qty;
      total += itemTotal;

      orderItems.push({
        productId: product._id,
        quantity: qty,
        priceAtPurchase: product.price
      });

      // Reserve the stock
      product.availableStock -= qty;
      product.reservedStock += qty;
      await product.save({ session });
    }

    // Create the order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount: total,
      status: "PENDING_PAYMENT"
    });

    await order.save({ session });

    // Clear the cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order created successfully. Please complete payment.",
      data: { order }
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const processPayment = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const userId = req.user.userId;
    const orderId = req.params.id;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({ _id: orderId, userId }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order is still pending payment
    if (order.status !== "PENDING_PAYMENT") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.status}`
      });
    }

    // Check if 15 minutes have passed
    const now = new Date();
    const deadline = new Date(order.createdAt.getTime() + 15 * 60 * 1000);
    if (now > deadline) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Payment deadline has passed. Order has been cancelled."
      });
    }

    // Release reserved stock (it's now permanently sold)
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      if (product) {
        product.reservedStock -= item.quantity;
        await product.save({ session });
      }
    }

    // Update order status
    order.status = "PAID";
    await order.save({ session });

    // Create payment record
    const txId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payment = new Payment({
      orderId: order._id,
      transactionId: txId,
      amount: order.totalAmount,
      status: "SUCCESS"
    });

    await payment.save({ session });

    await session.commitTransaction();

    // Send confirmation email (async)
    const user = await User.findById(userId);
    if (user) {
      await jobQueue.add({
        type: "SEND_EMAIL",
        data: {
          email: user.email,
          subject: "Order Confirmation",
          body: `Your order #${order._id} has been confirmed. Total amount: $${order.totalAmount.toFixed(2)}`
        }
      });
    }

    res.json({
      success: true,
      message: "Payment processed successfully",
      data: {
        order,
        payment: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ userId })
        .populate("items.productId", "name description")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments({ userId })
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

export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({ _id: id, userId })
      .populate("items.productId", "name description price")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const payment = await Payment.findOne({ orderId: id }).lean();

    res.json({
      success: true,
      data: {
        order,
        payment: payment || null
      }
    });
  } catch (error) {
    next(error);
  }
};

