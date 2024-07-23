import mongoose from 'mongoose';

const ProductItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
});

const TransactionSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true },
    products: [ProductItemSchema], // Array of products with quantity
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    total_price: { type: Number, required: true },
    total_amount_paid: { type: Number}, // Added total amount paid
    transaction_date: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;