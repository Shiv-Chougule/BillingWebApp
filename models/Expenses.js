// models/Expenses.js
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  invoiceID: {
    type: String,
    required: false,
    trim: true,
    unique: true, // Ensures no duplicate invoice IDs
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

export default mongoose.models.Expence || mongoose.model('Expence', expenseSchema);
