import mongoose, { Schema, Document } from 'mongoose';

export interface IRolePromotionRequest extends Document {
  userId: mongoose.Types.ObjectId;
  businessPermitImageUrl: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
}

const rolePromotionRequestSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessPermitImageUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  },
});

// Indexes for query performance
rolePromotionRequestSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IRolePromotionRequest>('RolePromotionRequest', rolePromotionRequestSchema);