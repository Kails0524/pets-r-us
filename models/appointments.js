// <!-- Title: appointments.js
//Author: Kailee Stephens 
//Date: 07/20/2020
//Description: Week 8 Pets-R-Us appointment model 
//code from github FMS buwebdev/web-340

const mongoose = require("mongoose");

let appointSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  firstName: { type: String, require: true},
  lastName: { type: String, require: true},
  service: { type: String, require: true},
  email: { type: String, require: true },
});

module.exports = mongoose.model("Appointments", appointSchema);