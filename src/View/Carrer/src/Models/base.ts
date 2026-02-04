import axios, { AxiosInstance } from 'axios';
import { HIRE_BASE_URL } from './BaseUri';

// Function to get the JWT token securely (from localStorage, sessionStorage, or cookies)
const getJwtToken = (): string | null => {
  // For example, retrieving from localStorage
  return localStorage.getItem('jwt_token');
};

const jwt: string = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvbmVpZCI6IjEwNjg2NjE5Iiwib3JnX29uZWlkIjoiMTA4MjQ5NjEiLCJvcmdfbmFtZSI6IlRlc3RpbmdfSGFzc2FuIiwiZnVsbF91c2VybmFtZSI6Ikhhc3NhbiBSYXphIiwidXNlcl9lbWFpbCI6ImtrYW1pNTc1NDA0OUBnbWFpbC5jb20iLCJmdWxsX2RwIjoiaHR0cHM6XC9cL29uZWlkLnZlZXZvdGVjaC5jb21cL2RwXC9maWxlc1wvNGQ1NDQxMzI0ZjQ0NTkzMjRkNTQ2YjNkLURFRkFVTFQuanBlZyIsInJlY29yZF9pZCI6IkRFRkFVTFQiLCJhY2Nlc3NfdG9rZW4iOiJhOTk3OTc4ODdtMzEwMjIxMzk5MWVlNzY1Mzc3ODhiZTI5ZGZlN2M1OTAzNzA0Y2Y3NGFjOGJiMDg4NyIsImF1ZCI6IkQ4emd0S0Q4aEE5TUsiLCJyb2xlX2lkIjoiQWRtaW4iLCJyb2xlX2RiX2lkIjoiMTMiLCJvdGhlcl9wZXJtaXNzaW9ucyI6bnVsbCwiYWxsb3dlZF9hcHBfdG9rZW4iOiI2NGQ2YmQ4NjJmMzU3ODM4MWZlYTU3MzFjIiwiaWF0IjoxNzU0MDI1MTAwLCJleHAiOjE3NTQxMTE1MDAsIm9yZ19kYXRhIjp7Il9pZCI6MTA4MjQ5NjEsInVzZXJfb25laWQiOjEwNjg2NjE5LCJvcmdfbmFtZSI6IlRlc3RpbmdfSGFzc2FuIiwib3JnX3R5cGUiOjE1OCwibnRuX25vIjoiMzIyMDI1NTQ3NDY2MSIsIm9yZ19icmZfaW50cm8iOiJUaGlzIGlzIFRlc3Rpbmcgb3JnIiwidXNlcl9jb250YWN0IjoiMDMwNDc5NDkzMzIiLCJlbWFpbCI6ImtrYW1pNTc1NDA0OUBnbWFpbC5jb20iLCJhZGRyZXNzIjoiSXNsYW1hYmFkIEcxMiIsImNvdW50cnlfaWQiOjE2MiwiY2l0eV9pZCI6ODU4MjgsImNvdW50cnlfY29kZSI6IlBLIn0sIm9uZWlkX3JvbGVfcGVybWlzc2lvbnMiOiJUZXN0X1Blcm1pc3Npb24ifQ.LPRcBMDej9s9q9nTXddHUkGib-Ar1EyctwGricd2hUM";

// Create axios instance with dynamic JWT token
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: HIRE_BASE_URL, 
  headers: {
    'Authorization': `Bearer ${jwt}`,
  },
});

// Create axios instance for hire API (same as main instance for now)
export const axiosInstanceHire: AxiosInstance = axios.create({
  baseURL: HIRE_BASE_URL, 
  headers: {
    'Authorization': `Bearer ${jwt}`,
  },
});

// Add request interceptor to dynamically set JWT token
axiosInstance.interceptors.request.use((config) => {
  const token = getJwtToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstanceHire.interceptors.request.use((config) => {
  const token = getJwtToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


