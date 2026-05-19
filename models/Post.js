const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tags: [String],
    slug: { type: String, unique: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", PostSchema);
