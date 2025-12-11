const mongoose = require('../database');

// Author Schema
const authorSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  bio: String
}, {
  timestamps: true
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
