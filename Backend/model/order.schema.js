import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ["PENDING_PAYMENT", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
    default: "PENDING_PAYMENT",
    required: true
  },
}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = model("Order", orderSchema);
export default Order;
