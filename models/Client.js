import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  membershipPlan: String,
  transactionId:Number,

  // Hidden field
  access: {
    type: Boolean,
    default: false
  },
  photo: { type: String },
  validUpto:String,
});

const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);
export default Client;
