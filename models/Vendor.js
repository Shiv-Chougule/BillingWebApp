// models/Customer.js
import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema(
  {
    vendorName: { type: String, required: true },
    companyName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    pan: { type: String },

    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    billingPhone: {type: String},

    altName: { type: String },
    altPhone: { type: String },
    altEmail: { type: String },
  },
  { timestamps: true }
);

// Avoid model overwrite issue in dev environment
const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

export default Vendor;
