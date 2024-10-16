// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyCbg8thEU861dquzK7hhau2Ul32JG8KW_c",
  authDomain: "ushop-386107.firebaseapp.com",
  projectId: "ushop-386107",
  storageBucket: "ushop-386107.appspot.com",
  messagingSenderId: "900258257600",
  appId: "1:900258257600:web:4e21ad37959ea39753ab25",
  measurementId: "G-6NB8HY89DZ",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
 // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});