import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { config } from '../../config/config';

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

// Get all contact submissions
export const getContactSubmissions = createAsyncThunk('adminContact/getSubmissions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/contact');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch contact submissions');
  }
});

// Get contact statistics
export const getContactStats = createAsyncThunk('adminContact/getStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/contact/stats');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to fetch contact statistics');
  }
});

// Update submission status
export const updateSubmissionStatus = createAsyncThunk('adminContact/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/contact/${id}/status`, { status });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to update status');
  }
});

// Mark as replied
export const markAsReplied = createAsyncThunk('adminContact/markReplied', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/contact/${id}/reply`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to mark as replied');
  }
});

// Archive submission
export const archiveSubmission = createAsyncThunk('adminContact/archive', async (id, { rejectWithValue }) => {
  try {
    const response = await api.put(`/contact/${id}/archive`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to archive submission');
  }
});

// Delete submission
export const deleteSubmission = createAsyncThunk('adminContact/deleteSubmission', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/contact/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || 'Failed to delete submission');
  }
});

const adminContactSlice = createSlice({
  name: 'adminContact',
  initialState: {
    submissions: [],
    stats: {},
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
      // Get submissions
      .addCase(getContactSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactSubmissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.submissions = payload?.data?.contacts || (Array.isArray(payload) ? payload : []);
      })
      .addCase(getContactSubmissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get stats
      .addCase(getContactStats.fulfilled, (state, { payload }) => {
        state.stats = payload;
      })
      // Update status
      .addCase(updateSubmissionStatus.fulfilled, (state, { payload }) => {
        const index = state.submissions.findIndex((sub) => sub._id === payload._id);
        if (index !== -1) {
          state.submissions[index] = payload;
        }
        state.success = 'Status updated successfully';
      })
      .addCase(updateSubmissionStatus.rejected, (state, { payload }) => {
        state.error = payload;
      })
      // Mark as replied
      .addCase(markAsReplied.fulfilled, (state, { payload }) => {
        const index = state.submissions.findIndex((sub) => sub._id === payload._id);
        if (index !== -1) {
          state.submissions[index] = payload;
        }
        state.success = 'Marked as replied';
      })
      .addCase(markAsReplied.rejected, (state, { payload }) => {
        state.error = payload;
      })
      // Archive submission
      .addCase(archiveSubmission.fulfilled, (state, { payload }) => {
        const index = state.submissions.findIndex((sub) => sub._id === payload._id);
        if (index !== -1) {
          state.submissions[index] = payload;
        }
        state.success = 'Submission archived';
      })
      .addCase(archiveSubmission.rejected, (state, { payload }) => {
        state.error = payload;
      })
      // Delete submission
      .addCase(deleteSubmission.fulfilled, (state, { payload: id }) => {
        state.submissions = state.submissions.filter((sub) => sub._id !== id);
        state.success = 'Submission deleted successfully';
      })
      .addCase(deleteSubmission.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const { clearError, clearSuccess } = adminContactSlice.actions;
export default adminContactSlice.reducer; 