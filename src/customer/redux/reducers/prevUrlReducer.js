import { createSlice } from "@reduxjs/toolkit";

const prevUrlSlice = createSlice({
  name: "prevUrl",
  initialState: {
    prevUrl: "/",
  },
  reducers: {
    setPrevUrl: (state, action) => {
      state.prevUrl = action.payload;
    },
  },
});

export const { setPrevUrl } = prevUrlSlice.actions;
export default prevUrlSlice.reducer;
