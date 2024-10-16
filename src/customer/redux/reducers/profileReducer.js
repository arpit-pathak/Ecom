import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile_pic: "",
    retrieveProfile: true,
  },
  reducers: {
    setProfilePic: (state, action) => {
      state.profile_pic = action.payload;
    },
    setRetrieveProfile: (state, action) => {
      state.retrieveProfile = action.payload;
    },
  },
});

export const { setProfilePic, setRetrieveProfile } = profileSlice.actions;
export default profileSlice.reducer;
