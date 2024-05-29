const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"user2", "password":"password2"}];

const isValid = (username)=>{ //returns boolean
    let userWithSameName = users.filter((user)=>{
        return user.username === username
    });
    if (userWithSameName.length > 0) {
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=> {
        return (user.username === username && user.password === password)
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password)

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    console.log(users)
    if (authenticatedUser(username, password)) {
        
        let accessToken = jwt.sign({
            username: username,
            data: password
        }, 'access', { expiresIn: 60 * 60});

        req.session.authorization = {
            accessToken,username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"})
    }
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const review = req.body.review
    const isbn = req.params.isbn

    if (!review || !isbn) {
        return res.status(404).json({message: "No review and/or isbn selected."});
    }
    let previousReview = books[isbn].reviews[req.user.username]
    books[isbn].reviews[req.user.username] = review
    if (previousReview) {
        return res.status(200).send("Book review successfully edited");
    } else {
        return res.status(200).send("Book review successfully added");
    }
});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    let book = books[isbn]
    if (book.reviews[req.user.username]) {
        delete book.reviews[req.user.username]
        return res.send("Review successfully deleted.")
    } else {
        return res.status(404).json({message: "No review from this user found for this book."});
    } 
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
