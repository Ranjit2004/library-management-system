const express = require('express');
const router = express.Router();
const Book = require('../models/books');
const { getNextSeq } = require('../models/counter');

// Get all books
router.get('/', async (req, res) => {
  try {
    const sortField = req.query.sortField || 'title';
    const sortDir = req.query.sortDir === 'desc' ? -1 : 1;
    const books = await Book.find()
      .populate('author_id', 'name')
      .sort({ [sortField]: sortDir, title: 1 });
    
    // Format response to match frontend expectations
    const formattedBooks = books.map(book => ({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      author_id: book.author_id?._id,
      author_name: book.author_id?.name,
      publication_year: book.publication_year,
      genre: book.genre,
      total_copies: book.total_copies,
      available_copies: book.available_copies
    }));
    
    res.json(formattedBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available books
router.get('/available', async (req, res) => {
  try {
    const books = await Book.find({ available_copies: { $gt: 0 } })
      .populate('author_id', 'name')
      .sort({ title: 1 });
    
    const formattedBooks = books.map(book => ({
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      author_id: book.author_id?._id,
      author_name: book.author_id?.name,
      publication_year: book.publication_year,
      genre: book.genre,
      total_copies: book.total_copies,
      available_copies: book.available_copies
    }));
    
    res.json(formattedBooks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.id }).populate('author_id', 'name');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const formattedBook = {
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      author_id: book.author_id?._id,
      author_name: book.author_id?.name,
      publication_year: book.publication_year,
      genre: book.genre,
      total_copies: book.total_copies,
      available_copies: book.available_copies
    };
    
    res.json(formattedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new book
router.post('/', async (req, res) => {
  try {
    const nextId = await getNextSeq('books');

    const book = new Book({
      ...req.body,
      id: nextId
    });
    await book.save();
    res.status(201).json({ message: 'Book created successfully', id: book.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    await Book.findOneAndUpdate({ id: req.params.id }, req.body);
    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    await Book.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
