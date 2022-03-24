const mongoose = require("mongoose");
//password hashing module
const crypto = require('crypto');


const boardsSchema = mongoose.Schema({
    boardIdx: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        require:true,
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
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model("Board", boardsSchema);