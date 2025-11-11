// models/Customer.js
import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    companyName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String},
    email: { type: String, required: true },
    phone: { type: String, required: true },
    pan: { type: String },

    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
    billingPhone: {type: String},

    address3: { type: String },
    address4: { type: String },
    city2: { type: String },
    state2: { type: String },
    country2: { type: String },
    zipCode2: { type: String },
    shippingPhone: {type: String},

    altName: { type: String },
    altPhone: { type: String },
    altEmail: { type: String },
  },
  { timestamps: true }
);

// Avoid model overwrite issue in dev environment
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export default Customer;
