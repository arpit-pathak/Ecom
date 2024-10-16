import { createSlice } from "@reduxjs/toolkit";

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    unclaimedShopVouchers: "",
    unclaimedUshopVouchers: "",
    claimedShopVouchers: "",
    claimedUshopVouchers: "",
    sellerID: "",
  },
  reducers: {
    setUnclaimedShopVouchers: (state, action) => {
      state.unclaimedShopVouchers = action.payload;
    },
    setUnclaimedUshopVouchers: (state, action) => {
      state.unclaimedUshopVouchers = action.payload;
    },
    setclaimedShopVouchers: (state, action) => {
      state.claimedShopVouchers = action.payload;
    },
    setclaimedUshopVouchers: (state, action) => {
      state.claimedUshopVouchers = action.payload;
    },
    setSellerID: (state, action) => {
      state.sellerID = action.payload;
    },
  },
});

export const {
  setUnclaimedShopVouchers,
  setUnclaimedUshopVouchers,
  setclaimedShopVouchers,
  setclaimedUshopVouchers,
  setSellerID,
} = voucherSlice.actions;
export default voucherSlice.reducer;
