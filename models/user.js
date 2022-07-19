/**
 * Title: user.js
 * Author: Kailee Stephens 
 * Date: 07/15/2022
 * Description: mongoose model  
 */

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
