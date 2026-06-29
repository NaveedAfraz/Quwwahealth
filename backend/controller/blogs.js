const db = require("../db");
const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      status = "published",
      tags,
      featured_image_url,
      headings = [],
    } = req.body;
    console.log(req.body);
    // Basic validation
    if (!title || !content || !category) {
      return res.status(400).json({
        message: "Title, content, and category are required.",
        success: false,
      });
    }

    // Insert blog
    const [blogResult] = await db.query(
      `INSERT INTO blogs (
        title, content, category, status, tags, featured_image_url
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        category,
        status,
        JSON.stringify(tags || []),
        featured_image_url || "",
      ]
    );

    const blogId = blogResult.insertId;

    // Insert headings if provided
    if (Array.isArray(headings) && headings.length > 0) {
      const headingValues = headings
        .filter((h) => h.title || h.content) // Avoid empty rows
        .map((h) => [blogId, h.title || "", h.content || ""]);

      if (headingValues.length > 0) {
        await db.query(
          `INSERT INTO blog_headings (blog_id, heading_title, heading_content) VALUES ?`,
          [headingValues]
        );
      }
    }

    const [newBlog] = await db.query("SELECT * FROM blogs WHERE id = ?", [
      blogId,
    ]);

    return res.status(201).json({
      message: "Blog created successfully",
      blog: newBlog[0],
      success: true,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    return res.status(500).json({
      message: "Failed to create blog",
      success: false,
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    // Fetch all blogs
    const [blogs] = await db.query("SELECT * FROM blogs");

    if (!blogs || blogs.length === 0) {
      return res.status(200).json({
        message: "Blogs fetched successfully",
        blogs: [],
        success: true,
      });
    }

    // Fetch all headings for these blogs
    const [blogHeadings] = await db.query(
      "SELECT * FROM blog_headings WHERE blog_id IN (?)",
      [blogs.map((b) => b.id)]
    );

    // Group headings by blog_id
    const headingMap = {};
    blogHeadings.forEach((heading) => {
      const blogId = heading.blog_id;
      if (!headingMap[blogId]) {
        headingMap[blogId] = [];
      }
      headingMap[blogId].push({
        id: heading.id,
        title: heading.heading_title,
        content: heading.heading_content,
      });
    });

    // Attach headings to each blog
    const blogsWithHeadings = blogs.map((blog) => ({
      ...blog,
      tags: safeParse(blog.tags),
      headings: headingMap[blog.id] || [],
    }));

    return res.status(200).json({
      message: "Blogs fetched successfully",
      blogs: blogsWithHeadings,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch blogs",
      success: false,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      status = "published",
      tags,
      featured_image_url,
      headings = [], // <-- receive headings from frontend
    } = req.body;

    const blogId = req.params.id;

    if (!title || !content || !category) {
      return res.status(400).json({
        message: "Title, content, and category are required.",
      });
    }

    // Update the blog
    await db.query(
      `UPDATE blogs SET 
        title = ?, 
        content = ?, 
        category = ?, 
        status = ?, 
        tags = ?, 
        featured_image_url = ?
      WHERE id = ?`,
      [
        title,
        content,
        category,
        status,
        typeof tags === "object" ? JSON.stringify(tags) : tags,
        featured_image_url,
        blogId,
      ]
    );

    // Update blog headings
    // 1. Delete old headings
    await db.query("DELETE FROM blog_headings WHERE blog_id = ?", [blogId]);

    // 2. Insert new headings
    for (const heading of headings) {
      const { title, content } = heading;
      if (title || content) {
        await db.query(
          `INSERT INTO blog_headings (blog_id, heading_title, heading_content)
           VALUES (?, ?, ?)`,
          [blogId, title, content]
        );
      }
    }

    // Return updated blog and headings
    const [updatedBlogResult] = await db.query(
      "SELECT * FROM blogs WHERE id = ?",
      [blogId]
    );

    const [updatedHeadings] = await db.query(
      "SELECT id, heading_title AS title, heading_content AS content FROM blog_headings WHERE blog_id = ?",
      [blogId]
    );

    return res.status(200).json({
      message: "Blog and headings updated successfully",
      blog: {
        ...updatedBlogResult[0],
        tags: safeParse(updatedBlogResult[0].tags),
        headings: updatedHeadings,
      },
      success: true,
    });
  } catch (error) {
    console.error("Failed to update blog:", error);
    return res.status(500).json({
      message: "Failed to update blog",
      success: false,
    });
  }
};

const safeParse = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await db.query("DELETE FROM blogs WHERE id = ?", [
      req.params.id,
    ]);
    console.log(blog);
    const deletedblog = blog;
    const [deletedHeadings] = await db.query(
      "SELECT id, heading_title AS title, heading_content AS content FROM blog_headings WHERE blog_id = ?",
      [blog[0].id]
    );
    return res.status(200).json({
      message: "Blog deleted successfully",
      blog: deletedblog,
      headings: deletedHeadings,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to delete blog", success: false });
  }
};

const getBlogById = async (req, res) => {
  try {
    const [blog] = await db.query("SELECT * FROM blogs WHERE id = ?", [
      req.params.id,
    ]);
    if (!blog || blog.length === 0) {
      return res.status(404).json({
        message: "Blog not found",
        success: false
      });
    }
    const [headings] = await db.query(
      "SELECT id, heading_title AS title, heading_content AS content FROM blog_headings WHERE blog_id = ?",
      [blog[0].id]
    );
    console.log(blog);
    console.log(headings);
    return res.status(200).json({
      message: "Blog fetched successfully",
      blog: {
        ...blog[0],
        tags: safeParse(blog[0].tags),
        headings: headings,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in getBlogById:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch blog", success: false });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getBlogById,
};
