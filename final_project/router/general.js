
const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
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

// Task 1: Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Task 2: Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book);
});

// Task 3: Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const result = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  return res.status(200).json(result);
});

// Task 4: Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const result = Object.values(books).filter(
    book => book.title.toLowerCase().includes(title)
  );

  return res.status(200).json(result);
});

// Task 5: Get reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book.reviews || {});
});

// Tasks 10–13: Async/Await with Axios
const BASE_URL = 'http://localhost:5000';

public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(BASE_URL + '/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch books' });
  }
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(
      BASE_URL + '/isbn/' + encodeURIComponent(req.params.isbn)
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json(
      error.response?.data || { message: 'Unable to fetch book' }
    );
  }
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(
      BASE_URL + '/author/' + encodeURIComponent(req.params.author)
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch books' });
  }
});

public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(
      BASE_URL + '/title/' + encodeURIComponent(req.params.title)
    );
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch books' });
  }
});

module.exports.general = public_users;
