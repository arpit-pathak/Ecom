import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    mainCategory: "",
    subCategoryName: "",
    mainCategoryID: "",
    categoryGroups: [],
    categories: [],
    SearchedImageFile: null,
  },
  reducers: {
    setMainCategory: (state, action) => {
      state.mainCategory = action.payload;
    },
    setSubCategoryName: (state, action) => {
      state.subCategoryName = action.payload;
    },
    setMainCategoryID: (state, action) => {
      state.mainCategoryID = action.payload;
    },
    setSearchedImageFile: (state, action) => {
      state.SearchedImageFile = action.payload;
    },
    setCategoryGroups: (state, action) => {
      state.categoryGroups = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
  },
});

export const {
  setMainCategory,
  setSubCategoryName,
  setMainCategoryID,
  setSearchedImageFile,
  setCategoryGroups,
  setCategories,
} = categorySlice.actions;
export default categorySlice.reducer;
