import { createSlice } from '@reduxjs/toolkit';

const accountOverviewSlice = createSlice({
    name: 'accountOverview',
    initialState: {
        activeButton: "My Account",
    },
    reducers: {
        setActiveButton: (state, action) => {
            state.activeButton = action.payload;
        }
    },
});

export const { setActiveButton } = accountOverviewSlice.actions;
export default accountOverviewSlice.reducer;