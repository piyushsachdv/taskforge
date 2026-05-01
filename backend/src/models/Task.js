import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  input: {
    type: String,
    required: true
  },
  operation: {
    type: String,
    enum: ['uppercase', 'lowercase', 'reverse', 'wordcount'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed'],
    default: 'pending'
  },
  result: {
    type: String,
    default: null
  },
  logs: {
    type: [String],
    default: []
  }
}, { timestamps: true });

taskSchema.index({ userId: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ status: 1 });

export default mongoose.model('Task', taskSchema);
