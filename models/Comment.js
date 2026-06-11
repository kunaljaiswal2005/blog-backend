const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true },
);

// 🔴 Add these indexes!
CommentSchema.index({ post: 1 }); // Index for finding comments by post
CommentSchema.index({ author: 1 }); // Index for finding comments by author

module.exports = mongoose.model("Comment", CommentSchema);
