import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./customer/redux/reducers/cartReducer";
import accountOverviewReducer from "./customer/redux/reducers/AcountOverviewReducer";
import categoryReducer from "./customer/redux/reducers/categoryReducer";
import addressReducer from "./customer/redux/reducers/addressReducer";
import voucherReducer from "./customer/redux/reducers/voucher";
import profileReducer from "./customer/redux/reducers/profileReducer";
import prevUrlReducer from "./customer/redux/reducers/prevUrlReducer";
import orderListReducer from "./admin/redux/orderListReducer";

//persistent store
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Choose your storage engine
import checkoutReducer from "./customer/redux/reducers/checkoutReducer";

const persistConfig = {
  key: 'root',
  storage, 
};

const orderListConfig = {
  key: 'orderList',
  storage
}

//redux store
const persistedReducer = persistReducer(persistConfig, checkoutReducer);
const persistedOrderListReducer = persistReducer(orderListConfig, orderListReducer);

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
    orderList: persistedOrderListReducer,
  },
});

const persistor = persistStore(store);

export { store, persistor };

