import Order from "../model/order.schema.js";
import Product from "../model/product.schema.js";
import mongoose from "mongoose";

// Cancel orders that haven't been paid within 15 minutes
const cancelUnpaidOrders = async () => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // Find unpaid orders older than 15 minutes
    const unpaidOrders = await Order.find({
      status: "PENDING_PAYMENT",
      createdAt: { $lt: fifteenMinutesAgo }
    }).session(session);

    // Release reserved stock and cancel orders
    for (const order of unpaidOrders) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              availableStock: item.quantity,
              reservedStock: -item.quantity
            }
          },
          { session }
        );
      }

      order.status = "CANCELLED";
      await order.save({ session });
    }

    await session.commitTransaction();
    
    if (unpaidOrders.length > 0) {
      console.log(`Cancelled ${unpaidOrders.length} unpaid order(s)`);
    }
  } catch (error) {
    await session.abortTransaction();
    console.error("Error cancelling unpaid orders:", error);
  } finally {
    session.endSession();
  }
};

// Start the timeout service (runs every minute)
export const startOrderTimeoutService = () => {
  setInterval(cancelUnpaidOrders, 60000); // 60 seconds
  console.log("Order timeout service started (checking every minute)");
};

