//=====================Importing Module and Packages=====================//
const moment = require('moment')
const bookModel = require('../Model/bookModel')
const userModel = require("../Model/userModel")
const reviewModel = require('../Model/reviewModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validateName, validateTName, validateISBN, validateDate } = require('../Validator/validator')
const { uploadFile } = require('../Controller/AwsController')

const validTitle = /^[a-zA-Z]+/;
const validCategory = /^[a-zA-Z]+/;
const validateField = /^[a-zA-Z0-9\s\-,?_.]+$/;

//<<<===================== Create Book ===================== <<< /books >>>//
const createBook = async (req, res) => {
    try {
        let data = req.body;
        let loggedInUserId = req.token.payload['userId'];

        let files = req.files;                                              // getting file from Form-Data 

        //=====================Destructuring Book Body Data =====================//
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt, isDeleted, ...rest } = data;

        
        //<<<=============================== getting AWS Link of Book Cover ===============================>>>//
        // Checking the Array Length of Form-Data
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0]);               // written the function uploadFile

            //=====================Fetching BookCover from Book DB and Checking Duplicate BookCover is Present or Not=====================//
            const uniqueCover = await bookModel.findOne({ bookCover: uploadedFileURL });
            if (uniqueCover) return res.status(400).send({ status: false, message: "BookCover Already Exist." });

            //===================== Assign the Key and Value of Book Cover into Data Body =====================//
            data.bookCover = uploadedFileURL;
        }
        else {
            return res.status(400).send({ msg: "No File Found!" })
        }

        // data.bookCover = uploadedFile;
        // data = JSON.parse(JSON.stringify(data));
        // console.log(data)

        if (!checkInputsPresent(data)) return res.status(400).send({ status: false, message: "No data found from body! >> Provide Mandatory Fields(i.e. title, excerpt, userId, ISBN, category, subcategory, releasedAt)." });

        if (checkInputsPresent(rest)) return res.status(400).send({ status: false, message: "Invalid field given in request Body" });

        //=====================Checking Mandatory Field=====================//
        if (!title) return res.status(400).send({ status: false, message: "Please Provide Title." });
        if (!excerpt) return res.status(400).send({ status: false, message: "Please Provide Excerpt." });
        if (!userId) return res.status(400).send({ status: false, message: "Please Provide userId." });
        if (!ISBN) return res.status(400).send({ status: false, message: "Please Provide ISBN." });
        if (!category) return res.status(400).send({ status: false, message: "Please Provide Category." });
        if (!subcategory) return res.status(400).send({ status: false, message: "Please Provide Subcategory." });
        if (!releasedAt) return res.status(400).send({ status: false, message: "Please Provide releasedAt" });

        // if (data.hasOwnProperty("isDeleted") && isDeleted == true) return res.status(400).send({ status: false, message: "You can't put isDeleted: true! It should be false at the time of creation (or by default)." });

        //=====================Checking the value of reviews=====================//
        if (reviews && (reviews !== 0)) return res.status(400).send({ status: false, message: "You can't put reviews at the creation time." });

        //=====================Validation of title, userId, ISBN, category, releasedAt =====================//

        if (!validTitle.test(title)) return res.status(400).send({ status: false, message: "Invalid Title format." });
        if (!checkString(excerpt)) return res.status(400).send({ status: false, message: "Invalid Excerpt." });
        if (!ObjectId.isValid(userId)) return res.status(400).send({ status: false, message: `UserId: ${userId} is not a Valid id.` });

        if (!validateISBN(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN." });
        if (!validCategory.test(category)) return res.status(400).send({ status: false, message: "Invalid Category." });
        if (!validCategory.test(subcategory)) return res.status(400).send({ status: false, message: "Invalid Subcategory." });
        if (!validateDate(releasedAt)) return res.status(400).send({ status: false, message: "Invalid Date Format. You should use this format (YYYY-MM-DD)" });

        //===================== checking the authorisation (taking userId from token and checking with userId taken from body) =====================//
        if (loggedInUserId !== userId) return res.status(403).send({ status: false, message: "You are UnAuthorized to do this task" });

        //=====================Fetching userId from User DB and Checking userId is Present or Not=====================//
        let findUser = await userModel.findById(userId);
        if (!findUser) return res.status(400).send({ status: false, message: `user with userId: ${userId}, is not present in DB.` });

        //=====================Fetching title from DB and Checking Duplicate title is Present or Not=====================//
        let findTitle = await bookModel.findOne({ title: title });
        if (findTitle) return res.status(400).send({ status: false, message: `Book: ${title}, is already exist. Please provide another Title.` });

        //=====================Fetching ISBN from DB and Checking Duplicate ISBN is Present or Not=====================//
        let findUserISBN = await bookModel.findOne({ ISBN: ISBN })
        if (findUserISBN) return res.status(400).send({ status: false, message: `book with  ISBN: ${ISBN}, is already exist. Please provide another ISBN.` });


        //x=====================Final Creation of Book=====================x//
        let createBook = await bookModel.create(data);
        res.status(201).send({ status: true, message: `This ${title} Book is created successfully.`, data: createBook });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
}

//<<<===================== Get All Books =====================<<< /books >>>//
const getAllBooks = async (req, res) => {
    try {
        let query = req.query

        //=====================Destructuring User Data from Query =====================//
        let { userId, category, subcategory, ...rest } = query

        //=====================Checking data apart from Mandotory Field=====================//
        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You have to put only userId or category or subcategory." }) };

        //===================== Fetching data from DB =====================//
        let getBookDataByQuery = await bookModel.find(query, { isDeleted: false }).select({
            title: 1,
            excerpt: 1,
            userId: 1,
            category: 1,
            reviews: 1,
            releasedAt: 1
        });

        //===================== Checking length of getDataByQuery =====================//
        if (getBookDataByQuery.length === 0) return res.status(400).send({ status: false, message: "Data not found in DB." });

        //===================== Sorting Alphabetically by Title =====================//
        const sortBook = getBookDataByQuery.sort((a, b) => a.title.localeCompare(b.title));

        return res.status(200).send({ status: true, message: 'Books list', data: sortBook });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
}

//<<<===================== Get Book by taking bookId from Path Parameter =====================<<< /books/:bookId >>>//
const getBookById = async (req, res) => {
    try {
        //===================== Checking the Query is Present or Not =====================//
        if (checkInputsPresent(req.query) || checkInputsPresent(req.body)) return res.status(400).send({
            status: false,
            message: "You have to give only bookId in path params"
        });

        //===================== Taking the bookId from params =====================//
        let bookId = req.params.bookId;
        //===================== Checking the userId is Valid or Not by Mongoose =====================//
        if (!ObjectId.isValid(bookId)) return res.status(400).send({
            status: false,
            message: `This BookId: ${bookId} is not Valid.`
        });

        //x===================== Fetching All Data from Book DB =====================x//
        let result = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ deletedAt: 0, ISBN: 0, __v: 0 });
        if (!result) return res.status(404).send({ status: false, message: "Book is not exist or already been deleted." });

        //===================== Fetching All Data from Review DB and Checking the value of Review =====================//
        let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false });

        result._doc.reviewData = reviewsData;

        res.status(200).send({ status: true, message: "Success", data: result });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
}

