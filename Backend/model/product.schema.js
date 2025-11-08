import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  availableStock: { type: Number, required: true, default: 0, min: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

const Product = model("Product", productSchema);
export default Product;
