import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { config } from "../../config/config";

const api = axios.create({
  baseURL: config.API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/') && config.baseURL) {
    config.url = `${config.baseURL}${config.url}`;
    config.baseURL = undefined;
  }
  return config;
});

// Get single blog by ID
export const getBlogById = createAsyncThunk(
  "blog/getBlogById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch blog post"
      );
    }
  }
);
// Get all blogs for admin
export const getAdminBlogs = createAsyncThunk(
  "blog/getAdminBlogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/blogs/admin/all");
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Failed to fetch blogs");
    }
  }
);

// Create new blog
export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (blogData, { rejectWithValue }) => {
    console.log(blogData);
    try {
      const response = await api.post("/blogs", blogData);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(
        "An unexpected error occurred while creating the blog."
      );
    }
  }
);

// Update blog
export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue(
        "An unexpected error occurred while updating the blog."
      );
    }
  }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/blogs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete blog");
    }
  }
);

// Get blog categories
export const getAllBlogs = createAsyncThunk(
  "blog/getAllBlogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/blogs/all");
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch categories"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState: {
    blogs: [],
    currentBlog: null,
    categories: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get single blog by ID
      .addCase(getBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentBlog = null;
      })
      .addCase(getBlogById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentBlog = payload?.data || payload;
      })
      .addCase(getBlogById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get admin blogs
      .addCase(getAdminBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminBlogs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.blogs =
          payload?.data?.blogs ||
          payload.blogs ||
          (Array.isArray(payload) ? payload : []);
      })
      .addCase(getAdminBlogs.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createBlog.fulfilled, (state, { payload }) => {
        state.loading = false;
        console.log(payload);
        const newBlog = payload?.data?.blog || payload.blog || payload;
        if (newBlog?._id) {
          state.blogs.push(newBlog);
          state.success = payload.message || "Blog created successfully";
        } else {
          state.error =
            "Received an invalid response from the server after creating the blog.";
        }
      })
      .addCase(createBlog.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = null;
      })
      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBlog.fulfilled, (state, { payload }) => {
        state.loading = false;
        const updatedBlogData = payload?.data?.blog || payload.blog || payload;

        if (updatedBlogData?._id) {
          const index = state.blogs.findIndex(
            (blog) => blog._id === updatedBlogData._id
          );
          if (index !== -1) {
            // Preserve existing category if not present in the response
            const category =
              updatedBlogData.category || state.blogs[index].category;
            state.blogs[index] = {
              ...state.blogs[index],
              ...updatedBlogData,
              category,
            };
          }
          state.success = payload.message || "Blog updated successfully";
        } else {
          state.error =
            "Received an invalid response from the server after updating the blog.";
        }
      })
      .addCase(updateBlog.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, { payload: deletedId }) => {
        state.loading = false;
        // Handle both 'id' and '_id' cases for blog identification
        state.blogs = state.blogs.filter((blog) => {
          // Check both 'id' and '_id' properties to find a match
          const blogId = blog.id || blog._id;
          return blogId != deletedId; // Use loose equality to handle string/number mismatches
        });
        state.success = "Blog deleted successfully";
      })
      .addCase(deleteBlog.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to delete blog. Please try again.";
      })
      // Get all blogs
      .addCase(getAllBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBlogs.fulfilled, (state, { payload }) => {
        // Handle various possible API response structures for categories
        console.log(payload);
        state.blogs =
          payload?.data?.blogs ||
          payload.blogs ||
          (Array.isArray(payload) ? payload : []);
          state.loading = false;
      })
      .addCase(getAllBlogs.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearError, clearSuccess } = blogSlice.actions;
export default blogSlice.reducer;
