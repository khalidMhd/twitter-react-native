import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
let userInfo = null;
export const userInfoHandel = async () => {
    AsyncStorage.getItem('userInfo').then(res => {
         userInfo =  JSON.parse(res)
         return
      })
};

userInfoHandel();

export const instance = axios.create({
  baseURL: 'http://192.168.100.17:5000/api',
  // timeout: 800,
  headers: {
    Accept: 'application/json',
    Authorization:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2UxMjRjNzM3ZTI1NzM2MGNkZTY2OWUiLCJpYXQiOjE2NzgyOTAwMjh9.u0ISYmiBK8ayNefaLM9qL_RXRVrioskynxbl1WFziXY',
  },
});

export const baseURL = 'http://192.168.100.17:5000';
