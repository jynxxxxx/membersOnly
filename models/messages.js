const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true},
  post_date: { type: Date, default: Date.now },
});

MessageSchema.virtual("post_date_formatted").get(function () {
  return DateTime.fromJSDate(this.post_date).toISODate(); // format 'YYYY-MM-DD'
});

module.exports = mongoose.model("Message", MessageSchema);