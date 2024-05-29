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
    const review = req.query.review
    const isbn = req.params.isbn
    console.log(review)
    console.log(req.user)
    if (!review || !isbn) {
        return res.status(404).json({message: "No review and/or isbn selected."});
    }

    if(req.session.authorization) {
        token = req.session.authorization['accessToken'];
        jwt.verify(token, "access",(err,user)=>{
            if(!err){
                req.user = user;
                next();
            } else {
                return res.status(403).json({message: "User not authenticated"})
            }
        })
    } else {
        return res.status(403).json({message: "User not logged in"})
    }
    let reviews = books[isbn].reviews
    books[isbn].reviews[req.user] = review
    console.log(req.user)
    
    console.log(reviews)

});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn
    console.log(review, isbn)
    res.send("what")
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
