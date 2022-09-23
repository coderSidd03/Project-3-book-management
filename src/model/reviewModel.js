//=====================Importing Packages=====================//
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

//=====================Creating Review's Schema=====================//
const reviewModel = new mongoose.Schema({

    bookId: {
        type: ObjectId,
        require: true,
        ref: "Book"
    },
    reviewedBy: {
        type: String,
        require: true,
        default: 'Guest',
        trim:true
    },
    reviewedAt: {
        type: Date,
        require: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        require: true
    },
    review: {
        type: String,
        trim:true

    },
    isDeleted: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });


//=====================Module Export=====================//
module.exports = mongoose.model('Review', reviewModel);