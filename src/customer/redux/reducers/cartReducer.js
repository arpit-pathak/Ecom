// cartReducer.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    cartQuantity: 0,
    cartState: false,
    selectedItems: [],
    // checkoutItems: [],
  },
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    // setCheckoutItems: (state, action) => {
    //   state.checkoutItems = action.payload;
    // },
    retrieveCartQuantity: (state) => {
      let count = 0;
      for (let sellerID in state.cartItems) {
        if(!isNaN(sellerID)){
          for (let item in state.cartItems[sellerID]) {
            if (!isNaN(item)) {
              count += 1;
            }
          }
        }
      }
      state.cartQuantity = count;
    },
    setCartState: (state) => {
      state.cartState = true;
    },
  },
});

//export actions / functions
export const {
  retrieveCartQuantity,
  setCartItems,
  setSelectedItems,
  setCartState,
  setCheckoutItems,
} = cartSlice.actions;

//export reducer
export default cartSlice.reducer;
