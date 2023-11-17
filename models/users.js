const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    member_status: { type: String, required: true, default: false }
  })

  module.exports = mongoose.model("User", UserSchema);
