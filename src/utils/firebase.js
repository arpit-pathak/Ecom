// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import ls from "local-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
//ushop staging
const firebaseConfig = {
  apiKey: "AIzaSyCbg8thEU861dquzK7hhau2Ul32JG8KW_c",
  authDomain: "ushop-386107.firebaseapp.com",
  projectId: "ushop-386107",
  storageBucket: "ushop-386107.appspot.com",
  messagingSenderId: "900258257600",
  appId: "1:900258257600:web:4e21ad37959ea39753ab25",
  measurementId: "G-6NB8HY89DZ",
};

if (!getApps().length) {
  // Initialize Firebase
  initializeApp(firebaseConfig);
}
//initializing services
export const auth = getAuth();
export const USHOP_VAPID_KEY = "BKNr6uIIXI2l2mxNOXpITcbR_eEPUHqtknn9fzsZ1oLJiWrFuqJ3otktZZmluy0M8Qk5xu3hUPycbDsITV52bik"
export const USHOP_API_KEY = "AIzaSyCbg8thEU861dquzK7hhau2Ul32JG8KW_c";

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      const messaging = getMessaging();
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });

  
export const requestForToken = () => {
  if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
    const messaging = getMessaging();
    return getToken(messaging, { vapidKey: USHOP_VAPID_KEY })
      .then((currentToken) => {
        if (currentToken) {
          ls("deviceToken", currentToken);
          // Perform any other neccessary action with the token
        } else {
          // Show permission request UI
          console.log('No registration token available. Request permission to generate one.');
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
    }else ls("deviceToken", "");
};
  




  //uparcel firebase - used during dev (works for staging; firebase proj missing; so created above one)
  /*
  apiKey: "AIzaSyBNeXR58n2E6_2LQyrRmuu19ic0KHfNSzU",
  authDomain: "ushopstg.firebaseapp.com",
  projectId: "ushopstg",
  storageBucket: "ushopstg.appspot.com",
  messagingSenderId: "586939555231",
  appId: "1:586939555231:web:1a4823f54e728d311771aa",
  measurementId: "G-2MRPNHQP6V"
  */

  // moses account
  /*
    apiKey: "AIzaSyBoYDXPSKf4HFS4JPZECpXsm4jVsSUcFVk",
    authDomain: "fir-auth-36433.firebaseapp.com",
    projectId: "fir-auth-36433",
    storageBucket: "fir-auth-36433.appspot.com",
    messagingSenderId: "241259993577",
    appId: "1:586939555231:web:1a4823f54e728d311771aa",
    measurementId: "1:241259993577:web:108af6a2295d3d79dcd378"
    */