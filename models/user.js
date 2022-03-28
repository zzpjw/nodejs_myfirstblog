const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // email: String,
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
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