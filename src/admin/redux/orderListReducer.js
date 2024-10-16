import { createSlice } from "@reduxjs/toolkit";

const orderFilterSlice = createSlice({
    name: "orderList",
    initialState: {
        orderFilters: {},
    },
    reducers: {
        setFilterItems: (state, action) => {
            action.payload.forEach(({ key, value }) => {
                state.orderFilters = { ...state.orderFilters, [key]: value };
            });
        },
        clearFilterItems: (state) => {
            state.orderFilters = {};
        },
    },
});

export const { setFilterItems, clearFilterItems } = orderFilterSlice.actions;
export default orderFilterSlice.reducer;
