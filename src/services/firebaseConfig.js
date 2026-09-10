import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 에서 복사한 값을 여기 붙여넣으세요.
const firebaseConfig = {
  apiKey: 'AIzaSyD7uC4EVwEp5MLIBDPqonZXg3aj99qwa1s',
  authDomain: 'fas-app-d42fd.firebaseapp.com',
  databaseURL: 'https://fas-app-d42fd-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'fas-app-d42fd',
  storageBucket: 'fas-app-d42fd.firebasestorage.app',
  messagingSenderId: '974972467361',
  appId: '1:974972467361:web:339b6f1da8bda186e758e0',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
