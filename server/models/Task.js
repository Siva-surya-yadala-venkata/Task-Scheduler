const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['REMINDER', 'MEETING', 'EMAIL'],
    required: true
  },
  executeTime: {
    type: Date,
    required: true
  },
  emailTo: {
    type: String
  },
  senderEmail: {
    type: String
  },
  senderPassword: {
    type: String
  },
  phone: {
    type: String
  },
  attendees: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
