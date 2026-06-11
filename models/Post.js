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

// 🔴 Add these indexes for faster queries!
PostSchema.index({ slug: 1 }); // Index for slug lookup
PostSchema.index({ createdAt: -1 }); // Index for sorting by date
PostSchema.index({ author: 1 }); // Index for author queries

module.exports = mongoose.model("Post", PostSchema);
