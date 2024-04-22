const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
 // Extract username and password from request body
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });

  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   // Convert the books object into an array of book objects
   const availableBooks = Object.values(books).map(book => {
    return {
      title: book.title,
      author: book.author,
      isbn: book.isbn
    };
  });
  return res.status(200).json(availableBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN from request parameters
  const isbn = req.params.isbn;

  // Find the book with the specified ISBN
  const book = Object.values(books).find(book => book.isbn === isbn);

  // Check if the book is found
  if (book) {
    // Return the book details
    return res.status(200).json(book);
  } else {
    // If the book is not found, return a not found message
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
 // Retrieve the author from request parameters
 const author = req.params.author;

 // Array to store books with matching author
 const booksByAuthor = [];

 // Iterate through the books object
 Object.values(books).forEach(book => {
   // Check if the author matches the one provided in the request parameters
   if (book.author === author) {
     booksByAuthor.push(book);
   }
 });

 // Check if any books were found for the author
 if (booksByAuthor.length > 0) {
   // Return the books found for the author
   return res.status(200).json(booksByAuthor);
 } else {
   // If no books were found, return a not found message
   return res.status(404).json({ message: "No books found for author" });
 }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Retrieve the title from request parameters
  const title = req.params.title;

  // Array to store books with matching title
  const booksByTitle = [];

  // Iterate through the books object
  Object.values(books).forEach(book => {
    // Check if the title matches the one provided in the request parameters
    if (book.title.toLowerCase().includes(title.toLowerCase())) {
      booksByTitle.push(book);
    }
  });

  // Check if any books were found for the title
  if (booksByTitle.length > 0) {
    // Return the books found for the title
    return res.status(200).json(booksByTitle);
  } else {
    // If no books were found, return a not found message
    return res.status(404).json({ message: "No books found with title containing '" + title + "'" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
 // Retrieve the ISBN from request parameters
 const isbn = req.params.isbn;

 // Find the book with the specified ISBN
 const book = Object.values(books).find(book => book.isbn === isbn);

 // Check if the book is found
 if (book) {
   // Check if the book has any reviews
   if (Object.keys(book.reviews).length > 0) {
     // Return the reviews for the book
     return res.status(200).json(book.reviews);
   } else {
     // If the book has no reviews, return a message
     return res.status(404).json({ message: "No reviews found for this book" });
   }
 } else {
   // If the book is not found, return a not found message
   return res.status(404).json({ message: "Book not found" });
 }
});

module.exports.general = public_users;
