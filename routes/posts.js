const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Helper: generate a URL-safe slug and make it unique
async function generateSlug(title) {
  let base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  let slug = base;
  let count = 1;
  while (await Post.exists({ slug })) {
    slug = `${base}-${count++}`;
  }
  return slug;
}

// GET /api/posts  — with optional pagination & tag filter
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag.toLowerCase();

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "username")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/posts/:slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("author", "username")
      .lean();
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/posts  (auth required)
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const slug = await generateSlug(title);
    const post = await Post.create({
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      slug,
      author: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/posts/:id  (auth + ownership required)
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorised to edit this post" });
    }

    const { title, content, tags } = req.body;

    // Regenerate slug only if title changed
    if (title && title !== post.title) {
      post.slug = await generateSlug(title);
    }
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : [];

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/posts/:id  (auth + ownership required)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorised to delete this post" });
    }

    await Promise.all([
      post.deleteOne(),
      Comment.deleteMany({ post: post._id }), // cascade-delete comments
    ]);

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

module.exports = router;
