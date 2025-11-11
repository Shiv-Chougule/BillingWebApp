import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      } 
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    HSNCode: {
      type: String,
      trim: true,
    },
    itemCode: {
      type: String,
      trim: true,
      unique: true,
      // sparse: true, // Prevents duplicate error if itemCode is missing
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    account: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Export the model
export default mongoose.models.Stock || mongoose.model('Stock', StockSchema);
