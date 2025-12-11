const API_URL = 'http://localhost:3000/api';

const sortState = {
    authors: { field: 'id', dir: 'asc' },
    books: { field: 'id', dir: 'asc' },
    issues: { field: 'issue_date', dir: 'desc' }
};

// Update sort indicators in table headers
function updateSortIndicators(tableType) {
    const { field, dir } = sortState[tableType];
    
    // Set default indicators for all sortable columns
    document.querySelectorAll(`[id^='${tableType}-sort-']`).forEach(el => {
        el.textContent = ' ▼';
    });
    
    // Set indicator for current sort field
    const indicatorElement = document.getElementById(`${tableType}-sort-${field}`);
    if (indicatorElement) {
        indicatorElement.textContent = dir === 'asc' ? ' ▲' : ' ▼';
    }
}

// Initialize sort indicators with default values
function initializeSortIndicators() {
    // Set default sort indicators for all tables
    ['authors', 'books', 'issues'].forEach(tableType => {
        const { field, dir } = sortState[tableType];
        
        // Set default indicators for all sortable columns
        document.querySelectorAll(`[id^='${tableType}-sort-']`).forEach(el => {
            el.textContent = ' ▼';
        });
        
        // Set active indicator for current sort field
        const indicatorElement = document.getElementById(`${tableType}-sort-${field}`);
        if (indicatorElement) {
            indicatorElement.textContent = dir === 'asc' ? ' ▲' : ' ▼';
        }
    });
}

// Sort table by field
function sortTable(tableType, field) {
    const currentField = sortState[tableType].field;
    const currentDir = sortState[tableType].dir;
    
    // If clicking the same field, toggle direction
    if (currentField === field) {
        sortState[tableType].dir = currentDir === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to ascending
        sortState[tableType].field = field;
        sortState[tableType].dir = 'asc';
    }
    
    // Update indicators
    updateSortIndicators(tableType);
    
    // Reload data
    if (tableType === 'authors') {
        loadAuthors();
    } else if (tableType === 'books') {
        loadBooks();
    } else if (tableType === 'issues') {
        loadIssues();
    }
}

// Tab switching
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data when tab is opened
    if (tabName === 'authors') {
        loadAuthors();
    } else if (tabName === 'books') {
        loadBooks();
        loadAuthorsForSelect();
    } else if (tabName === 'issues') {
        loadIssues();
        loadBooksForSelect();
    }
    
    // Update sort indicators
    updateSortIndicators(tabName);
}

// Show message
function showMessage(elementId, message, isError = false) {
    const msgElement = document.getElementById(elementId);
    msgElement.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
    setTimeout(() => {
        msgElement.innerHTML = '';
    }, 3000);
}

// ==================== AUTHORS ====================

