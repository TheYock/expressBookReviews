const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    if (!username || username.trim() === '') {
        return false;
    }
    // Add additional validation logic here
    // Example: Check for allowed characters
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return false;
    }
    // Example: Check for minimum and maximum length
    if (username.length < 4 || username.length > 20) {
        return false;
    }
    return true;
}

const authenticatedUser = (username, password) => {
    // Implement logic to check if username and password match the records
    // Example: Compare against a database of registered users
    const user = users.find(user => user.username === username && user.password === password);
    return !!user; // Returns true if user is found, false otherwise
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if the user is already authenticated
    if (req.session.authorization && req.session.authorization.accessToken) {
        // If already authenticated, return the existing JWT token
        return res.status(200).json({ accessToken: req.session.authorization.accessToken });
    }

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if username is valid
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    // Check if username and password match the records
    if (authenticatedUser(username, password)) {
        // Create a JWT token for the user
        const accessToken = jwt.sign({ username: username }, "secret_key", {expiresIn: "1h"});

        // Store the JWT token in the session
        req.session.authorization = { accessToken: accessToken };

        // Return the JWT token as response
        return res.status(200).json({ accessToken: accessToken });
    } else {
        // If username and password do not match, return error message
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Retrieve the ISBN and review from request parameters and query
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check if the user is authenticated
    if (!req.session.authorization || !req.session.authorization.accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the JWT token
    jwt.verify(req.session.authorization.accessToken, "secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        } else {
            const username = decoded.username;

            // Check if the book exists
            if (books[isbn]) {
                // Check if the user already has a review for this book
                if (!books[isbn].reviews[username]) {
                    // If not, add the review
                    books[isbn].reviews[username] = review;
                } else {
                    // If yes, modify the existing review
                    books[isbn].reviews[username] = review;
                }

                return res.status(200).json({ message: "Review added/modified successfully" });
            } else {
                return res.status(404).json({ message: "Book not found" });
            }
        }
    });
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Retrieve the ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the user is authenticated
    if (!req.session.authorization || !req.session.authorization.accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the JWT token
    jwt.verify(req.session.authorization.accessToken, "secret_key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        } else {
            const username = decoded.username;

            // Check if the book exists
            if (books[isbn]) {
                // Check if the user has a review for this book
                if (books[isbn].reviews[username]) {
                    // Delete the review
                    delete books[isbn].reviews[username];
                    return res.status(200).json({ message: "Review deleted successfully" });
                } else {
                    // If the user does not have a review for this book
                    return res.status(404).json({ message: "Review not found" });
                }
            } else {
                // If the book is not found
                return res.status(404).json({ message: "Book not found" });
            }
        }
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
