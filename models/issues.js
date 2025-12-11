const mongoose = require('../database');

// Issue Schema
const issueSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  member_name: {
    type: String,
    required: true
  },
  member_email: String,
  issue_date: {
    type: Date,
    default: Date.now
  },
  due_date: {
    type: Date,
    required: true
  },
  return_date: Date,
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  }
}, {
  timestamps: true
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
