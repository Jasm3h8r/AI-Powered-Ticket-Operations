import { configureStore } from "@reduxjs/toolkit";
import ticketsReducer from "./ticketsSlice";

export const store = configureStore({
  reducer: {
    tickets: ticketsReducer
  }
});
