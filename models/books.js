const mongoose = require('../database');

// Book Schema
const bookSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  publication_year: Number,
  genre: String,
  total_copies: {
    type: Number,
    default: 1
  },
  available_copies: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
