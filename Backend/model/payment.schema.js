import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: "Order", 
    required: true,
    unique: true
  },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  amount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ["SUCCESS", "FAILED"], 
    required: true 
  },
}, { timestamps: true });

const Payment = model("Payment", paymentSchema);
export default Payment;

