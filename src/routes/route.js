//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { Authentication, Authorisation } = require('../Middleware/auth');
const { createUser, loginUser } = require('../controller/userController');
const { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } = require('../controller/bookController');
const { createReview, updateReview, deleteReview } = require('../controller/reviewController');





//===================== User Registration(Post API) =====================//
router.post("/register", createUser);

//===================== User Login(Post API) =====================//
router.post("/login", loginUser);

//===================== Create Books(Post API) =====================//
router.post("/books", Authentication, createBook);

//===================== Get Books(Get API) =====================//
router.get("/books", Authentication, getAllBooks);

//===================== Get Books by Path Parameter(Get API) =====================//
router.get("/books/:bookId", Authentication, getBookById);

//===================== Update Books by Path Parameter(Put API) =====================//
router.put("/books/:bookId", Authentication, Authorisation, updateBookById);

//===================== Delete Books by Path Parameter(Delete API) =====================//
router.delete("/books/:bookId", Authentication, Authorisation, deleteBookById);

//===================== create Review (post API) =====================//
router.post("/books/:bookId/review", createReview);

//===================== update Review (put API) =====================//
router.put("/books/:bookId/review/:reviewId", updateReview);

//===================== delete Review (delete API) =====================//
router.delete("/books/:bookId/review/:reviewId", deleteReview);





//=====================Module Export=====================//
module.exports = router;