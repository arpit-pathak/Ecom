import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    addressToEdit: null,
    selectedAddress: null,
    whichForm: null,
  },
  reducers: {
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    setAddressToEdit: (state, action) => {
      state.addressToEdit = action.payload;
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
    setWhichForm: (state, action) => {
      state.whichForm = action.payload;
    },
  },
});

export const {
  setAddresses,
  setAddressToEdit,
  setSelectedAddress,
  setWhichForm,
} = addressSlice.actions;
export default addressSlice.reducer;
