import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface SelectedState {
  value: string[];
}

const initialState: SelectedState = { value: [] };
const selectedSlice = createSlice({
  name: "selected",
  initialState,
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