// Load all authors
async function loadAuthors() {
    try {
        const { field, dir } = sortState.authors;
        const response = await fetch(`${API_URL}/authors?sortField=${field}&sortDir=${dir}`);
        const authors = await response.json();
        
        const tbody = document.getElementById('authorsTable');
        tbody.innerHTML = '';
        
        authors.forEach((author) => {
            const authorId = author.id ?? author._id;
            const displayId = author.id ?? authorId;
            tbody.innerHTML += `
                <tr>
                    <td>${displayId}</td>
                    <td>${author.name}</td>
                    <td>${author.email || '-'}</td>
                    <td>${author.bio || '-'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editAuthor('${authorId}')">Edit</button>
                            <button class="btn-delete" onclick="deleteAuthor('${authorId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        // Update sort indicators
        updateSortIndicators('authors');
    } catch (error) {
        showMessage('authorsMessage', 'Error loading authors: ' + error.message, true);
    }
}

// Author form submission
document.getElementById('authorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('author_id').value;
    const data = {
        name: document.getElementById('author_name').value,
        email: document.getElementById('author_email').value,
        bio: document.getElementById('author_bio').value
    };
    
    try {
        const url = id ? `${API_URL}/authors/${id}` : `${API_URL}/authors`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        showMessage('authorsMessage', result.message);
        resetAuthorForm();
        loadAuthors();
    } catch (error) {
        showMessage('authorsMessage', 'Error: ' + error.message, true);
    }
});

// Edit author
async function editAuthor(id) {
    try {
        const response = await fetch(`${API_URL}/authors/${id}`);
        const author = await response.json();
        
        document.getElementById('author_id').value = author._id || author.id;
        document.getElementById('author_name').value = author.name;
        document.getElementById('author_email').value = author.email || '';
        document.getElementById('author_bio').value = author.bio || '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage('authorsMessage', 'Error loading author: ' + error.message, true);
    }
}

// Delete author
async function deleteAuthor(id) {
    if (!confirm('Are you sure you want to delete this author?')) return;
    
    try {
        const response = await fetch(`${API_URL}/authors/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showMessage('authorsMessage', result.message);
        loadAuthors();
    } catch (error) {
        showMessage('authorsMessage', 'Error: ' + error.message, true);
    }
}

// Reset author form
function resetAuthorForm() {
    document.getElementById('authorForm').reset();
    document.getElementById('author_id').value = '';
}

// ==================== BOOKS ====================

// Load all books
async function loadBooks() {
    try {
        const { field, dir } = sortState.books;
        const response = await fetch(`${API_URL}/books?sortField=${field}&sortDir=${dir}`);
        const books = await response.json();
        
        const tbody = document.getElementById('booksTable');
        tbody.innerHTML = '';
        
        books.forEach((book) => {
            const isAvailable = book.available_copies > 0;
            const bookId = book.id ?? book._id;
            const displayId = book.id ?? bookId;
            tbody.innerHTML += `
                <tr>
                    <td>${displayId}</td>
                    <td>${book.title}</td>
                    <td>${book.isbn || '-'}</td>
                    <td>${book.author_name || '-'}</td>
                    <td>${book.publication_year || '-'}</td>
                    <td>${book.genre || '-'}</td>
                    <td>${book.available_copies}/${book.total_copies}</td>
                    <td>
                        <span class="availability ${isAvailable ? 'available' : 'unavailable'}">
                            ${isAvailable ? '✓ Available' : '✗ Unavailable'}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-edit" onclick="editBook('${bookId}')">Edit</button>
                            <button class="btn-delete" onclick="deleteBook('${bookId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        // Update sort indicators
        updateSortIndicators('books');
    } catch (error) {
        showMessage('booksMessage', 'Error loading books: ' + error.message, true);
    }
}

// Load authors for select dropdown
async function loadAuthorsForSelect() {
    try {
        const response = await fetch(`${API_URL}/authors`);
        const authors = await response.json();
        
        const select = document.getElementById('book_author');
        select.innerHTML = '<option value="">Select Author</option>';
        
        authors.forEach(author => {
            const authorId = author._id || author.id;
            select.innerHTML += `<option value="${authorId}">${author.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading authors:', error);
    }
}

// Book form submission
document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('book_id').value;
    const data = {
        title: document.getElementById('book_title').value,
        isbn: document.getElementById('book_isbn').value,
        author_id: document.getElementById('book_author').value,
        publication_year: document.getElementById('book_year').value,
        genre: document.getElementById('book_genre').value,
        total_copies: parseInt(document.getElementById('book_total').value),
        available_copies: parseInt(document.getElementById('book_available').value)
    };
    
    try {
        const url = id ? `${API_URL}/books/${id}` : `${API_URL}/books`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        showMessage('booksMessage', result.message);
        resetBookForm();
        loadBooks();
    } catch (error) {
        showMessage('booksMessage', 'Error: ' + error.message, true);
    }
});

// Edit book
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/books/${id}`);
        const book = await response.json();
        
        document.getElementById('book_id').value = book._id || book.id;
        document.getElementById('book_title').value = book.title;
        document.getElementById('book_isbn').value = book.isbn || '';
        document.getElementById('book_author').value = book.author_id;
        document.getElementById('book_year').value = book.publication_year || '';
        document.getElementById('book_genre').value = book.genre || '';
        document.getElementById('book_total').value = book.total_copies;
        document.getElementById('book_available').value = book.available_copies;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showMessage('booksMessage', 'Error loading book: ' + error.message, true);
    }
}

// Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showMessage('booksMessage', result.message);
        loadBooks();
    } catch (error) {
        showMessage('booksMessage', 'Error: ' + error.message, true);
    }
}

// Reset book form
function resetBookForm() {
    document.getElementById('bookForm').reset();
    document.getElementById('book_id').value = '';
    document.getElementById('book_total').value = 1;
    document.getElementById('book_available').value = 1;
}

// ==================== ISSUES ====================

// Load all issues
async function loadIssues() {
    try {
        const { field, dir } = sortState.issues;
        const response = await fetch(`${API_URL}/issues?sortField=${field}&sortDir=${dir}`);
        const issues = await response.json();
        
        const tbody = document.getElementById('issuesTable');
        tbody.innerHTML = '';
        
        issues.forEach((issue) => {
            const issueDate = new Date(issue.issue_date).toLocaleDateString();
            const dueDate = new Date(issue.due_date).toLocaleDateString();
            const returnDate = issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '-';
            const issueId = issue.id ?? issue._id;
            const displayId = issue.id ?? issueId;
            
            tbody.innerHTML += `
                <tr>
                    <td>${displayId}</td>
                    <td>${issue.book_title || '-'}</td>
                    <td>${issue.member_name}</td>
                    <td>${issue.member_email || '-'}</td>
                    <td>${issueDate}</td>
                    <td>${dueDate}</td>
                    <td>${returnDate}</td>
                    <td>
                        <span class="status-badge status-${issue.status}">
                            ${issue.status.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <div class="action-btns">
                            ${issue.status === 'issued' || issue.status === 'overdue' ? 
                                `<button class="btn-return" onclick="returnBook('${issueId}')">Return</button>` : ''}
                            <button class="btn-delete" onclick="deleteIssue('${issueId}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        // Update sort indicators
        updateSortIndicators('issues');
    } catch (error) {
        showMessage('issuesMessage', 'Error loading issues: ' + error.message, true);
    }
}

// Load available books for select dropdown
async function loadBooksForSelect() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        
        const select = document.getElementById('issue_book');
        select.innerHTML = '<option value="">Select Book</option>';
        
        books.filter(book => book.available_copies > 0).forEach(book => {
            const bookId = book._id || book.id;
            select.innerHTML += `<option value="${bookId}">${book.title} (${book.available_copies} available)</option>`;
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Issue form submission
document.getElementById('issueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        book_id: document.getElementById('issue_book').value,
        member_name: document.getElementById('issue_member_name').value,
        member_email: document.getElementById('issue_member_email').value,
        due_date: document.getElementById('issue_due_date').value
    };
    
    try {
        const response = await fetch(`${API_URL}/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        showMessage('issuesMessage', result.message);
        resetIssueForm();
        loadIssues();
        loadBooksForSelect(); // Refresh available books
    } catch (error) {
        showMessage('issuesMessage', 'Error: ' + error.message, true);
    }
});

// Return book
async function returnBook(id) {
    if (!confirm('Mark this book as returned?')) return;
    
    try {
        const response = await fetch(`${API_URL}/issues/${id}/return`, {
            method: 'POST'
        });
        
        const result = await response.json();
        showMessage('issuesMessage', result.message);
        loadIssues();
        loadBooksForSelect(); // Refresh available books
    } catch (error) {
        showMessage('issuesMessage', 'Error: ' + error.message, true);
    }
}

// Delete issue
async function deleteIssue(id) {
    if (!confirm('Are you sure you want to delete this issue record?')) return;
    
    try {
        const response = await fetch(`${API_URL}/issues/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        showMessage('issuesMessage', result.message);
        loadIssues();
    } catch (error) {
        showMessage('issuesMessage', 'Error: ' + error.message, true);
    }
}

// Reset issue form
function resetIssueForm() {
    document.getElementById('issueForm').reset();
    
    // Set default due date to 14 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    document.getElementById('issue_due_date').value = dueDate.toISOString().split('T')[0];
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadAuthors();
    loadBooks();
    loadIssues();
    loadAuthorsForSelect();
    loadBooksForSelect();
    
    // Initialize sort indicators
    initializeSortIndicators();
    
    // Set default due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    document.getElementById('issue_due_date').value = dueDate.toISOString().split('T')[0];
});


