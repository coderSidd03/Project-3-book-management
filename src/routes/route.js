//=====================Importing Module and Packages=====================//
const express = require('express');
const router = express.Router();
const { Authentication, Authorisation } = require('../Middleware/auth');
const { createUser, loginUser } = require('../Controller/userController');
const { createBook, getAllBooks, getBookById, updateBookById, deleteBookById } = require('../Controller/bookController');
const { createReview, updateReview, deleteReview } = require('../Controller/reviewController');




//===================== User APIs =====================//
router.post("/register", createUser);                                               // >>>>>>>> User Registration (Post API)

router.post("/login", loginUser);                                                   // >>>>>>>> User Login (Post API)


//===================== Book APIs =====================//
router.post("/books", Authentication, createBook);                                  // >>>>>>>> Create Books (Post API)

router.get("/books", Authentication, getAllBooks);                                  // >>>>>>>> Get All Books (Post API)

router.get("/books/:bookId", Authentication, getBookById);                          // >>>>>>>> Get BookById (path params) (Post API)

router.put("/books/:bookId", Authentication, Authorisation, updateBookById);        // >>>>>>>> Update Books by id (Path Params) (Put API)

router.delete("/books/:bookId", Authentication, Authorisation, deleteBookById);     // >>>>>>>> Delete Books by id (Path Params) (Delete API)


//===================== Review APIs =====================//
router.post("/books/:bookId/review", createReview);                                 // >>>>>>>> Create review (Post API)

router.put("/books/:bookId/review/:reviewId", updateReview);                        // >>>>>>>> Update review by id & book id (Path Params) (Put API)

router.delete("/books/:bookId/review/:reviewId", deleteReview);                     // >>>>>>>> delete Review (delete API)





//=====================Module Export=====================//
module.exports = router;