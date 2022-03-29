const mongoose = require("mongoose");

const commentsSchema = mongoose.Schema({
    boardIdx: {
        type: Number,
        required: true,
    },
    commentIdx: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    // createDate: {
    //     type: Date,
    //     required: true,
    // },
});

module.exports = mongoose.model("Comment", commentsSchema);