const mongoose = require("mongoose");
//password hashing module
// const crypto = require('crypto');


const boardsSchema = mongoose.Schema({
    boardIdx: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createDate: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Board", boardsSchema);