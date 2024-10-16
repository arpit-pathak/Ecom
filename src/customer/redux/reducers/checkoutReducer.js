import { createSlice } from "@reduxjs/toolkit";

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkoutItems: [],
  },
  reducers: {
    setCheckoutItems: (state, action) => {
      state.checkoutItems = action.payload;
    },
  },
});

export const { setCheckoutItems } = checkoutSlice.actions;
export default checkoutSlice.reducer;
