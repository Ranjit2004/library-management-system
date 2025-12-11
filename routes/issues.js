const express = require('express');
const router = express.Router();
const Issue = require('../models/issues');
const Book = require('../models/books');
const { getNextSeq } = require('../models/counter');

// Get all issues
router.get('/', async (req, res) => {
  try {
    const sortField = req.query.sortField || 'issue_date';
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1;
    const issues = await Issue.find()
      .populate({
        path: 'book_id',
        populate: { path: 'author_id', select: 'name' }
      })
      .sort({ [sortField]: sortDir, issue_date: -1 });
    
    // Format response to match frontend expectations
    const formattedIssues = issues.map(issue => ({
      id: issue.id,
      book_id: issue.book_id?._id,
      book_title: issue.book_id?.title,
      author_name: issue.book_id?.author_id?.name,
      member_name: issue.member_name,
      member_email: issue.member_email,
      issue_date: issue.issue_date,
      due_date: issue.due_date,
      return_date: issue.return_date,
      status: issue.status
    }));
    
    res.json(formattedIssues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active issues
router.get('/active', async (req, res) => {
  try {
    const issues = await Issue.find({ status: { $in: ['issued', 'overdue'] } })
      .populate({
        path: 'book_id',
        populate: { path: 'author_id', select: 'name' }
      })
      .sort({ due_date: 1 });
    
    const formattedIssues = issues.map(issue => ({
      id: issue.id,
      book_id: issue.book_id?._id,
      book_title: issue.book_id?.title,
      author_name: issue.book_id?.author_id?.name,
      member_name: issue.member_name,
      member_email: issue.member_email,
      issue_date: issue.issue_date,
      due_date: issue.due_date,
      return_date: issue.return_date,
      status: issue.status
    }));
    
    res.json(formattedIssues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get issue by ID
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({ id: req.params.id })
      .populate({
        path: 'book_id',
        populate: { path: 'author_id', select: 'name' }
      });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    const formattedIssue = {
      id: issue.id,
      book_id: issue.book_id?._id,
      book_title: issue.book_id?.title,
      author_name: issue.book_id?.author_id?.name,
      member_name: issue.member_name,
      member_email: issue.member_email,
      issue_date: issue.issue_date,
      due_date: issue.due_date,
      return_date: issue.return_date,
      status: issue.status
    };
    
    res.json(formattedIssue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new issue (issue a book)
router.post('/', async (req, res) => {
  try {
    // First decrease book availability
    const book = await Book.findById(req.body.book_id);
    if (!book || book.available_copies <= 0) {
      return res.status(400).json({ error: 'Book not available' });
    }
    
    book.available_copies -= 1;
    await book.save();
    
    // Then create issue record
    const nextId = await getNextSeq('issues');

    const issue = new Issue({
      ...req.body,
      id: nextId
    });
    await issue.save();
    
    res.status(201).json({ message: 'Book issued successfully', id: issue.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Return a book
router.post('/:id/return', async (req, res) => {
  try {
    // First get issue details
    const issue = await Issue.findOne({ id: req.params.id });
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    // Update issue status to returned
    issue.return_date = new Date();
    issue.status = 'returned';
    await issue.save();
    
    // Increase book availability
    const book = await Book.findById(issue.book_id);
    if (book) {
      book.available_copies += 1;
      await book.save();
    }
    
    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update issue status
router.put('/:id/status', async (req, res) => {
  try {
    await Issue.findOneAndUpdate({ id: req.params.id }, { status: req.body.status });
    res.json({ message: 'Issue status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete issue
router.delete('/:id', async (req, res) => {
  try {
    await Issue.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
