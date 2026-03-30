import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  analyzeTicketApi,
  fetchTicketsApi,
  loginApi,
  updateTicketStatusApi
} from "../api/ticketsApi";

const initialState = {
  tickets: [],
  latestResult: null,
  loadingTickets: false,
  submitting: false,
  error: ""
};

export const loadTickets = createAsyncThunk("tickets/loadTickets", async (params) => {
  return fetchTicketsApi(params || {});
});

export const submitTicketForAnalysis = createAsyncThunk(
  "tickets/submitTicketForAnalysis",
  async (payload, { dispatch }) => {
    const { reloadParams, ...ticketPayload } = payload || {};
    const result = await analyzeTicketApi(ticketPayload);
    await dispatch(loadTickets(reloadParams || {}));
    return result;
  }
);

export const loginUser = createAsyncThunk("tickets/loginUser", async (payload) => {
  return loginApi(payload);
});

export const updateTicketStatus = createAsyncThunk(
  "tickets/updateTicketStatus",
  async ({ ticketId, status, reloadParams }, { dispatch }) => {
    await updateTicketStatusApi(ticketId, status);
    await dispatch(loadTickets(reloadParams || {}));
    return { ticketId, status };
  }
);

const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    clearError(state) {
      state.error = "";
    },
    setError(state, action) {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTickets.pending, (state) => {
        state.loadingTickets = true;
        state.error = "";
      })
      .addCase(loadTickets.fulfilled, (state, action) => {
        state.loadingTickets = false;
        state.tickets = action.payload;
      })
      .addCase(loadTickets.rejected, (state, action) => {
        state.loadingTickets = false;
        state.error = action.error.message || "Failed to load tickets";
      })
      .addCase(submitTicketForAnalysis.pending, (state) => {
        state.submitting = true;
        state.error = "";
      })
      .addCase(submitTicketForAnalysis.fulfilled, (state, action) => {
        state.submitting = false;
        state.latestResult = action.payload;
      })
      .addCase(submitTicketForAnalysis.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Unable to analyze ticket";
      })
      .addCase(loginUser.pending, (state) => {
        state.error = "";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message || "Login failed";
      })
      .addCase(updateTicketStatus.pending, (state) => {
        state.error = "";
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update ticket status";
      });
  }
});

export const { clearError, setError } = ticketsSlice.actions;

export default ticketsSlice.reducer;
