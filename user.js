/**
 * Title: user.js
 * Author: Kailee Stephens 
 * Date: 07/15/2022
 * Description: mongoose model  
 */

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    email: { type: String}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
