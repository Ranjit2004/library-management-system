# Library Management CRUD Application

A full-stack library management system with CRUD operations for managing books, authors, and book issues/returns.

## Features

- **Authors Management**: Create, Read, Update, and Delete authors
- **Books Management**: Manage books with availability tracking
- **Issues/Returns**: Track book borrowing and returns
- **Availability Status**: Real-time tracking of available vs issued books
- **Responsive UI**: Clean and modern interface

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Authors
- `GET /api/authors` - Get all authors
- `GET /api/authors/:id` - Get author by ID
- `POST /api/authors` - Create new author
- `PUT /api/authors/:id` - Update author
- `DELETE /api/authors/:id` - Delete author

### Books
- `GET /api/books` - Get all books
- `GET /api/books/available` - Get available books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Issues
- `GET /api/issues` - Get all issues
- `GET /api/issues/active` - Get active issues
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Issue a book
- `POST /api/issues/:id/return` - Return a book
- `PUT /api/issues/:id/status` - Update issue status
- `DELETE /api/issues/:id` - Delete issue

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite
- **Frontend**: Vanilla JavaScript, HTML, CSS
