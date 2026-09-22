const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// GET /api/comments/:postId
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/comments/:postId  (auth required)
router.post("/:postId", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    // Verify the post exists
    const postExists = await Post.exists({ _id: req.params.postId });
    if (!postExists) return res.status(404).json({ error: "Post not found" });

    const comment = await Comment.create({
      content: content.trim(),
      author: req.user.id,
      post: req.params.postId,
    });
    await comment.populate("author", "username");
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// DELETE /api/comments/:id  (auth + ownership required)
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorised to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

module.exports = router;
