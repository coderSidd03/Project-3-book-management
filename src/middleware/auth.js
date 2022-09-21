const JWT = require('jsonwebtoken')
const userModel = require("../model/userModel")
const { checkString, validateId } = require('../Validator/validator')
const ObjectId = require('mongoose').Types.ObjectId


const Authentication = async (req, res, next) => {
    try {

        let token = req.headers['x-api-key']
        if (!token) { return res.status(400).send({ status: false, message: "Token must be Present." }) }

        JWT.verify(token, "We-are-from-Group-16", function (error, decodedToken) {
            if (error) {
                return res.status(401).send({ status: false, message: "Invalid Token." })
            } else {
                req.token = decodedToken
                next()
            }

        })

    } catch (error) {

        res.status(500).send({ status: 'error', error: error.message })
    }

}

const Authorisation = async (req, res, next) => {

    try {

        let userIdFromToken = req.token.payload.userId;

        let bookId = req.params.bookId;

        if (!validateId(bookId)) return res.status(400).send({ status: false, message: "Book Id is invalid in url!!!!" })

        let findBook = await bookModel.findById(bookId)
        if (!findBook) return res.status(400).send({ status: false, message: "book id is invalid in url!!!" })

        let userIdFromBook = findBook.userId

        if (userIdFromBook != userIdFromToken) {
            return res.status(403).send({ status: false, message: "You are not authorized to Do this Task ..." })
        }

        next()
    } catch (err) {
        return res.status(500).send({ status: false, Error: err.message })
    }

}

module.exports = { Authentication, Authorisation }