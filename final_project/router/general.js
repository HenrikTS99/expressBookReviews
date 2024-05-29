const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password)
    if (username && password) {
        if (isValid(username)) {
            users.push({"username":username, "password":password});
            return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});    
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books)
        } else {
            reject()
        }
    })
    getBooks.then((books) => {
        res.send(JSON.stringify(books, null, 4));
    }).catch((error) => {
        res.status(500).json({error: error.message});
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const getDetails = new Promise((resolve, reject) => {
        let bookDetails = books[req.params.isbn]
        if (bookDetails) {
            resolve(bookDetails)
        } else {
            reject()
        }
    })
    getDetails.then((bookDetails) => {
        res.send(JSON.stringify(bookDetails))
    }).catch((error) => {
        res.status(500).json({error: error.message});
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const getAuthor = new Promise((resolve, reject) => {
        let author = req.params.author
        let booksByAuthor = {};
        Object.keys(books)
        .filter(isbn => books[isbn].author === author)
        .forEach(isbn => {
            booksByAuthor[isbn] = books[isbn];
        });
        console.log(Object.keys(booksByAuthor).length)
        if (Object.keys(booksByAuthor).length > 0) {
            resolve(booksByAuthor)
        } else {
            reject(new Error('No books by this author found.'));
        }
    })
    getAuthor.then((booksByAuthor) => {
        res.send(booksByAuthor)
    }).catch((error) => {
        res.status(500).json({error: error.message});
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const getBooksByTitle = new Promise((resolve, reject) => {
        let title = req.params.title;
        let booksByTitle = {};

        Object.keys(books)
        .filter(isbn => books[isbn].title === title)
        .forEach(isbn => {
            booksByTitle[isbn] = books[isbn]
        });
        if (Object.keys(booksByTitle).length > 0) {
            resolve(booksByTitle)
        } else {
            reject(new Error('No books with this title'))
        }
    });
    getBooksByTitle.then((booksByTitle) => {
        res.send(booksByTitle)
    }).catch((error) => {
        res.status(500).json({error: error.message})
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews)
});

module.exports.general = public_users;
