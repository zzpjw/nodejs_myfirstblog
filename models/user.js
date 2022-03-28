const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // email: String,
    nickname: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
    salt: {
        type: String,
        require:true,
    },
});
UserSchema.virtual("userId").get(function () {
    return this._id.toHexString();
});
UserSchema.set("toJSON", {
    virtuals: true,
});

module.exports = mongoose.model("User", UserSchema);