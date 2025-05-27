import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchPrompts = createAsyncThunk(
  'prompts/fetchPrompts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/prompts');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPrompt = createAsyncThunk(
  'prompts/createPrompt',
  async ({ content, tags }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/prompts', { content, tags });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePrompt = createAsyncThunk(
  'prompts/deletePrompt',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/prompts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const enhancePrompt = createAsyncThunk(
  'prompts/enhancePrompt',
  async (content, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/prompts/enhance', { prompt: content });
      return response.data.enhancedPrompt;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enhance prompt');
    }
  }
);

const initialState = {
  prompts: [],
  enhancedContent: '',
  loading: false,
  error: null,
  sortBy: 'newest',
  filterTags: [],
};

const promptSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setFilterTags: (state, action) => {
      state.filterTags = action.payload;
    },
    clearEnhancedContent: (state) => {
      state.enhancedContent = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = action.payload;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch prompts';
      })
      .addCase(createPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts.unshift(action.payload);
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create prompt';
      })
      .addCase(deletePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = state.prompts.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete prompt';
      })
      .addCase(enhancePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enhancePrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.enhancedContent = action.payload;
      })
      .addCase(enhancePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to enhance prompt';
      });
  },
});

export const {
  setSortBy,
  setFilterTags,
  clearEnhancedContent,
  clearError,
} = promptSlice.actions;

export default promptSlice.reducer; 