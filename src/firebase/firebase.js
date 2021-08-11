import firebase from "firebase";

var firebaseConfig = {
    apiKey: "AIzaSyDsOlP2febwsRdCoj_5VVLtQio9VOL-QkU",
    authDomain: "ytmusic-clone.firebaseapp.com",
    projectId: "ytmusic-clone",
    storageBucket: "ytmusic-clone.appspot.com",
    messagingSenderId: "250950387255",
    appId: "1:250950387255:web:58db6ca91f6ebc37cae1b2",
    measurementId: "G-FLSQRV1XC3",
    databaseURL: 'https://ytmusic-clone-default-rtdb.firebaseio.com/'
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export const db = firebase.database();