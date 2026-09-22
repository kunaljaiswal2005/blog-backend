const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 50000 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    slug: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

// Full-text search index on title + content
PostSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", PostSchema);
