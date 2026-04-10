const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    businessId: { type: String, ref: 'Business', required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['manager', 'employee'], required: true },
    passwordHash: { type: String, required: true },
    inviteToken: { type: String },
    inviteExpires: { type: Date },
    isActive: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

UserSchema.index({ businessId: 1 });

module.exports = mongoose.model('User', UserSchema);
