import mongoose from 'mongoose';

const ProductItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  serial_number: { type: [String], required: true },
  item_status: { type: String, enum: ['Sale', 'Refund'],default: 'Sale'},  
  reason_for_refund: { type: String }
  
});

const TransactionSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true },
    products: [ProductItemSchema], 
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    total_price: { type: Number, required: true },
    total_amount_paid: { type: Number },
    transaction_date: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    payment_status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    cashier: { type: String },
    payment_method: { type: String },
  },  
  {
    timestamps: true
  }
);


// Pre-save hook for TransactionSchema to update item_status
TransactionSchema.pre('save', function (next) {
  // Loop through products and update item_status if it is null or undefined
  this.products.forEach(productItem => {
    if (!productItem.item_status) {
      productItem.item_status = 'Sale'; // Assign default item_status if null or undefined
    }
  });
  next();
});


const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
