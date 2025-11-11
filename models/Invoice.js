import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  gst: { 
    type: Number, 
    required: [true, 'GST rate is required'],
    min: [0, 'GST rate cannot be negative'],
    max: [100, 'GST rate cannot exceed 100%']
  },
  discount: { 
    type: Number, 
    default: 0,
    min: [0, 'Discount cannot be negative'] 
  },
  amount: { 
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  }
});

const invoiceSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: [true, 'Customer reference is required']
  },
  stock: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Stock',
    required: [true, 'Stock reference is required']
  },
  invoiceNumber: { 
    type: String, 
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Invoice number cannot exceed 50 characters']
  },
  salesperson: { 
    type: String, 
    trim: true,
    required: false,
  },
  orderNumber: { 
    type: String, 
    trim: true
  },
  subject: { 
    type: String, 
    trim: true
  },
  paymentStatus: { 
    type: String, 
    default: 'Pending' 
  },
  terms: { 
    type: String, 
    trim: true
  },
  invoiceDate: { 
    type: Date, 
    required: [true, 'Invoice date is required'] 
  },
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required'] 
  },
  items: {
    type: [itemSchema],
    required: [true, 'At least one item is required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  subTotal: { 
    type: Number, 
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  adjustment: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: { 
    type: Number, 
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  totalPaid: { 
    type: Number, 
    min: [0, 'Total amount cannot be negative']
  },
  termsAndConditions: { 
    type: String,
    trim: true
  },
  customerNotes: { 
    type: String,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-calculate amount before saving
invoiceSchema.pre('save', function(next) {
  this.items.forEach(item => {
    if (!item.amount) {
      item.amount = (item.price * item.quantity) * (1 + item.gst/100);
    }
  });
  
  if (!this.subTotal) {
    this.subTotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  if (!this.total) {
    const gstTotal = this.items.reduce((sum, item) => 
      sum + (item.price * item.quantity * item.gst/100), 0);
    this.total = this.subTotal + gstTotal + (this.adjustment || 0) - (this.discount || 0);
  }
  
  next();
});

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
export default Invoice;