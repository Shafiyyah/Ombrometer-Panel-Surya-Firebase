// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDgl1BB5mLsZJQvp5RmHgpJobm-vazHDPQ",
  authDomain: "ombrometerlora.firebaseapp.com",
  projectId: "ombrometerlora",
  storageBucket: "ombrometerlora.appspot.com",
  messagingSenderId: "649153519136",
  appId: "1:649153519136:web:8d5c64ab65dad8d40ae645",
  measurementId: "G-3F2R8WC4M5"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // Customize notification here
  const notificationTitle = payload.data.title;
  
  let notiftext= payload.data.body
  // let textArray = notiftext.split('&')
  // var date = new Date(parseInt(textArray[1]) * 1000);
  // const options = {
  //   dateStyle: 'medium',
  //   timeStyle: 'medium',
  // };
  // let formattedDate = date.toLocaleString('en-GB',options)
  // textArray[1]=formattedDate
  // let notif=''
  // for (let i=0;i<textArray.length;i++) {
  //   if (textArray[i]!= undefined) {
  //     notif= notif.concat(textArray[i])
  //   }
  // }

  const notificationOptions = {
    body: notiftext,
    icon: './logo.png',
    badge: './logo.png',
    vibrate: [300, 100, 400, 100, 300, 100, 400]
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});