import { createSlice } from "@reduxjs/toolkit";

const selectedSlice = createSlice({
  name: "selected",
  initialState: {
    value: [],
  },
  reducers: {
    setSelected: (state, action) => {
      state.value = action.payload;
    },
    clearSelected: (state) => {
      state.value = [];
    },
  },
});

export const { setSelected, clearSelected } = selectedSlice.actions;
export default selectedSlice.reducer;
