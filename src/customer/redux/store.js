import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducers/cartReducer";
import accountOverviewReducer from "./reducers/AcountOverviewReducer";
import categoryReducer from "./reducers/categoryReducer";
import addressReducer from "./reducers/addressReducer";
import voucherReducer from "./reducers/voucher";
import profileReducer from "./reducers/profileReducer";
import prevUrlReducer from "./reducers/prevUrlReducer";

//persistent store
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Choose your storage engine
import checkoutReducer from "./reducers/checkoutReducer";

const persistConfig = {
  key: 'root',
  storage, 
};
//redux store

const persistedReducer = persistReducer(persistConfig, checkoutReducer);
const store =  configureStore({
  reducer: {
    cart: cartReducer,
    accountOverview: accountOverviewReducer,
    category: categoryReducer,
    address: addressReducer,
    voucher: voucherReducer,
    profile: profileReducer,
    prevUrl: prevUrlReducer,
    checkout: persistedReducer, // Use the persisted reducer
  },
});

const persistor = persistStore(store);

export { store, persistor };
// const persistor = persistStore(store);

// export { store };

