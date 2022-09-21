// const moment = require('moment')
const bookModel = require('../Model/bookModel')
const userModel = require("../Model/userModel")
const reviewModel = require('../Model/reviewModel')
const ObjectId = require('mongoose').Types.ObjectId
const { checkInputsPresent, checkString, validatePincode, validateName, validateEmail, validatePassword, validateTitle, validateMobileNo, validateISBN, validateDate } = require('../Validator/validator')


const createBook = async (req, res) => {
    try {
        let data = req.body
        let { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = data

        if (!(title && excerpt && userId && ISBN && category && subcategory && releasedAt)) {
            return res.status(400).send({ status: false, message: "All Fields are Mandatory(i.e. title, excerpt, userId, ISBN, category, subcategory, releasedAt)." })
        }

        if (userId.trim().length == 0) { return res.status(400).send({ status: false, message: "Please insert valid userId." }) }
        if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: `This UserId: ${userId} is not Valid.` }) }

        let checkUserId = await userModel.findById(userId)
        if (!checkUserId) { return res.status(400).send({ status: false, message: `${userId} is not Exist.` }) }


        if (!checkString(title)) return res.status(400).send({ status: false, message: "Please Provide Title." })
        if (!validateName(title)) return res.status(400).send({ status: false, message: "Invalid Title." });

        if (!checkString(excerpt)) return res.status(400).send({ status: false, message: "Please Provide Excerpt." })
        if (!validateName(excerpt)) return res.status(400).send({ status: false, message: "Invalid Excerpt." });

        if (!checkString(ISBN)) return res.status(400).send({ status: false, message: "Please Provide ISBN." })
        if (!validateISBN(ISBN)) return res.status(400).send({ status: false, message: "Invalid ISBN." });


        if (!checkString(category)) return res.status(400).send({ status: false, message: "Please Provide Category." })
        if (!validateName(category)) return res.status(400).send({ status: false, message: "Invalid Category." });

        if (!checkString(subcategory)) return res.status(400).send({ status: false, message: "Please Provide Subcategory." })
        if (!validateName(subcategory)) return res.status(400).send({ status: false, message: "Invalid Subcategory." });


        if (reviews && Object.values(reviews) !== 0) { return res.status(400).send({ status: false, message: "You can't put reviews now." }) }
        if (!validateDate(releasedAt)) return res.status(400).send({ status: false, message: "Invalid Date Format. You should use this format (YYYY-MM-DD)" });


        let checkDuplicateTitle = await bookModel.findOne({ title: title })
        if (checkDuplicateTitle) {
            return res.status(400).send({ status: false, message: `This Book: ${title} is already exist. Please provide another Title.` })
        }

        let checkDuplicateISBN = await bookModel.findOne({ ISBN: ISBN })
        if (checkDuplicateISBN) {
            return res.status(400).send({ status: false, message: `This ISBN: ${ISBN} is already exist. Please provide another ISBN.` })
        }


        let createBook = await bookModel.create(data)

        res.status(201).send({ status: true, message: `This ${title} Book is created sucessfully.`, data: createBook })


    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

const getAllBooks = async (req, res) => {

    try {

        let query = req.query
        let { userId, category, subcategory, ...rest } = query

        if (checkInputsPresent(rest)) { return res.status(400).send({ status: false, message: "You can filter results by << userId or category or subcategory or both only >> " }) }

        if (!(userId || category || subcategory)) { return res.status(400).send({ status: false, message: "You have to put the value for userId or category or subcategory if you want to use one of these fields." }) }

        if (userId) {
            if (!ObjectId.isValid(userId)) { return res.status(400).send({ status: false, message: `This userID: ${userId} is not Valid.` }) }
        }

        let obj = {
            userId: userId,
            category: category,
            subcategory: subcategory,
            isDeleted: false
        }

        let getDataByQuery = await bookModel.find(obj).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })
        if (getDataByQuery.length == 0) { return res.status(400).send({ status: false, message: "Given data is not exist." }) }

        return res.status(200).send({ status: true, message: 'Books list', data: getDataByQuery })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}


const getBookFromId = async (req, res) => {
    try {
        let bookId = req.params.bookId;

        if (!ObjectId.isValid(bookId)) { return res.status(400).send({ status: false, message: `This BookId: ${bookId} is not Valid.` }) }

        let result = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ deletedAt: 0, ISBN: 0, __v: 0 });
        if (!result) { return res.status(400).send({ status: false, message: "Given data is not exist." }) }

        let reviewsData = await reviewModel.find({ bookId: bookId, isDeleted: false })
        // if (result.reviews == 0) result._doc.reviewsData = [];
        result._doc.reviewData = reviewsData


        res.status(200).send({ status: true, message: 'Books List', data: result })
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
}




module.exports = { createBook, getAllBooks, getBookFromId }