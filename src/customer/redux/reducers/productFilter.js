import {createslice} from '@reduxjs/toolkit';

const productFilterSlice = createslice({
    name: 'productFilter',
    initialState: {
        list_length: "20",
        page: "1",
        category_id: "",
        search: "",
        id_status: "",
        shipping_id: "",
        star_rating: "",
        brand_id: "",
        price_range: ""
    },
    reducer:{
        addToFilterData:(state,action)=>{
            if (action.payload.which === "list_length") {
                state.list_length = action.payload;
                return;
              }
              if (action.payload.which === "page") {
                state.page = action.payload;
                return;
              }
              if (action.payload.which === "search") {
                state.search = action.payload;
                state.category_id = "";
                return;
              }
              if (action.payload.which === "category_id" && state.category_id !== action.payload) {
                state.category_id = action.payload;
                return;
              }
              if (action.payload.which === "shipping_id") {
                state.shipping_id = action.payload;
                return;
              }
              if (action.payload.which === "price_range") {
                state.price_range = action.payload;
                return;
              }
              if (action.payload.which === "star_rating") {
                state.star_rating = action.payload;
                return;
              }
              if (action.payload.which === "brand_id") {
                state.brand_id = action.payload;
                return;
              }
              if (action.payload.which === "id_status") {
                state.id_status = action.payload;
                return;
              }
        }
    }
})

 