const mongoose = require("mongoose");

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