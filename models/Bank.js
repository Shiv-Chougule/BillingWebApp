import mongoose from 'mongoose';

const BankSchema = new mongoose.Schema({
  transactionID: {
    type: String,
    required: true,
    trim: true,
    unique: true // Optional: ensures each transaction ID is unique
  },
  transactionDate: {
    type: Date,
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    lowercase: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

export default mongoose.models.Bank || mongoose.model('Bank', BankSchema);
