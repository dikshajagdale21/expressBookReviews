
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

// Check whether a username already exists
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check whether username and password match
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Task 6: Register a new user
regd_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered'
  });
});

// Task 7: Login a registered user
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password'
    });
  }

  req.session.username = username;

  const accessToken = jwt.sign(
    { username },
    'access_secret_key',
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'User successfully logged in',
    accessToken
  });
});

// Task 8: Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const username = req.session.username;
  const { isbn } = req.params;
  const review = req.query.review;

  if (!username) {
    return res.status(401).json({
      message: 'Please log in first'
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'Review is required'
    });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // A user has one review per book; a new review replaces their old one.
  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: 'Review added or updated successfully',
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete the logged-in user's own review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const username = req.session.username;
  const { isbn } = req.params;

  if (!username) {
    return res.status(401).json({
      message: 'Please log in first'
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found'
    });
  }

  const reviews = books[isbn].reviews || {};

  if (!Object.prototype.hasOwnProperty.call(reviews, username)) {
    return res.status(404).json({
      message: 'Your review was not found'
    });
  }

  delete reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully',
    reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
