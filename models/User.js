import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
    required: function() {
      return this.isGstRegistered === 'Yes';
    },
  },
  phone: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  isGstRegistered: {
    type: String,
    enum: ['Yes', 'No'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 