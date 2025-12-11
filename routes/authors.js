const express = require('express');
const router = express.Router();
const Author = require('../models/authors');
const { getNextSeq } = require('../models/counter');

// Get all authors
router.get('/', async (req, res) => {
  try {
    const sortField = req.query.sortField || 'name';
    const sortDir = req.query.sortDir === 'desc' ? -1 : 1;
    const authors = await Author.find().sort({ [sortField]: sortDir, name: 1 });
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get author by ID (numeric id)
router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findOne({ id: req.params.id });
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new author
router.post('/', async (req, res) => {
  try {
    const nextId = await getNextSeq('authors');

    const author = new Author({
      ...req.body,
      id: nextId
    });
    await author.save();
    res.status(201).json({ message: 'Author created successfully', id: author.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update author
router.put('/:id', async (req, res) => {
  try {
    await Author.findOneAndUpdate({ id: req.params.id }, req.body);
    res.json({ message: 'Author updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete author
router.delete('/:id', async (req, res) => {
  try {
    await Author.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Author deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
