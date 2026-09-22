const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
