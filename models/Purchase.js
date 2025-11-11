import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  gst: { type: Number, default: 0 },
  amount: { type: Number, required: true }, // calculated field
  itemId: { type: String } // reference to stock item
});

const purchaseSchema = new mongoose.Schema({
  // Required fields from handleSubmit
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'Vendor' 
  },
  purchaseOrder: { 
    type: String, 
    required: true, 
    unique: true 
  },
  purchaseDate: { 
    type: Date, 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  items: { 
    type: [itemSchema], 
    required: true 
  },
  stock: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: [true, 'Customer reference is required'],
    ref: 'Stock' 
  },
  // Optional fields from handleSubmit
  salesperson: { 
    type: String 
  },
  referenceNumber: { 
    type: String 
  },
  subject: { 
    type: String 
  },
  terms: { 
    type: String 
  },
  subTotal: { 
    type: Number,
    required: true 
  },
  adjustment: { 
    type: Number,
    default: 0 
  },
  discount: { 
    type: Number,
    default: 0 
  },
  total: { 
    type: Number,
    required: true 
  },
  paymentStatus: { 
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending'
  },
  totalPaid: { 
    type: Number,
    default: 0 
  },
  termsAndConditions: { 
    type: String 
  },
  vendorNotes: { 
    type: String 
  },

  // Automatic fields
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
export default Purchase;