//<<<===================== Update Book =====================<<< /books/:bookId >>>//
const updateBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Book Id is Invalid !!!!" });


        let body = req.body;

        //=====================Destructuring Book Data from Body =====================//
        let { title, excerpt, releasedAt, ISBN, ...rest } = body;

        //=====================Checking Mandatory Field=====================//
        if (!checkInputsPresent(body)) return res.status(400).send({ status: false, message: "please provide some details(i.e. title, excerpt, releasedAt, ISBN) to update !!!" });
        if (checkInputsPresent(rest)) return res.status(400).send({ status: false, message: "You have to put only title or excerpt or releasedAt or ISBN." });


        //=====================Validation of Title=====================//
        if (body.hasOwnProperty('title')) {
            if (!validateField.test(title)) return res.status(400).send({ status: false, message: `Invalid title: ${title}, provided.` });

            //===================== Checking Duplicate Title is Present or Not =====================//
            let checkUniqueTitle = await bookModel.findOne({ title: title });
            if (checkUniqueTitle) return res.status(400).send({ status: false, message: `This title: ${title}, is already Present. Please use Another Title.` });
        }

        //=====================Validation of ISBN=====================//
        if (body.hasOwnProperty('ISBN')) {
            if (!validateISBN(ISBN)) return res.status(400).send({ status: false, message: `Invalid ISBN: ${ISBN} no. provided.` });

            //=====================Fetching data of ISBN from DB and Checking Duplicate ISBN is Present or Not=====================//
            let checkUniqueISBN = await bookModel.findOne({ ISBN: ISBN });
            if (checkUniqueISBN) return res.status(400).send({ status: false, message: `This ISBN: ${ISBN} is already Present. Please use Another ISBN.` });
        }

        //=====================Validation of Excerpt=====================//
        if (body.hasOwnProperty('excerpt') && !validTitle.test(excerpt)) return res.status(400).send({ status: false, message: `Invalid excerpt provided.` });

        //=====================Checking Date Format of releasedAt by Regex=====================//
        if (body.hasOwnProperty('releasedAt') && !validateDate(releasedAt)) return res.status(400).send({ status: false, message: "Invalid Date Format. must be in this format: YYYY-MM-DD " });


        //x=====================Update the Book=====================x//
        let updateBook = await bookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            body,
            { new: true }
        );

        //=====================Checking the Book Data is Present(Updated) or Not=====================//
        if (!updateBook) return res.status(404).send({ status: false, message: "No Document Found! Book Updation Unsuccessful" });

        res.status(200).send({ status: true, message: 'Success', data: updateBook });
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
}


//<<<===================== Delete Books by taking bookId from Path Parameter =====================<<< /books/:bookId >>>//
const deleteBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;

        //===================== We don't accept any input from Q1ery & body =====================//
        if (checkInputsPresent(req.query) || checkInputsPresent(req.body)) return res.status(400).send({ status: false, message: "You can't put anything in query or body." });

        //===================== validating bookId =====================//
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` });


        //=====================Fetching the data of Book(not deleted) then Delete=====================//
        let deleteByBookId = await bookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() },
            { new: true }
        );

        //====================Checking the Book Data is Present(Deleted) or Not======================//
        if (!deleteByBookId) return res.status(404).send({ status: false, message: "No book Found! Book Deletion Unsuccessful" });

        res.status(200).send({ status: true, message: `bookName: ${deleteByBookId.title}, is Deleted Successfully` });

    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
}



//=====================Module Export=====================//
module.exports = { createBook, getAllBooks, getBookById, updateBookById, deleteBookById }