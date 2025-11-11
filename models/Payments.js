import mongoose from 'mongoose';

const InvoicePaymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  }
});

const PaymentSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  outstandingAmount: {
    type: Number,
    required: [true, 'Outstanding amount is required'],
    min: 0
  },
  bankCharges: {
    type: Number,
    required: [true, 'Bank charges are required'],
    min: 0
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  paymentMode: {
    type: String,
    required: [true, 'Payment mode is required'],
    trim: true
  },
  paymentNumber: {  // Changed from 'payment' to 'paymentNumber'
    type: String,
    required: [true, 'Payment number is required'],
    unique: true,
    trim: true
  },
  referenceNumber: {  
    type: String,
    required: [true, 'Reference number is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  markedInvoices: [InvoicePaymentSchema],
  totalPaid: {
    type: Number,
    required: true,
    min: 0
  },
  status: {  // Added payment status
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  }
}, { 
  timestamps: true
});

// Add indexes for better query performance
PaymentSchema.index({
  customerName: 'text',
  paymentNumber: 'text',
  referenceNumber: 'text'
});

PaymentSchema.index({ paymentDate: -1 });  // Descending index for paymentDate
PaymentSchema.index({ paymentMode: 1 });   // Index for paymentMode

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment;