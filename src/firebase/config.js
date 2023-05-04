import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  // Your Firebase configuration from the Firebase console
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');

export { auth, microsoftProvider };
