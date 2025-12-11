const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('./database');

// Models for id backfill
const Author = require('./models/authors');
const Book = require('./models/books');
const Issue = require('./models/issues');
const { Counter } = require('./models/counter');

// Import database to initialize tables
// (already imported above)
// Import routes
const authorsRouter = require('./routes/authors');
const booksRouter = require('./routes/books');
const issuesRouter = require('./routes/issues');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for frontend)
app.use(express.static('public'));

// API Routes
app.use('/api/authors', authorsRouter);
app.use('/api/books', booksRouter);
app.use('/api/issues', issuesRouter);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper to ensure sequential numeric ids exist for existing data
async function backfillIds(Model, counterName, label) {
  const lastWithId = await Model.findOne({ id: { $ne: null } })
    .sort({ id: -1 })
    .select('id')
    .lean();
  const counter = await Counter.findById(counterName).lean();

  let nextId = Math.max(lastWithId?.id || 0, counter?.seq || 0);

  const missing = await Model.find({
    $or: [
      { id: { $exists: false } },
      { id: null }
    ]
  }).sort({ createdAt: 1 });

  for (const doc of missing) {
    nextId += 1;
    doc.id = nextId;
    await doc.save();
  }

  // Persist counter so future creations continue sequence
  if (!counter || counter.seq < nextId) {
    await Counter.findByIdAndUpdate(
      counterName,
      { seq: nextId },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  if (missing.length) {
    console.log(`Backfilled ${missing.length} ${label} ids up to ${nextId}`);
  }
}

// Start server after DB is ready and ids are ensured
mongoose.connection.once('open', async () => {
  try {
    await backfillIds(Author, 'authors', 'author');
    await backfillIds(Book, 'books', 'book');
    await backfillIds(Issue, 'issues', 'issue');
  } catch (err) {
    console.error('Error during id backfill:', err);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  - Authors: http://localhost:${PORT}/api/authors`);
    console.log(`  - Books: http://localhost:${PORT}/api/books`);
    console.log(`  - Issues: http://localhost:${PORT}/api/issues`);
  });
});

module.exports = app;
