import { configureStore } from "@reduxjs/toolkit";
import selectedReducer from "./selectedSlice";

export const store = configureStore({
  reducer: {
    selected: selectedReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
